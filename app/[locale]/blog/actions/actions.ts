'use server';

import { getPosts as getPostsAction, getPostBySlug as getPostBySlugAction } from '@/app/actions/blog/actions';

export async function getPosts(params: {
  locale: string;
  published?: boolean;
  page?: number;
  limit?: number;
}) {
  // Ensure only published posts are returned for public pages
  return getPostsAction({
    ...params,
    published: true,
  });
}

export async function getPostBySlug(slug: string, locale: string) {
  const post = await getPostBySlugAction(slug, locale);

  // Ensure only published posts are returned for public pages
  if (post && !post.published) {
    return null;
  }

  return post;
}

