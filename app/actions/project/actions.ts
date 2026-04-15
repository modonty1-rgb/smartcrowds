'use server';

import { prisma } from '@/lib/prisma';
import { projectSchema, projectImageSchema, type ProjectInput, type ProjectImageInput } from '@/lib/validations/project';
import { revalidatePath } from 'next/cache';
import { ZodError, z } from 'zod';
import { generateSlug } from '@/lib/utils/slug';

async function ensureUniqueSlug(baseSlug: string) {
  let uniqueSlug = baseSlug.trim();

  if (!uniqueSlug) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    uniqueSlug = `project-${timestamp}-${random}`;
  }

  const normalizedBase = uniqueSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.project.findUnique({
      where: { slug: uniqueSlug },
    });

    if (!existing) {
      return uniqueSlug;
    }

    uniqueSlug = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }
}

// Project Actions
export async function createProject(data: Omit<ProjectInput, 'slug'> & { slug?: string }) {
  try {
    const locale = data.locale || 'en';

    const preferredSlugSource = data.nameAr ?? data.name ?? '';
    const initialSlug = generateSlug(
      preferredSlugSource.trim().length > 0
        ? preferredSlugSource
        : data.slug ?? ''
    );

    const slug = await ensureUniqueSlug(initialSlug);

    // Use safeParse to handle validation errors gracefully
    const validationResult = projectSchema.safeParse({
      ...data,
      slug,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { error: `Validation failed: ${errors}` };
    }

    const validated = validationResult.data;

    // Ensure name is never empty - use nameAr as fallback if name is empty
    const finalName = (validated.name && validated.name.trim())
      ? validated.name.trim()
      : (validated.nameAr && validated.nameAr.trim()
        ? validated.nameAr.trim()
        : 'Untitled');

    const project = await prisma.project.create({
      data: {
        name: finalName,
        nameAr: validated.nameAr && validated.nameAr.trim() ? validated.nameAr.trim() : null,
        slug: validated.slug,
        description: validated.description,
        descriptionAr: validated.descriptionAr,
        featuredImage: validated.featuredImage || null,
        locale: validated.locale,
        seoTitle: validated.seoTitle,
        seoDescription: validated.seoDescription,
        keywords: validated.keywords,
        startDate: validated.startDate || null,
        endDate: validated.endDate || null,
        published: validated.published,
        featured: validated.featured,
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    revalidatePath('/projects');
    revalidatePath(`/projects/${project.slug}`);

    return { success: true, project };
  } catch (error) {
    console.error('Error creating project:', error);
    if (error instanceof ZodError) {
      const errors = error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { error: `Validation failed: ${errors}` };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to create project' };
  }
}

export async function updateProject(id: string, data: Partial<ProjectInput> & { slug?: string }) {
  try {
    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: 'Project not found' };
    }

    // Always regenerate slug from current name data (force update on every save)
    // Ignore provided slug and always regenerate to ensure it matches current name
    const nameSource = data.nameAr ?? data.name ?? existing.nameAr ?? existing.name ?? '';
    const initialSlug = generateSlug(nameSource);
    const slug = await ensureUniqueSlug(initialSlug);

    // Check if slug exists on another project (only if it changed)
    if (slug !== existing.slug) {
      const slugExists = await prisma.project.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        return { error: 'A project with this slug already exists' };
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) {
      // Ensure name is never empty - use nameAr as fallback if name is empty
      updateData.name = (data.name && data.name.trim())
        ? data.name.trim()
        : (data.nameAr && data.nameAr.trim())
          ? data.nameAr.trim()
          : existing.name || 'Untitled';
    }
    if (data.nameAr !== undefined) {
      updateData.nameAr = data.nameAr && data.nameAr.trim() ? data.nameAr.trim() : null;
    }
    // Always update slug to ensure it matches current name (force regeneration)
    updateData.slug = slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.descriptionAr !== undefined) updateData.descriptionAr = data.descriptionAr;
    if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage || null;
    if (data.locale !== undefined) updateData.locale = data.locale;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.keywords !== undefined) updateData.keywords = data.keywords;
    if (data.startDate !== undefined) updateData.startDate = data.startDate || null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate || null;
    if (data.published !== undefined) updateData.published = data.published;
    if (data.featured !== undefined) updateData.featured = data.featured;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    revalidatePath('/projects');
    revalidatePath(`/projects/${project.slug}`);

    return { success: true, project };
  } catch (error) {
    console.error('Error updating project:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update project' };
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath('/projects');
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { error: 'Failed to delete project' };
  }
}

export async function getProjects(options?: {
  locale?: string;
  published?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  try {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const where: { locale?: string; published?: boolean; featured?: boolean } = {};
    // Only filter by locale if explicitly provided and is a valid non-empty string
    if (options?.locale !== undefined && options.locale !== null && options.locale.trim() !== '') {
      where.locale = options.locale.trim().toLowerCase();
    }
    if (options?.published !== undefined) {
      where.published = options.published;
    }
    if (options?.featured !== undefined) {
      where.featured = options.featured;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1, // Only get first image for list view
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { projects: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
}

export async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return project;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export async function getProjectBySlug(slug: string, locale?: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project) {
      return null;
    }

    if (locale && project.locale !== locale) {
      return null;
    }

    return project;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

// Project Image Actions
export async function addProjectImage(projectId: string, data: ProjectImageInput) {
  try {
    // Get current max order for the project
    const maxOrder = await prisma.projectImage.aggregate({
      where: { projectId },
      _max: { order: true },
    });

    const order = (maxOrder._max.order ?? -1) + 1;

    const validated = projectImageSchema.parse({
      ...data,
      order,
    });

    const image = await prisma.projectImage.create({
      data: {
        projectId,
        imageUrl: validated.imageUrl,
        alt: validated.alt,
        altAr: validated.altAr,
        order: validated.order,
      },
    });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (project) {
      revalidatePath('/projects');
      revalidatePath(`/projects/${project.slug}`);
    }

    return { success: true, image };
  } catch (error) {
    console.error('Error adding project image:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to add project image' };
  }
}

export async function updateProjectImageOrder(projectId: string, imageIds: string[]) {
  try {
    // Update order for each image
    await Promise.all(
      imageIds.map((imageId, index) =>
        prisma.projectImage.update({
          where: { id: imageId },
          data: { order: index },
        })
      )
    );

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (project) {
      revalidatePath('/projects');
      revalidatePath(`/projects/${project.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating image order:', error);
    return { error: 'Failed to update image order' };
  }
}

export async function deleteProjectImage(imageId: string) {
  try {
    const image = await prisma.projectImage.findUnique({
      where: { id: imageId },
      include: { project: true },
    });

    if (!image) {
      return { error: 'Image not found' };
    }

    await prisma.projectImage.delete({
      where: { id: imageId },
    });

    revalidatePath('/projects');
    revalidatePath(`/projects/${image.project.slug}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting project image:', error);
    return { error: 'Failed to delete project image' };
  }
}

export async function updateProjectImage(imageId: string, data: Partial<ProjectImageInput>) {
  try {
    const updateData: Record<string, unknown> = {};
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.alt !== undefined) updateData.alt = data.alt;
    if (data.altAr !== undefined) updateData.altAr = data.altAr;
    if (data.order !== undefined) updateData.order = data.order;

    const image = await prisma.projectImage.update({
      where: { id: imageId },
      data: updateData,
      include: { project: true },
    });

    revalidatePath('/projects');
    revalidatePath(`/projects/${image.project.slug}`);

    return { success: true, image };
  } catch (error) {
    console.error('Error updating project image:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update project image' };
  }
}

