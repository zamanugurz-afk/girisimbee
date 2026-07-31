import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const founderApplicationStatusSchema = z.enum([
  'pending',
  'reviewing',
  'contacted',
  'accepted',
  'rejected',
  'withdrawn',
]);

export const founderApplicationListQuerySchema = z.object({
  listingId: uuidSchema.optional(),
  applicant: z.enum(['me']).optional(),
  status: z
    .union([founderApplicationStatusSchema, z.array(founderApplicationStatusSchema)])
    .optional(),
  submittedAfter: z.string().datetime().optional(),
  submittedBefore: z.string().datetime().optional(),
});

export const founderApplicationSubmitSchema = z.object({
  listingId: uuidSchema,
  coverMessage: z.string().max(2000).nullable().optional(),
  initialNote: z.string().max(2000).optional(),
});

export const founderApplicationStatusUpdateSchema = z.object({
  status: founderApplicationStatusSchema,
  note: z.string().max(2000).optional(),
});

export const founderApplicationNoteSchema = z.object({
  note: z.string().min(1).max(2000),
});

export const founderApplicationActionSchema = z.object({
  action: z.enum(['withdraw']),
});

export const founderFavoriteSchema = z.object({
  listingId: uuidSchema,
});
