import type { CreateListingInput, Listing, UpdateListingInput } from '@/features/listings/types/listing.entity.types';
import type {
  CandidateListingDetails,
  CandidateListingPayload,
} from '@/features/candidates/types/candidate-listing.types';
import { parseCareerExperiences } from '@/features/candidates/config/career-profile-fields';

const DETAIL_KEYS = [
  'desiredRole',
  'experienceLevel',
  'salaryExpectation',
  'workType',
  'professionalSkills',
  'technicalSkills',
  'leadershipExperience',
  'tools',
  'educationLevel',
  'educationField',
  'languages',
  'certificates',
  'preferredSectors',
  'preferredRoles',
  'preferredCity',
  'workplacePreference',
  'availability',
  'experiences',
  'cvUrl',
  'kvkkConsents',
] as const;

export function extractCandidateListingDetails(listing: Listing): CandidateListingDetails {
  const cf = listing.customFields;
  return {
    desiredRole: (cf.desiredRole as string | null | undefined) ?? null,
    experienceLevel: (cf.experienceLevel as string | null | undefined) ?? null,
    salaryExpectation: (cf.salaryExpectation as string | null | undefined) ?? null,
    workType: (cf.workType as string | null | undefined) ?? null,
    professionalSkills: (cf.professionalSkills as string | null | undefined) ?? null,
    technicalSkills: (cf.technicalSkills as string | null | undefined) ?? null,
    leadershipExperience: (cf.leadershipExperience as string | null | undefined) ?? null,
    tools: (cf.tools as string | null | undefined) ?? null,
    educationLevel: (cf.educationLevel as string | null | undefined) ?? null,
    educationField: (cf.educationField as string | null | undefined) ?? null,
    languages: (cf.languages as string | null | undefined) ?? null,
    certificates: (cf.certificates as string | null | undefined) ?? null,
    preferredSectors: Array.isArray(cf.preferredSectors)
      ? (cf.preferredSectors as string[])
      : null,
    preferredRoles: (cf.preferredRoles as string | null | undefined) ?? null,
    preferredCity: (cf.preferredCity as string | null | undefined) ?? null,
    workplacePreference: (cf.workplacePreference as string | null | undefined) ?? null,
    availability: (cf.availability as string | null | undefined) ?? null,
    experiences: parseCareerExperiences(cf.experiences),
    cvUrl: (cf.cvUrl as string | null | undefined) ?? null,
    kvkkConsents: (cf.kvkkConsents as Record<string, boolean> | null | undefined) ?? null,
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

export function candidatePayloadToCreateInput(
  payload: CandidateListingPayload,
): Pick<
  CreateListingInput,
  | 'title'
  | 'shortDescription'
  | 'longDescription'
  | 'city'
  | 'district'
  | 'customFields'
  | 'anonymousMode'
  | 'contactPhone'
> {
  const preferredCity = payload.preferredCity ?? payload.city ?? null;
  return {
    title: payload.title,
    shortDescription: payload.shortDescription,
    longDescription: payload.longDescription ?? '',
    city: preferredCity,
    district: payload.district ?? null,
    anonymousMode: true,
    contactPhone: payload.contactPhone ?? null,
    customFields: buildCustomFields(payload as unknown as Record<string, unknown>),
  };
}

export function candidatePayloadToUpdateInput(
  payload: Partial<CandidateListingPayload>,
  existing: Listing,
): UpdateListingInput {
  const update: UpdateListingInput = {};
  if (payload.title !== undefined) update.title = payload.title;
  if (payload.shortDescription !== undefined) update.shortDescription = payload.shortDescription;
  if (payload.longDescription !== undefined) update.longDescription = payload.longDescription;
  if (payload.city !== undefined) update.city = payload.city;
  if (payload.preferredCity !== undefined) update.city = payload.preferredCity;
  if (payload.district !== undefined) update.district = payload.district;
  if (payload.contactPhone !== undefined) update.contactPhone = payload.contactPhone;

  const customPatch = buildCustomFields(payload as unknown as Record<string, unknown>);
  if (Object.keys(customPatch).length > 0) {
    update.customFields = { ...existing.customFields, ...customPatch };
  }

  return update;
}
