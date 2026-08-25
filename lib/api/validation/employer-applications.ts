import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const employerApplicationStatusSchema = z.enum([
  'pending',
  'reviewing',
  'contacted',
  'accepted',
  'rejected',
  'withdrawn',
]);

export const employerApplicationListQuerySchema = z.object({
  listingId: uuidSchema.optional(),
  applicant: z.enum(['me']).optional(),
  status: z
    .union([employerApplicationStatusSchema, z.array(employerApplicationStatusSchema)])
    .optional(),
  submittedAfter: z.string().datetime().optional(),
  submittedBefore: z.string().datetime().optional(),
});

export const employerApplicationStatusUpdateSchema = z.object({
  status: employerApplicationStatusSchema,
  note: z.string().max(2000).optional(),
  rejectionMessage: z.string().max(5000).optional(),
});

export const employerApplicationNoteSchema = z.object({
  note: z.string().min(1).max(2000),
});

export const employerApplicationActionSchema = z.object({
  action: z.enum(['review', 'withdraw']),
});
