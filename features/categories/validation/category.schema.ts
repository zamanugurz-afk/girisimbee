import { z } from 'zod';
import { timestampsSchema, softDeletableSchema, uuidSchema, slugSchema, hexColorSchema } from '@/lib/domain/validation';

export const categoryStatusSchema = z.enum(['active', 'inactive', 'deleted']);

export const categorySchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  slug: slugSchema,
  name: z.string().min(2).max(100),
  description: z.string().max(500).nullable(),
  icon: z.string().max(50).nullable(),
  accentColor: hexColorSchema,
  sortOrder: z.number().int().min(0),
  status: categoryStatusSchema,
  listingCount: z.number().int().min(0),
});

export const createCategorySchema = z.object({
  slug: slugSchema,
  name: z.string().min(2).max(100),
  accentColor: hexColorSchema,
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CategorySchema = z.infer<typeof categorySchema>;
export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
