import type { Listing } from '@/features/listings/types/listing.entity.types';

/** Investor thesis-specific fields stored in listings.customFields JSONB. */
export interface InvestorListingDetails {
  investorType?: string | null;
  investmentStage?: string | null;
  minimumInvestment?: number | null;
  maximumInvestment?: number | null;
  portfolioSize?: number | null;
  sectors?: string[] | null;
}

/** Input payload for create/update investor investment thesis listings. */
export interface InvestorListingPayload {
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
  investorType?: string | null;
  investmentStage?: string | null;
  minimumInvestment?: number | null;
  maximumInvestment?: number | null;
  portfolioSize?: number | null;
  sectors?: string[] | null;
}

export interface InvestorListingFilter {
  city?: string;
  district?: string;
  sector?: string;
  stage?: string;
  minimumInvestment?: number;
  maximumInvestment?: number;
}

export interface InvestorListingDetailViewModel {
  listing: Listing;
  details: InvestorListingDetails;
}
