import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().optional(),
  titleAr: z.string().min(1, 'Arabic title is required').max(200, 'Title is too long'),
  slug: z.string().min(1, 'Slug is required').regex(/^[\u0600-\u06FF\u08A0-\u08FFa-z0-9-]+$/, 'Slug must contain only Arabic characters, lowercase letters, numbers, and hyphens'),
  content: z.string().optional(),
  contentAr: z.string().min(1, 'Arabic content is required'),
  excerpt: z.string().max(500, 'Excerpt is too long').optional(),
  excerptAr: z.string().max(500, 'Excerpt is too long').optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  authorName: z.string().min(1, 'Author name is required').max(100, 'Author name is too long'),
  published: z.boolean().default(false),
  publishedAt: z.date().optional().nullable(),
  locale: z.enum(['en', 'ar']).default('ar'),
  seoTitle: z.string().max(60, 'SEO title is too long').optional(),
  seoDescription: z.string().max(160, 'SEO description is too long').optional(),
  keywords: z.array(z.string()).default([]),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  nameAr: z.string().optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[\u0600-\u06FF\u08A0-\u08FFa-z0-9-]+$/, 'Slug must contain only Arabic characters, lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description is too long').optional(),
  descriptionAr: z.string().max(500, 'Description is too long').optional(),
  locale: z.enum(['en', 'ar']).default('en'),
});

export const tagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  nameAr: z.string().optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[\u0600-\u06FF\u08A0-\u08FFa-z0-9-]+$/, 'Slug must contain only Arabic characters, lowercase letters, numbers, and hyphens'),
});

export type PostInput = z.infer<typeof postSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TagInput = z.infer<typeof tagSchema>;

