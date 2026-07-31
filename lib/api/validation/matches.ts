import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const createMatchSchema = z.object({
  moduleKey: z.enum(['entrepreneurs', 'investors', 'founders']),
  targetProfileId: uuidSchema,
  listingId: uuidSchema.nullable().optional(),
  targetListingId: uuidSchema.nullable().optional(),
  score: z.number().min(0).max(100).nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const matchTransitionSchema = z.object({
  action: z.enum(['accept', 'decline', 'contact', 'close_won', 'close_lost']),
});

export const matchListQuerySchema = z.object({
  listingId: uuidSchema.optional(),
});
