import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';
import { documentVisibilitySchema } from '@/lib/api/validation/documents';

export const candidateCvRegisterSchema = z.object({
  name: z.string().min(1).max(255),
  storagePath: z.string().min(1).max(500),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().int().min(1),
  storageBucket: z.string().max(100).optional(),
  visibility: documentVisibilitySchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const candidateCvVisibilitySchema = z.object({
  visibility: documentVisibilitySchema,
});

export const candidateCvListQuerySchema = z.object({
  documentId: uuidSchema.optional(),
});
