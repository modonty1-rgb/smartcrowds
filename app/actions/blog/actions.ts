'use server';

import { prisma } from '@/lib/prisma';
import { postSchema, type PostInput } from '@/lib/validations/blog';
import { revalidatePath } from 'next/cache';
import { calculateReadingTime } from '@/lib/utils/blog';
import { generateSlug } from '@/lib/utils/slug';

// Post Actions
export async function createPost(data: Omit<PostInput, 'slug'> & { slug?: string }) {
  try {
    // Generate slug from Arabic title first, then English, then use provided slug
    const slug = data.slug || generateSlug(data.titleAr || data.title || '');

    // Check if slug exists
    const existing = await prisma.post.findUnique({
      where: { slug },
    });

    if (existing) {
      return { error: 'A post with this slug already exists' };
    }

    const normalizedData = {
      ...data,
      titleAr: data.titleAr?.trim() ? data.titleAr : data.title || '',
      contentAr: data.contentAr?.trim() ? data.contentAr : data.content || '',
      slug,
    };

    const validated = postSchema.parse(normalizedData);

    const content = validated.contentAr || validated.content || '';
    const readingTime = calculateReadingTime(content);

    // Find or create author
    let author = await prisma.author.findFirst({
      where: { name: validated.authorName },
    });

    if (!author) {
      author = await prisma.author.create({
        data: {
          name: validated.authorName,
          email: `${validated.authorName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        },
      });
    }

    const post = await prisma.post.create({
      data: {
        title: validated.title || validated.titleAr || '',
        titleAr: validated.titleAr,
        slug: validated.slug,
        content: validated.content || validated.contentAr || '',
        contentAr: validated.contentAr,
        excerpt: validated.excerpt,
        excerptAr: validated.excerptAr,
        featuredImage: validated.featuredImage || null,
        authorId: author.id,
        published: validated.published,
        publishedAt: validated.published ? (validated.publishedAt || new Date()) : null,
        locale: validated.locale,
        seoTitle: validated.seoTitle,
        seoDescription: validated.seoDescription,
        keywords: validated.keywords,
        readingTime,
      },
      include: {
        author: true,
      },
    });

    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);

    return { success: true, post };
  } catch (error) {
    console.error('Error creating post:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to create post' };
  }
}

export async function updatePost(id: string, data: Partial<PostInput> & { slug?: string; authorName?: string; readingTime?: number }) {
  try {
    const existing = await prisma.post.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: 'Post not found' };
    }

    // Always regenerate slug from current title data (force update on every save)
    // Ignore provided slug and always regenerate to ensure it matches current title
    const titleSource = data.titleAr || data.title || existing.titleAr || existing.title || '';
    const slug = generateSlug(titleSource);

    // Check if slug exists on another post
    if (slug !== existing.slug) {
      const slugExists = await prisma.post.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        return { error: 'A post with this slug already exists' };
      }
    }

    // Handle author name if provided
    let authorId = existing.authorId;
    if (data.authorName) {
      let author = await prisma.author.findFirst({
        where: { name: data.authorName },
      });

      if (!author) {
        author = await prisma.author.create({
          data: {
            name: data.authorName,
            email: `${data.authorName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          },
        });
      }
      authorId = author.id;
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.titleAr !== undefined) updateData.titleAr = data.titleAr;
    // Always update slug to ensure it matches current title (force regeneration)
    updateData.slug = slug;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.contentAr !== undefined) updateData.contentAr = data.contentAr;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.excerptAr !== undefined) updateData.excerptAr = data.excerptAr;
    if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage || null;
    if (data.authorName) updateData.authorId = authorId;
    if (data.published !== undefined) {
      updateData.published = data.published;
      if (data.published && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
      if (!data.published) {
        updateData.publishedAt = null;
      }
    }
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.keywords !== undefined) updateData.keywords = data.keywords;

    // Handle reading time: use provided value or calculate from content (prioritize Arabic)
    if (data.readingTime !== undefined) {
      updateData.readingTime = data.readingTime;
    } else if (data.contentAr !== undefined && data.contentAr) {
      updateData.readingTime = calculateReadingTime(data.contentAr);
    } else if (data.content !== undefined && data.content) {
      updateData.readingTime = calculateReadingTime(data.content);
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
      },
    });

    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);

    return { success: true, post };
  } catch (error) {
    console.error('Error updating post:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update post' };
  }
}

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({
      where: { id },
    });

    revalidatePath('/blog');

    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { error: 'Failed to delete post' };
  }
}

export async function getPosts(options?: {
  locale?: string;
  published?: boolean;
  page?: number;
  limit?: number;
}) {
  try {
    const {
      locale,
      published,
      page = 1,
      limit = 10,
    } = options || {};

    const where: { locale?: string; published?: boolean } = {};

    // Only filter by locale if explicitly provided and is a valid non-empty string
    if (locale !== undefined && locale !== null && locale.trim() !== '') {
      where.locale = locale.trim().toLowerCase();
    }

    if (published !== undefined) {
      where.published = published;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
}

export async function getPostBySlug(slug: string, locale?: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: true,
      },
    });

    if (!post) {
      return null;
    }

    if (locale && post.locale !== locale) {
      return null;
    }

    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function getPostById(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });

    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// Author Actions
export async function getAuthors() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return authors;
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
}

export async function createAuthor(data: { name: string; email: string; bio?: string; avatar?: string }) {
  try {
    const author = await prisma.author.create({
      data,
    });

    return { success: true, author };
  } catch (error) {
    console.error('Error creating author:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to create author' };
  }
}

