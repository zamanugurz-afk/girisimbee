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
  preferredStages?: string[] | string | null;
  investmentAmount?: string | null;
  investmentAmountCustom?: string | null;
  ticketMin?: number | null;
  ticketMax?: number | null;
  preferredProductStatuses?: string[] | null;
  preferredBusinessModels?: string[] | null;
  preferredTargetCustomers?: string[] | null;
  revenueExpectation?: string | null;
  tractionExpectation?: string | null;
  preferredGeographies?: string[] | null;
  equityPreference?: string | null;
  valuationApproach?: string | null;
  preferredUseOfFunds?: string[] | null;
  investmentThesis?: string | null;
  mustHaveSignals?: string[] | null;
  dealBreakers?: string[] | null;
  investorAiAnalysis?: unknown;
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
