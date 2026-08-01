import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';
import { externalContactSchema } from '@/lib/api/validation/common';

export const entrepreneurListingBrowseQuerySchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  sector: z.string().optional(),
  stage: z.string().optional(),
});

export const entrepreneurListingCreateSchema = z
  .object({
    title: z.string().min(3).max(200),
    shortDescription: z.string().min(10).max(500),
    longDescription: z.string().min(20).max(10000).optional(),
    city: z.string().min(1).max(100).nullable().optional(),
    district: z.string().max(100).nullable().optional(),
    sector: z.string().max(100).nullable().optional(),
    investmentStage: z.string().max(100).nullable().optional(),
    investmentTarget: z.number().int().min(0).nullable().optional(),
    valuation: z.number().int().min(0).nullable().optional(),
    monthlyRevenue: z.number().int().min(0).nullable().optional(),
    teamSize: z.number().int().min(0).nullable().optional(),
    businessModel: z.string().max(500).nullable().optional(),
    pitchDeckDocumentId: uuidSchema.nullable().optional(),
  })
  .merge(externalContactSchema)
  .passthrough();

export const entrepreneurListingUpdateSchema = entrepreneurListingCreateSchema.partial();

export const entrepreneurListingIdParamSchema = z.object({
  id: uuidSchema,
});

export function parseEntrepreneurListingCreate(body: unknown) {
  return entrepreneurListingCreateSchema.parse(body);
}

export function parseEntrepreneurListingUpdate(body: unknown) {
  return entrepreneurListingUpdateSchema.parse(body);
}
