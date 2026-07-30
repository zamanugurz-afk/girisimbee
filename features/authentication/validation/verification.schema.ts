import { z } from 'zod';
import { timestampsSchema, softDeletableSchema, uuidSchema, metadataSchema } from '@/lib/domain/validation';

export const verificationTypeSchema = z.enum([
  'email', 'phone', 'identity', 'company', 'investor_accreditation',
]);

export const verificationStatusSchema = z.enum([
  'pending', 'in_review', 'approved', 'rejected', 'expired',
]);

export const verificationSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  userId: uuidSchema,
  companyId: uuidSchema.nullable(),
  type: verificationTypeSchema,
  status: verificationStatusSchema,
  documentUrls: z.array(z.string().url()).max(10),
  reviewerId: uuidSchema.nullable(),
  reviewedAt: z.string().datetime({ offset: true }).nullable(),
  rejectionReason: z.string().max(1000).nullable(),
  expiresAt: z.string().datetime({ offset: true }).nullable(),
  metadata: metadataSchema,
});

export const createVerificationSchema = z.object({
  userId: uuidSchema,
  type: verificationTypeSchema,
  companyId: uuidSchema.nullable().optional(),
  documentUrls: z.array(z.string().url()).max(10).optional(),
  metadata: metadataSchema.optional(),
});

export type VerificationSchema = z.infer<typeof verificationSchema>;
export type CreateVerificationSchema = z.infer<typeof createVerificationSchema>;
