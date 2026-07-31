import type { Listing } from '@/features/listings/types/listing.entity.types';

/** Startup-specific fields stored in listings.customFields JSONB. */
export interface EntrepreneurListingDetails {
  investmentStage?: string | null;
  investmentTarget?: number | null;
  valuation?: number | null;
  monthlyRevenue?: number | null;
  teamSize?: number | null;
  businessModel?: string | null;
  pitchDeckDocumentId?: string | null;
}

/** Input payload for create/update entrepreneur startup listings. */
export interface EntrepreneurListingPayload {
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
  investmentStage?: string | null;
  investmentTarget?: number | null;
  valuation?: number | null;
  monthlyRevenue?: number | null;
  teamSize?: number | null;
  businessModel?: string | null;
  pitchDeckDocumentId?: string | null;
}

export interface EntrepreneurListingFilter {
  city?: string;
  district?: string;
  sector?: string;
  stage?: string;
}

export interface EntrepreneurListingDetailViewModel {
  listing: Listing;
  details: EntrepreneurListingDetails;
}
