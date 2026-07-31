import { z } from 'zod';
import { MODULE_KEYS } from '@/lib/domain/modules';
import { uuidSchema, urlSchema, phoneSchema, paginationSchema } from '@/lib/domain/validation';

export const moduleKeySchema = z.enum(MODULE_KEYS);

export const idParamSchema = z.object({
  id: uuidSchema,
});

export const moduleParamSchema = z.object({
  module: moduleKeySchema,
});

export const externalContactSchema = z.object({
  contactPhone: phoneSchema,
  contactWhatsapp: phoneSchema,
  contactEmail: z.string().email().nullable().optional(),
  contactWebsite: urlSchema,
});

export const listingPublishBodySchema = z
  .object({
    title: z.string().min(3).max(200),
    shortDescription: z.string().min(10).max(500),
    longDescription: z.string().min(20).max(10000),
    city: z.string().min(1).max(100).nullable().optional(),
    district: z.string().max(100).nullable().optional(),
    industry: z.string().max(100).nullable().optional(),
    pitchDeckDocumentId: uuidSchema.nullable().optional(),
    flow: z.enum(['buy', 'give']).optional(),
  })
  .merge(externalContactSchema);

export const listingBrowseQuerySchema = paginationSchema.extend({
  city: z.string().optional(),
  industry: z.string().optional(),
  sector: z.string().optional(),
});

export { paginationSchema };
