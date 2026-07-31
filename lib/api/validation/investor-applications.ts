import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const investorApplicationStatusSchema = z.enum([
  'pending',
  'reviewing',
  'contacted',
  'accepted',
  'rejected',
  'withdrawn',
]);

export const investorApplicationListQuerySchema = z.object({
  listingId: uuidSchema.optional(),
  investor: z.enum(['me']).optional(),
  status: z
    .union([investorApplicationStatusSchema, z.array(investorApplicationStatusSchema)])
    .optional(),
  submittedAfter: z.string().datetime().optional(),
  submittedBefore: z.string().datetime().optional(),
});

export const investorApplicationSubmitSchema = z.object({
  listingId: uuidSchema,
  coverMessage: z.string().max(2000).nullable().optional(),
  initialNote: z.string().max(2000).optional(),
});

export const investorApplicationStatusUpdateSchema = z.object({
  status: investorApplicationStatusSchema,
  note: z.string().max(2000).optional(),
});

export const investorApplicationNoteSchema = z.object({
  note: z.string().min(1).max(2000),
});

export const investorApplicationActionSchema = z.object({
  action: z.enum(['withdraw']),
});

export const investorFavoriteSchema = z.object({
  listingId: uuidSchema,
});
