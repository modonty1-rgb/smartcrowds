'use server';

import {
  getPosts as getPostsAction,
  getPostById as getPostByIdAction,
  createPost as createPostAction,
  updatePost as updatePostAction,
  deletePost as deletePostAction,
} from '@/app/actions/blog/actions';

// Re-export actions for dashboard use
// Dashboard pages can access all posts (published and drafts) and all locales
export async function getPosts(params: {
  locale?: string;
  published?: boolean;
  page?: number;
  limit?: number;
}) {
  return getPostsAction(params);
}

export async function getPostById(id: string) {
  return getPostByIdAction(id);
}

export async function createPost(data: {
  title: string;
  titleAr: string;
  slug: string;
  content: string;
  contentAr: string;
  excerpt?: string;
  excerptAr?: string;
  featuredImage?: string;
  authorName: string;
  published: boolean;
  locale: 'ar' | 'en';
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}) {
  return createPostAction({
    ...data,
    keywords: data.keywords ?? [],
  });
}

export async function updatePost(
  id: string,
  data: {
    title: string;
    titleAr: string;
    slug: string;
    content: string;
    contentAr: string;
    excerpt?: string;
    excerptAr?: string;
    featuredImage?: string;
    authorName: string;
    published: boolean;
    locale: 'ar' | 'en';
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
    readingTime?: number;
  }
) {
  return updatePostAction(id, data);
}

export async function deletePost(id: string) {
  return deletePostAction(id);
}

