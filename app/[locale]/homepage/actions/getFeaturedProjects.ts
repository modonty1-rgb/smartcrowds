'use server';

import { getProjects } from '@/app/actions/project/actions';

export async function getFeaturedProjects(locale: string) {
  const result = await getProjects({
    locale,
    published: true,
    featured: true,
    page: 1,
    limit: 6,
  });

  return result?.projects || [];
}

