import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';
import { externalContactSchema } from '@/lib/api/validation/common';
import { traceValidationFailure } from '@/lib/debug/validation-trace';

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
  isletmeTecrubesi: z.string().max(500).nullable().optional(),
  preferredBrand: z.string().max(200).nullable().optional(),
});

const franchiseGiveListingFieldsSchema = z.object({
  companyName: z.string().max(200).nullable().optional(),
  establishmentYear: z.number().int().min(1900).max(2030).nullable().optional(),
  branchCount: z.number().int().min(1).nullable().optional(),
  website: z.string().max(500).nullable().optional(),
  entryFee: z.number().int().min(0).nullable().optional(),
  franchiseFee: z.number().int().min(0).nullable().optional(),
  totalInvestment: z.number().int().min(0).nullable().optional(),
  profitMargin: z.number().min(0).max(100).nullable().optional(),
  royaltyFee: z.number().min(0).max(100).nullable().optional(),
  advertisingFee: z.number().min(0).max(100).nullable().optional(),
  returnPeriod: z.string().max(100).nullable().optional(),
  averageSetupDuration: z.string().max(100).nullable().optional(),
  minSquareMeters: z.number().int().min(1).nullable().optional(),
  availableCities: z.array(z.string().max(100)).nullable().optional(),
  districts: z.string().max(500).nullable().optional(),
  minPopulation: z.number().int().min(0).nullable().optional(),
  storeSize: z.string().max(100).nullable().optional(),
  mallAvailable: z.boolean().nullable().optional(),
  streetStoreAvailable: z.boolean().nullable().optional(),
  businessCategory: z.string().max(100).nullable().optional(),
  employeeCount: z.number().int().min(0).nullable().optional(),
  dailyCustomerCapacity: z.number().int().min(0).nullable().optional(),
  workingHours: z.string().max(200).nullable().optional(),
  trainingSupport: z.boolean().nullable().optional(),
  operationalSupport: z.boolean().nullable().optional(),
  marketingSupport: z.boolean().nullable().optional(),
  minCapitalRequirement: z.number().int().min(0).nullable().optional(),
  experienceRequirement: z.string().max(200).nullable().optional(),
  educationRequirement: z.string().max(200).nullable().optional(),
  companyEstablishmentRequired: z.boolean().nullable().optional(),
  guaranteeRequirement: z.string().max(500).nullable().optional(),
  introductionVideoUrl: z.string().max(500).nullable().optional(),
  presentationPdfUrl: z.string().max(500).nullable().optional(),
  sampleContractUrl: z.string().max(500).nullable().optional(),
  brandLogoUrl: z.string().max(500).nullable().optional(),
  coverImageUrl: z.string().max(500).nullable().optional(),
  branchPhotoUrls: z.array(z.string().max(500)).nullable().optional(),
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
  const result = franchiseListingCreateSchema.safeParse(body);
  if (!result.success) {
    traceValidationFailure('franchiseListingCreate', result.error, { input: body });
    throw result.error;
  }
  return result.data;
}

export function parseFranchiseListingUpdate(body: unknown) {
  return franchiseListingUpdateSchema.parse(body);
}
