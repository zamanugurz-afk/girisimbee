import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const franchiseApplicationStatusSchema = z.enum([
  'pending',
  'reviewing',
  'contacted',
  'approved',
  'rejected',
  'withdrawn',
]);

export const franchiseApplicationSubmitSchema = z.object({
  listingId: uuidSchema,
  coverMessage: z.string().max(2000).nullable().optional(),
  initialNote: z.string().max(2000).optional(),
});

export const franchiseApplicationListQuerySchema = z.object({
  listingId: uuidSchema.optional(),
  applicant: z.enum(['me']).optional(),
  status: z
    .union([franchiseApplicationStatusSchema, z.array(franchiseApplicationStatusSchema)])
    .optional(),
  submittedAfter: z.string().datetime().optional(),
  submittedBefore: z.string().datetime().optional(),
});

export const franchiseApplicationStatusUpdateSchema = z.object({
  status: franchiseApplicationStatusSchema,
  note: z.string().max(2000).optional(),
});

export const franchiseApplicationNoteSchema = z.object({
  note: z.string().min(1).max(2000),
});

export const franchiseApplicationActionSchema = z.object({
  action: z.enum(['review', 'withdraw']),
});

export const franchiseFavoriteSchema = z.object({
  listingId: uuidSchema,
});
