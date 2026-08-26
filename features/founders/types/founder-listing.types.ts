import type { Listing } from '@/features/listings/types/listing.entity.types';

/** Co-founder search fields stored in listings.customFields JSONB. */
export interface FounderListingDetails {
  founderType?: string | null;
  startupStage?: string | null;
  requiredSkills?: string[] | null;
  offeredSkills?: string[] | null;
  sectors?: string[] | null;
  sector?: string | null;
  partnershipIntent?: string | null;
  experience?: string | null;
  commitment?: string | null;
  partnershipType?: string | null;
  partnershipTypes?: string[] | null;
  partnershipTypesOther?: string | null;
  partnershipTypeOther?: string | null;
  expertise?: string[] | null;
  expertiseOther?: string | null;
  professionalSkills?: string[] | string | null;
  professionalSkillsOther?: string | null;
  technicalSkills?: string[] | string | null;
  technicalSkillsOther?: string | null;
  tools?: string[] | string | null;
  toolsOther?: string | null;
  projectStage?: string | null;
  equityOffered?: unknown;
}

/** Input payload for create/update founder co-founder search listings. */
export interface FounderListingPayload {
  title: string;
  shortDescription: string;
  longDescription?: string;
  city?: string | null;
  district?: string | null;
  sector?: string | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactEmail?: string | null;
  contactWebsite?: string | null;
  founderType?: string | null;
  startupStage?: string | null;
  requiredSkills?: string[] | null;
  offeredSkills?: string[] | null;
  sectors?: string[] | null;
  partnershipIntent?: string | null;
  projectStage?: string | null;
  experience?: string | null;
  commitment?: string | null;
  partnershipType?: string | null;
  partnershipTypes?: string[] | null;
  partnershipTypesOther?: string | null;
  partnershipTypeOther?: string | null;
  expertise?: string[] | null;
  expertiseOther?: string | null;
  professionalSkills?: string[] | string | null;
  professionalSkillsOther?: string | null;
  technicalSkills?: string[] | string | null;
  technicalSkillsOther?: string | null;
  tools?: string[] | string | null;
  toolsOther?: string | null;
  equityOffered?: unknown;
}

export interface FounderListingFilter {
  city?: string;
  district?: string;
  sector?: string;
  stage?: string;
  skills?: string[];
}

export interface FounderListingDetailViewModel {
  listing: Listing;
  details: FounderListingDetails;
}
