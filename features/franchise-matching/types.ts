import type { UserId, CompanyId, ListingId, ProfileId } from '@/lib/domain/ids';

export type FranchiseMatchBand = 'very_strong' | 'strong' | 'suitable' | 'below_threshold';

export type FranchiseMatchDimensionKey =
  | 'sector'
  | 'budget'
  | 'location'
  | 'businessModel'
  | 'experience'
  | 'storeType';

export interface FranchiseOpportunityProfile {
  listingId: string;
  slug: string;
  title: string;
  companyName: string | null;
  sector: string | null;
  businessCategory: string | null;
  totalInvestment: number | null;
  minCapitalRequirement: number | null;
  franchiseFee: number | null;
  availableCities: string[];
  districts: string | null;
  minSquareMeters: number | null;
  storeSize: string | null;
  mallAvailable: boolean | null;
  streetStoreAvailable: boolean | null;
  experienceRequirement: string | null;
  returnPeriod: string | null;
  branchCount: number | null;
  publishedAt: string | null;
}

export interface FranchiseSeekerProfile {
  userId?: UserId | null;
  profileId?: ProfileId | null;
  companyId?: CompanyId | null;
  sector: string | null;
  city: string | null;
  district: string | null;
  minimumInvestment: number | null;
  maximumInvestment: number | null;
  preferredLocation: string | null;
  businessCategory: string | null;
  experience: string | null;
  mallPreference: boolean | null;
  streetStorePreference: boolean | null;
}

export interface FranchiseDimensionResult {
  key: FranchiseMatchDimensionKey;
  label: string;
  weight: number;
  comparable: boolean;
  score: number | null;
}

export interface FranchiseMatchExplanation {
  kind: 'match' | 'gap';
  text: string;
}

export interface FranchiseMatchResult {
  score: number;
  band: FranchiseMatchBand;
  bandLabel: string;
  recommendable: boolean;
  reasons: FranchiseMatchExplanation[];
  dimensions: FranchiseDimensionResult[];
}

export interface FranchiseMatchCard {
  listingId: string;
  slug: string;
  href: string;
  title: string;
  companyName: string | null;
  sector: string | null;
  businessCategory: string | null;
  totalInvestment: number | null;
  formattedInvestment: string | null;
  location: string | null;
  availableCities: string[];
  publishedAt: string | null;
  score: number;
  band: Exclude<FranchiseMatchBand, 'below_threshold'>;
  bandLabel: string;
  reasons: FranchiseMatchExplanation[];
}

export interface FranchiseMatchSection {
  title: string;
  description: string;
  sourceListingId?: string | null;
  matches: FranchiseMatchCard[];
  totalMatchesCount?: number;
}
