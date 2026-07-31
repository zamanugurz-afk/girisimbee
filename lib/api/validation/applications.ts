import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const submitApplicationSchema = z.object({
  listingId: uuidSchema,
  coverMessage: z.string().max(2000).nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const applicationTransitionSchema = z.object({
  action: z.enum(['review', 'contact', 'withdraw']),
});

export const applicationUnlockSchema = z.object({
  paymentId: uuidSchema,
});

export const applicationListQuerySchema = z.object({
  listingId: uuidSchema.optional(),
});
