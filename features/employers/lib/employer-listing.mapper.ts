import type { CreateListingInput, Listing, UpdateListingInput } from '@/features/listings/types/listing.entity.types';
import type {
  EmployerJobListingDetails,
  EmployerJobListingPayload,
} from '@/features/employers/types/employer-listing.types';

const DETAIL_KEYS = [
  'remotePolicy',
  'experienceYearsMin',
  'experienceYearsMax',
  'educationLevel',
  'employmentType',
  'salaryMin',
  'salaryMax',
  'positionTitle',
  'salaryRange',
  'languageTags',
] as const;

export function extractEmployerListingDetails(listing: Listing): EmployerJobListingDetails {
  const cf = listing.customFields;
  return {
    remotePolicy: (cf.remotePolicy as EmployerJobListingDetails['remotePolicy']) ?? null,
    experienceYearsMin: (cf.experienceYearsMin as number | null | undefined) ?? null,
    experienceYearsMax: (cf.experienceYearsMax as number | null | undefined) ?? null,
    educationLevel: (cf.educationLevel as string | null | undefined) ?? null,
    employmentType: (cf.employmentType as string | null | undefined) ?? null,
    salaryMin: (cf.salaryMin as number | null | undefined) ?? null,
    salaryMax: (cf.salaryMax as number | null | undefined) ?? null,
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

export function employerPayloadToCreateInput(
  payload: EmployerJobListingPayload,
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

export function employerPayloadToUpdateInput(
  payload: Partial<EmployerJobListingPayload>,
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
