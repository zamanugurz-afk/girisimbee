import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const candidateApplicationStatusSchema = z.enum([
  'pending',
  'reviewing',
  'contacted',
  'accepted',
  'rejected',
  'withdrawn',
]);

export const candidateApplicationListQuerySchema = z.object({
  status: z
    .union([candidateApplicationStatusSchema, z.array(candidateApplicationStatusSchema)])
    .optional(),
  submittedAfter: z.string().datetime().optional(),
  submittedBefore: z.string().datetime().optional(),
});

export const candidateApplicationSubmitSchema = z.object({
  listingId: uuidSchema,
  coverMessage: z.string().max(2000).nullable().optional(),
  initialNote: z.string().max(2000).optional(),
  profileSnapshot: z.record(z.unknown()).nullable().optional(),
  saveToMainProfile: z.boolean().optional(),
});

export const candidateApplicationNoteSchema = z.object({
  note: z.string().min(1).max(2000),
});

export const candidateApplicationActionSchema = z.object({
  action: z.enum(['withdraw', 'contact']),
});
