import type { UserId, CompanyId, ListingId } from '@/lib/domain/ids';

export type DigitalSolutionMatchBand = 'very_strong' | 'strong' | 'suitable' | 'below_threshold';

export type DigitalSolutionMatchDimensionKey =
  | 'sector'
  | 'targetAudience'
  | 'capabilities'
  | 'solutionType'
  | 'deliveryModel'
  | 'location'
  | 'priceRange'
  | 'language';

export interface DigitalSolutionProfile {
  listingId: string;
  title: string;
  shortDescription: string;
  solutionType: string | null;
  deliveryModel: string | null;
  targetAudience: string | null;
  priceRange: string | null;
  demoUrl: string | null;
  capabilities: string[];
  supportedLanguages: string[];
  industry: string | null;
  city: string | null;
  location: string | null;
  publishedAt: string | null;
}

export interface DigitalSolutionConsumerProfile {
  companyId?: CompanyId | null;
  userId?: UserId | null;
  companyName?: string | null;
  industry: string | null;
  companySize: string | null;
  targetAudienceHints: string[];
  neededCapabilities: string[];
  preferredSolutionTypes: string[];
  preferredDeliveryModels: string[];
  priceBudget: string | null;
  city: string | null;
  location: string | null;
  languages: string[];
}

export interface DigitalSolutionDimensionResult {
  key: DigitalSolutionMatchDimensionKey;
  label: string;
  weight: number;
  comparable: boolean;
  score: number | null;
  matchedCount?: number;
  missingCount?: number;
}

export interface DigitalSolutionMatchExplanation {
  kind: 'match' | 'gap';
  text: string;
}

export interface DigitalSolutionMatchResult {
  score: number;
  band: DigitalSolutionMatchBand;
  bandLabel: string;
  recommendable: boolean;
  reasons: DigitalSolutionMatchExplanation[];
  dimensions: DigitalSolutionDimensionResult[];
}

export interface DigitalSolutionMatchCard {
  listingId: string;
  slug: string;
  href: string;
  title: string;
  shortDescription: string;
  solutionType: string | null;
  deliveryModel: string | null;
  targetAudience: string | null;
  priceRange: string | null;
  capabilities: string[];
  city: string | null;
  industry: string | null;
  publishedAt: string | null;
  score: number;
  band: Exclude<DigitalSolutionMatchBand, 'below_threshold'>;
  bandLabel: string;
  reasons: DigitalSolutionMatchExplanation[];
}

export interface DigitalSolutionMatchSection {
  title: string;
  description: string;
  sourceListingId?: string | null;
  matches: DigitalSolutionMatchCard[];
  totalMatchesCount?: number;
}

export interface DigitalSolutionMatchesResult {
  solutions: DigitalSolutionMatchSection | null;
  hasConsumerContext: boolean;
  missingContextLabel?: string | null;
}
