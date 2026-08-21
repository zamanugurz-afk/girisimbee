import type { UserId, CompanyId, ListingId, ProfileId } from '@/lib/domain/ids';

export type BusinessTransferMatchBand = 'very_strong' | 'strong' | 'suitable' | 'below_threshold';

export type BusinessTransferMatchDimensionKey =
  | 'sector'
  | 'budget'
  | 'location'
  | 'businessType'
  | 'operations';

export interface BusinessTransferOpportunityProfile {
  listingId: string;
  slug: string;
  title: string;
  businessName: string | null;
  businessType: string | null;
  sector: string | null;
  city: string | null;
  district: string | null;
  transferPrice: number | null;
  monthlyRent: number | null;
  businessAge: number | null;
  employeeCount: number | null;
  operationalStatus: string | null;
  transferScope: string[];
  reasonForTransfer: string | null;
  postTransferSupport: string | null;
  financialSummary: string | null;
  publishedAt: string | null;
}

export interface BusinessTransferSeekerProfile {
  userId?: UserId | null;
  profileId?: ProfileId | null;
  companyId?: CompanyId | null;
  budgetMax: number | null;
  preferredSectors: string[];
  preferredBusinessTypes: string[];
  city: string | null;
  district: string | null;
  operationalPreference: string | null;
  preferredStatus: string | null;
  relevantExperience: string | null;
}

export interface BusinessTransferDimensionResult {
  key: BusinessTransferMatchDimensionKey;
  label: string;
  weight: number;
  comparable: boolean;
  score: number | null;
}

export interface BusinessTransferMatchExplanation {
  kind: 'match' | 'gap';
  text: string;
}

export interface BusinessTransferMatchResult {
  score: number;
  band: BusinessTransferMatchBand;
  bandLabel: string;
  recommendable: boolean;
  reasons: BusinessTransferMatchExplanation[];
  dimensions: BusinessTransferDimensionResult[];
}

export interface BusinessTransferMatchCard {
  listingId: string;
  slug: string;
  href: string;
  title: string;
  businessName: string | null;
  businessType: string | null;
  sector: string | null;
  transferPrice: number | null;
  formattedPrice: string | null;
  location: string | null;
  publishedAt: string | null;
  score: number;
  band: Exclude<BusinessTransferMatchBand, 'below_threshold'>;
  bandLabel: string;
  reasons: BusinessTransferMatchExplanation[];
}

export interface BusinessTransferMatchSection {
  title: string;
  description: string;
  sourceListingId?: string | null;
  matches: BusinessTransferMatchCard[];
  totalMatchesCount?: number;
}
