import { z } from 'zod';
import { timestampsSchema, softDeletableSchema, uuidSchema, slugSchema } from '@/lib/domain/validation';

export const listingTypeStatusSchema = z.enum(['active', 'inactive', 'deleted']);

export const listingFieldDefinitionSchema = z.object({
  key: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  type: z.enum(['string', 'number', 'boolean', 'enum', 'currency', 'percentage', 'date']),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const listingFieldSchemaSchema = z.object({
  fields: z.array(listingFieldDefinitionSchema),
});

export const listingTypeSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  categoryId: uuidSchema,
  slug: slugSchema,
  name: z.string().min(2).max(100),
  description: z.string().max(500).nullable(),
  fieldSchema: listingFieldSchemaSchema,
  sortOrder: z.number().int().min(0),
  status: listingTypeStatusSchema,
});

export const tagStatusSchema = z.enum(['active', 'merged', 'deleted']);

export const tagSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  slug: slugSchema,
  name: z.string().min(2).max(50),
  usageCount: z.number().int().min(0),
  status: tagStatusSchema,
  mergedIntoId: uuidSchema.nullable(),
});

export const attachmentTypeSchema = z.enum(['pdf', 'video', 'image', 'document', 'link']);
export const attachmentStatusSchema = z.enum(['uploading', 'processing', 'ready', 'failed', 'deleted']);

export const attachmentSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  listingId: uuidSchema,
  uploadedById: uuidSchema,
  name: z.string().max(255),
  type: attachmentTypeSchema,
  mimeType: z.string(),
  url: z.string().url(),
  sizeBytes: z.number().int().max(52_428_800),
  status: attachmentStatusSchema,
  sortOrder: z.number().int().min(0),
  metadata: z.record(z.unknown()),
});

export type ListingTypeSchema = z.infer<typeof listingTypeSchema>;
export type TagSchema = z.infer<typeof tagSchema>;
export type AttachmentSchema = z.infer<typeof attachmentSchema>;
