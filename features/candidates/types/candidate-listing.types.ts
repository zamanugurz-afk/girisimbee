import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';

/** Candidate job-seeker listing fields stored in listings.customFields JSONB. */
export interface CandidateListingDetails {
  desiredRole?: string | null;
  experienceLevel?: string | null;
  salaryExpectation?: string | null;
  workType?: string | null;
  professionalSkills?: string | null;
  technicalSkills?: string | null;
  leadershipExperience?: string | null;
  tools?: string | null;
  educationLevel?: string | null;
  educationField?: string | null;
  languages?: string | null;
  certificates?: string | null;
  preferredSectors?: string[] | null;
  preferredRoles?: string | null;
  preferredCity?: string | null;
  workplacePreference?: string | null;
  availability?: string | null;
  experiences?: CareerExperience[] | null;
  /** @deprecated CV no longer collected for anonymous career profiles */
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
  professionalSkills?: string | null;
  technicalSkills?: string | null;
  leadershipExperience?: string | null;
  tools?: string | null;
  educationLevel?: string | null;
  educationField?: string | null;
  languages?: string | null;
  certificates?: string | null;
  preferredSectors?: string[] | null;
  preferredRoles?: string | null;
  preferredCity?: string | null;
  workplacePreference?: string | null;
  availability?: string | null;
  experiences?: CareerExperience[] | null;
  cvUrl?: string | null;
  kvkkConsents?: Record<string, boolean> | null;
  publishConsents?: Record<string, boolean> | null;
  contactPhone?: string | null;
}

export interface CandidateListingFilter {
  city?: string;
  district?: string;
}

export interface CandidateListingDetailViewModel {
  listing: Listing;
  details: CandidateListingDetails;
}
