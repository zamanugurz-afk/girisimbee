import type { Listing } from '@/features/listings/types/listing.entity.types';

export type FranchiseFlow = 'buy' | 'give';

/** Franchise-specific fields stored in listings.customFields JSONB. */
export interface FranchiseBuyListingDetails {
  minimumYatirim?: number | null;
  maksimumYatirim?: number | null;
  tercihEdilenLokasyon?: string | null;
}

export interface FranchiseGiveListingDetails {
  franchiseBedeli?: number | null;
  minimumSermaye?: number | null;
  tahminiAylikCiro?: number | null;
  egitimDestegi?: boolean | null;
  operasyonDestegi?: boolean | null;
  pazarlamaDestegi?: boolean | null;
}

export type FranchiseListingDetails = FranchiseBuyListingDetails & FranchiseGiveListingDetails;

/** Input payload for create/update franchise listings. */
export interface FranchiseListingPayload {
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
  minimumYatirim?: number | null;
  maksimumYatirim?: number | null;
  tercihEdilenLokasyon?: string | null;
  franchiseBedeli?: number | null;
  minimumSermaye?: number | null;
  tahminiAylikCiro?: number | null;
  egitimDestegi?: boolean | null;
  operasyonDestegi?: boolean | null;
  pazarlamaDestegi?: boolean | null;
}

export interface FranchiseListingFilter {
  city?: string;
  district?: string;
  sector?: string;
}

export interface FranchiseListingDetailViewModel {
  listing: Listing;
  flow: FranchiseFlow;
  details: FranchiseListingDetails;
}
