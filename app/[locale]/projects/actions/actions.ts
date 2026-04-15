'use server';

import { getProjects as getProjectsAction, getProjectBySlug as getProjectBySlugAction } from '@/app/actions/project/actions';

export async function getProjects(params: {
  locale: string;
  published?: boolean;
  page?: number;
  limit?: number;
}) {
  // Ensure only published projects are returned for public pages
  return getProjectsAction({
    ...params,
    published: true,
  });
}

export async function getProjectBySlug(id: string, locale: string) {
  const project = await getProjectBySlugAction(id, locale);
  
  // Ensure only published projects are returned for public pages
  if (project && !project.published) {
    return null;
  }
  
  return project;
}

