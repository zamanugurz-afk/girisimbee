import type { CreateListingInput, Listing, UpdateListingInput } from '@/features/listings/types/listing.entity.types';
import type {
  FounderListingDetails,
  FounderListingPayload,
} from '@/features/founders/types/founder-listing.types';

const DETAIL_KEYS = [
  'founderType',
  'startupStage',
  'requiredSkills',
  'offeredSkills',
  'sectors',
  'sector',
  'equityOffered',
  'commitment',
  'partnershipType',
  'expertise',
  'projectStage',
  'partnershipIntent',
  'experience',
] as const;

export function extractFounderListingDetails(listing: Listing): FounderListingDetails {
  const cf = listing.customFields;
  return {
    founderType: (cf.founderType as string | null | undefined) ?? null,
    startupStage: (cf.startupStage as string | null | undefined) ?? null,
    requiredSkills: (cf.requiredSkills as string[] | null | undefined) ?? null,
    offeredSkills: (cf.offeredSkills as string[] | null | undefined) ?? null,
    sectors: (cf.sectors as string[] | null | undefined) ?? null,
    sector: (cf.sector as string | null | undefined) ?? null,
    partnershipIntent: (cf.partnershipIntent as string | null | undefined) ?? null,
    experience: (cf.experience as string | null | undefined) ?? null,
    commitment: (cf.commitment as string | null | undefined) ?? null,
    partnershipType: (cf.partnershipType as string | null | undefined) ?? null,
    expertise: (cf.expertise as string[] | null | undefined) ?? null,
    projectStage: (cf.projectStage as string | null | undefined) ?? null,
    equityOffered: cf.equityOffered,
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

export function founderPayloadToCreateInput(
  payload: FounderListingPayload,
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

export function founderPayloadToUpdateInput(
  payload: Partial<FounderListingPayload>,
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
