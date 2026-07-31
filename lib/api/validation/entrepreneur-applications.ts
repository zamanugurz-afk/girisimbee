import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const entrepreneurApplicationStatusSchema = z.enum([
  'pending',
  'reviewing',
  'contacted',
  'accepted',
  'rejected',
  'withdrawn',
]);

export const entrepreneurApplicationListQuerySchema = z.object({
  listingId: uuidSchema.optional(),
  investor: z.enum(['me']).optional(),
  status: z
    .union([entrepreneurApplicationStatusSchema, z.array(entrepreneurApplicationStatusSchema)])
    .optional(),
  submittedAfter: z.string().datetime().optional(),
  submittedBefore: z.string().datetime().optional(),
});

export const entrepreneurApplicationSubmitSchema = z.object({
  listingId: uuidSchema,
  coverMessage: z.string().max(2000).nullable().optional(),
  initialNote: z.string().max(2000).optional(),
});

export const entrepreneurApplicationStatusUpdateSchema = z.object({
  status: entrepreneurApplicationStatusSchema,
  note: z.string().max(2000).optional(),
});

export const entrepreneurApplicationNoteSchema = z.object({
  note: z.string().min(1).max(2000),
});

export const entrepreneurApplicationActionSchema = z.object({
  action: z.enum(['withdraw']),
});

export const entrepreneurFavoriteSchema = z.object({
  listingId: uuidSchema,
});
