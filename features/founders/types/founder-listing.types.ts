import type { Listing } from '@/features/listings/types/listing.entity.types';

/** Co-founder search fields stored in listings.customFields JSONB. */
export interface FounderListingDetails {
  founderType?: string | null;
  startupStage?: string | null;
  requiredSkills?: string[] | null;
  offeredSkills?: string[] | null;
  sectors?: string[] | null;
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
