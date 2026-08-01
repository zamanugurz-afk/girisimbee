import type { CreateListingInput, Listing, UpdateListingInput } from '@/features/listings/types/listing.entity.types';
import type {
  EntrepreneurListingDetails,
  EntrepreneurListingPayload,
} from '@/features/entrepreneurs/types/entrepreneur-listing.types';

const DETAIL_KEYS = [
  'investmentStage',
  'investmentTarget',
  'valuation',
  'monthlyRevenue',
  'teamSize',
  'businessModel',
  'pitchDeckDocumentId',
  'investmentAmount',
  'equityOffered',
  'useOfFunds',
] as const;

export function extractEntrepreneurListingDetails(listing: Listing): EntrepreneurListingDetails {
  const cf = listing.customFields;
  return {
    investmentStage: (cf.investmentStage as string | null | undefined) ?? null,
    investmentTarget: (cf.investmentTarget as number | null | undefined) ?? null,
    valuation: (cf.valuation as number | null | undefined) ?? null,
    monthlyRevenue: (cf.monthlyRevenue as number | null | undefined) ?? null,
    teamSize: (cf.teamSize as number | null | undefined) ?? null,
    businessModel: (cf.businessModel as string | null | undefined) ?? null,
    pitchDeckDocumentId: (cf.pitchDeckDocumentId as string | null | undefined) ?? null,
  };
}

function buildCustomFields(payload: Record<string, unknown>): Record<string, unknown> {
  const customFields: Record<string, unknown> = {};
  for (const key of DETAIL_KEYS) {
    if (payload[key] !== undefined) {
      customFields[key] = payload[key];
    }
  }
  return customFields;
}

export function entrepreneurPayloadToCreateInput(
  payload: EntrepreneurListingPayload,
): Pick<
  CreateListingInput,
  | 'title'
  | 'shortDescription'
  | 'longDescription'
  | 'city'
  | 'district'
  | 'industry'
  | 'contactPhone'
  | 'contactWhatsapp'
  | 'contactEmail'
  | 'contactWebsite'
  | 'customFields'
  | 'anonymousMode'
> {
  return {
    title: payload.title,
    shortDescription: payload.shortDescription,
    longDescription: payload.longDescription ?? '',
    city: payload.city ?? null,
    district: payload.district ?? null,
    industry: payload.sector ?? null,
    contactPhone: payload.contactPhone ?? null,
    contactWhatsapp: payload.contactWhatsapp ?? null,
    contactEmail: payload.contactEmail ?? null,
    contactWebsite: payload.contactWebsite ?? null,
    anonymousMode: true,
    customFields: buildCustomFields(payload as unknown as Record<string, unknown>),
  };
}

export function entrepreneurPayloadToUpdateInput(
  payload: Partial<EntrepreneurListingPayload>,
  existing: Listing,
): UpdateListingInput {
  const update: UpdateListingInput = {};
  if (payload.title !== undefined) update.title = payload.title;
  if (payload.shortDescription !== undefined) update.shortDescription = payload.shortDescription;
  if (payload.longDescription !== undefined) update.longDescription = payload.longDescription;
  if (payload.city !== undefined) update.city = payload.city;
  if (payload.district !== undefined) update.district = payload.district;
  if (payload.sector !== undefined) update.industry = payload.sector;
  if (payload.contactPhone !== undefined) update.contactPhone = payload.contactPhone;
  if (payload.contactWhatsapp !== undefined) update.contactWhatsapp = payload.contactWhatsapp;
  if (payload.contactEmail !== undefined) update.contactEmail = payload.contactEmail;
  if (payload.contactWebsite !== undefined) update.contactWebsite = payload.contactWebsite;

  const customPatch = buildCustomFields(payload as unknown as Record<string, unknown>);
  if (Object.keys(customPatch).length > 0) {
    update.customFields = { ...existing.customFields, ...customPatch };
  }

  return update;
}
