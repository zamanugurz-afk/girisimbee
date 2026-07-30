import { z } from 'zod';
import { timestampsSchema, softDeletableSchema, uuidSchema, slugSchema, metadataSchema } from '@/lib/domain/validation';

export const applicationStatusSchema = z.enum([
  'submitted', 'viewed', 'accepted', 'rejected', 'withdrawn', 'deleted',
]);

export const applicationSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  listingId: uuidSchema,
  applicantId: uuidSchema,
  status: applicationStatusSchema,
  coverMessage: z.string().max(2000).nullable(),
  conversationId: uuidSchema.nullable(),
  viewedAt: z.string().datetime({ offset: true }).nullable(),
  respondedAt: z.string().datetime({ offset: true }).nullable(),
  metadata: metadataSchema,
});

export const createApplicationSchema = z.object({
  listingId: uuidSchema,
  applicantId: uuidSchema,
  coverMessage: z.string().max(2000).nullable().optional(),
  metadata: metadataSchema.optional(),
});

export type ApplicationSchema = z.infer<typeof applicationSchema>;
export type CreateApplicationSchema = z.infer<typeof createApplicationSchema>;
