import { z } from 'zod';

export const nationalityInputSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
});

export type NationalityInput = z.infer<typeof nationalityInputSchema>;

