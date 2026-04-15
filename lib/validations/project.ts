import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().max(200, 'Name is too long').optional().or(z.literal('')),
  nameAr: z.string().max(200, 'Name is too long').optional().or(z.literal('')),
  slug: z.string().min(1, 'Slug is required').regex(/^[\u0600-\u06FF\u08A0-\u08FFa-z0-9-]+$/, 'Slug must contain only Arabic characters, lowercase letters, numbers, and hyphens'),
  description: z.string().max(2000, 'Description is too long').optional(),
  descriptionAr: z.string().max(2000, 'Description is too long').optional(),
  featuredImage: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : val),
    z.string().url('Invalid image URL').nullable().optional()
  ),
  locale: z.enum(['en', 'ar']).default('en'),
  seoTitle: z.string().max(60, 'SEO title is too long').optional(),
  seoDescription: z.string().max(160, 'SEO description is too long').optional(),
  keywords: z.array(z.string()).default([]),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
}).refine(
  (data) => {
    // Require at least one of name or nameAr
    return (data.name && data.name.trim().length > 0) || (data.nameAr && data.nameAr.trim().length > 0);
  },
  {
    message: 'Either name or nameAr is required',
    path: ['name'],
  }
);

export const projectImageSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  alt: z.string().max(200, 'Alt text is too long').optional(),
  altAr: z.string().max(200, 'Alt text is too long').optional(),
  order: z.number().int().min(0).default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectImageInput = z.infer<typeof projectImageSchema>;

