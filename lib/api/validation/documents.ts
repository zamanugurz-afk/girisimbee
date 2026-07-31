import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const documentTypeSchema = z.enum([
  'pitch_deck',
  'cv',
  'contract',
  'franchise_brochure',
  'other',
]);

export const documentVisibilitySchema = z.enum([
  'private',
  'match_only',
  'application_only',
  'public',
]);

export const registerDocumentSchema = z.object({
  documentType: documentTypeSchema,
  name: z.string().min(1).max(255),
  storagePath: z.string().min(1).max(500),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().int().min(1),
  listingId: uuidSchema.nullable().optional(),
  storageBucket: z.string().max(100).optional(),
  visibility: documentVisibilitySchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateDocumentSchema = z.object({
  visibility: documentVisibilitySchema.optional(),
  listingId: uuidSchema.nullable().optional(),
});
