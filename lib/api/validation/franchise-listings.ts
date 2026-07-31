import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';
import { externalContactSchema } from '@/lib/api/validation/common';

const franchiseListingCoreSchema = z.object({
  title: z.string().min(3).max(200),
  shortDescription: z.string().min(10).max(500),
  longDescription: z.string().min(20).max(10000).optional(),
  city: z.string().min(1).max(100).nullable().optional(),
  district: z.string().max(100).nullable().optional(),
  sector: z.string().max(100).nullable().optional(),
});

const franchiseBuyListingFieldsSchema = z.object({
  minimumYatirim: z.number().int().min(0).nullable().optional(),
  maksimumYatirim: z.number().int().min(0).nullable().optional(),
  tercihEdilenLokasyon: z.string().max(200).nullable().optional(),
});

const franchiseGiveListingFieldsSchema = z.object({
  franchiseBedeli: z.number().int().min(0).nullable().optional(),
  minimumSermaye: z.number().int().min(0).nullable().optional(),
  tahminiAylikCiro: z.number().int().min(0).nullable().optional(),
  egitimDestegi: z.boolean().nullable().optional(),
  operasyonDestegi: z.boolean().nullable().optional(),
  pazarlamaDestegi: z.boolean().nullable().optional(),
});

export const franchiseListingBrowseQuerySchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  sector: z.string().optional(),
});

export const franchiseBuyListingCreateSchema = franchiseListingCoreSchema
  .merge(franchiseBuyListingFieldsSchema)
  .merge(externalContactSchema);

export const franchiseGiveListingCreateSchema = franchiseListingCoreSchema
  .merge(franchiseGiveListingFieldsSchema)
  .merge(externalContactSchema);

export const franchiseListingCreateSchema = z.discriminatedUnion('flow', [
  franchiseBuyListingCreateSchema.extend({ flow: z.literal('buy') }),
  franchiseGiveListingCreateSchema.extend({ flow: z.literal('give') }),
]);

export const franchiseBuyListingUpdateSchema = franchiseListingCoreSchema
  .partial()
  .merge(franchiseBuyListingFieldsSchema)
  .merge(externalContactSchema.partial());

export const franchiseGiveListingUpdateSchema = franchiseListingCoreSchema
  .partial()
  .merge(franchiseGiveListingFieldsSchema)
  .merge(externalContactSchema.partial());

export const franchiseListingUpdateSchema = z.union([
  franchiseBuyListingUpdateSchema.extend({ flow: z.literal('buy') }),
  franchiseGiveListingUpdateSchema.extend({ flow: z.literal('give') }),
]);

export const franchiseListingIdParamSchema = z.object({
  id: uuidSchema,
});

export function parseFranchiseListingCreate(body: unknown) {
  return franchiseListingCreateSchema.parse(body);
}

export function parseFranchiseListingUpdate(body: unknown) {
  return franchiseListingUpdateSchema.parse(body);
}
