'use server';

import {
  getProjects as getProjectsAction,
  getProjectById as getProjectByIdAction,
  createProject as createProjectAction,
  updateProject as updateProjectAction,
  addProjectImage as addProjectImageAction,
  deleteProjectImage as deleteProjectImageAction,
  deleteProject as deleteProjectAction,
} from '@/app/actions/project/actions';

// Re-export actions for dashboard use
// Dashboard pages can access all projects (published and drafts) and all locales
export async function getProjects(params: {
  locale?: string;
  published?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  return getProjectsAction(params);
}

export async function getProjectById(id: string) {
  return getProjectByIdAction(id);
}

export async function createProject(data: {
  name: string;
  nameAr: string;
  slug: string;
  description?: string;
  descriptionAr?: string;
  featuredImage?: string;
  startDate?: Date;
  endDate?: Date;
  published: boolean;
  featured: boolean;
  locale: 'ar' | 'en';
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}) {
  return createProjectAction({
    ...data,
    keywords: data.keywords ?? [],
  });
}

export async function updateProject(
  id: string,
  data: {
    name: string;
    nameAr: string;
    slug: string;
    description?: string;
    descriptionAr?: string;
    featuredImage?: string;
    startDate?: Date;
    endDate?: Date;
    published: boolean;
    featured: boolean;
    locale: 'ar' | 'en';
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
  }
) {
  return updateProjectAction(id, data);
}

export async function addProjectImage(projectId: string, data: {
  imageUrl: string;
  alt?: string;
  altAr?: string;
  order?: number;
}) {
  return addProjectImageAction(projectId, {
    ...data,
    order: data.order ?? 0,
  });
}

export async function deleteProjectImage(imageId: string) {
  return deleteProjectImageAction(imageId);
}

export async function deleteProject(id: string) {
  return deleteProjectAction(id);
}

