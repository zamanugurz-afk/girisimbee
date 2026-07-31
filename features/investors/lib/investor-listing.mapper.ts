import type { CreateListingInput, Listing, UpdateListingInput } from '@/features/listings/types/listing.entity.types';
import type {
  InvestorListingDetails,
  InvestorListingPayload,
} from '@/features/investors/types/investor-listing.types';

const DETAIL_KEYS = [
  'investorType',
  'investmentStage',
  'minimumInvestment',
  'maximumInvestment',
  'portfolioSize',
  'sectors',
] as const;

export function extractInvestorListingDetails(listing: Listing): InvestorListingDetails {
  const cf = listing.customFields;
  return {
    investorType: (cf.investorType as string | null | undefined) ?? null,
    investmentStage: (cf.investmentStage as string | null | undefined) ?? null,
    minimumInvestment: (cf.minimumInvestment as number | null | undefined) ?? null,
    maximumInvestment: (cf.maximumInvestment as number | null | undefined) ?? null,
    portfolioSize: (cf.portfolioSize as number | null | undefined) ?? null,
    sectors: (cf.sectors as string[] | null | undefined) ?? null,
  };
}

function buildCustomFields(payload: InvestorListingPayload): Record<string, unknown> {
  const customFields: Record<string, unknown> = {};
  for (const key of DETAIL_KEYS) {
    if (payload[key] !== undefined) {
      customFields[key] = payload[key];
    }
  }
  return customFields;
}

export function investorPayloadToCreateInput(
  payload: InvestorListingPayload,
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
    customFields: buildCustomFields(payload),
  };
}

export function investorPayloadToUpdateInput(
  payload: Partial<InvestorListingPayload>,
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

  const customPatch = buildCustomFields(payload as InvestorListingPayload);
  if (Object.keys(customPatch).length > 0) {
    update.customFields = { ...existing.customFields, ...customPatch };
  }

  return update;
}
