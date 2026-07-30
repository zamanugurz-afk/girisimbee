import { z } from 'zod';
import { timestampsSchema, softDeletableSchema, uuidSchema } from '@/lib/domain/validation';

export const favoriteStatusSchema = z.enum(['active', 'deleted']);

export const favoriteSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  userId: uuidSchema,
  listingId: uuidSchema,
  status: favoriteStatusSchema,
  note: z.string().max(500).nullable(),
});

export const createFavoriteSchema = z.object({
  userId: uuidSchema,
  listingId: uuidSchema,
  note: z.string().max(500).nullable().optional(),
});

export type FavoriteSchema = z.infer<typeof favoriteSchema>;
