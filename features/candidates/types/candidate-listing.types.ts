import type { Listing } from '@/features/listings/types/listing.entity.types';

/** Candidate job-seeker listing fields stored in listings.customFields JSONB. */
export interface CandidateListingDetails {
  desiredRole?: string | null;
  experienceLevel?: string | null;
  salaryExpectation?: string | null;
  workType?: string | null;
  cvUrl?: string | null;
  kvkkConsents?: Record<string, boolean> | null;
}

/** Input payload for create/update candidate listings. */
export interface CandidateListingPayload {
  title: string;
  shortDescription: string;
  longDescription?: string;
  city?: string | null;
  district?: string | null;
  desiredRole?: string | null;
  experienceLevel?: string | null;
  salaryExpectation?: string | null;
  workType?: string | null;
  cvUrl?: string | null;
  kvkkConsents?: Record<string, boolean> | null;
}

export interface CandidateListingFilter {
  city?: string;
  district?: string;
}

export interface CandidateListingDetailViewModel {
  listing: Listing;
  details: CandidateListingDetails;
}
