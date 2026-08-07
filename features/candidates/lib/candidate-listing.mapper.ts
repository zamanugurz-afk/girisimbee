import type { CreateListingInput, Listing, UpdateListingInput } from '@/features/listings/types/listing.entity.types';
import type {
  CandidateListingDetails,
  CandidateListingPayload,
} from '@/features/candidates/types/candidate-listing.types';

const DETAIL_KEYS = [
  'desiredRole',
  'experienceLevel',
  'salaryExpectation',
  'workType',
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
  'title' | 'shortDescription' | 'longDescription' | 'city' | 'district' | 'customFields' | 'anonymousMode'
> {
  return {
    title: payload.title,
    shortDescription: payload.shortDescription,
    longDescription: payload.longDescription ?? '',
    city: payload.city ?? null,
    district: payload.district ?? null,
    anonymousMode: true,
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
  if (payload.district !== undefined) update.district = payload.district;

  const customPatch = buildCustomFields(payload as unknown as Record<string, unknown>);
  if (Object.keys(customPatch).length > 0) {
    update.customFields = { ...existing.customFields, ...customPatch };
  }

  return update;
}
