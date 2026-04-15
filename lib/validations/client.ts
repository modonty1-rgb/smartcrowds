import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  logoUrl: z.string().url('Invalid image URL'),
  websiteUrl: z
    .string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  published: z.boolean().default(false).optional(),
  order: z.number().int().min(0).default(0).optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;


