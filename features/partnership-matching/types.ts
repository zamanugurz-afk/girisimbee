import type { PartnershipIntent } from '@/features/founders/partnership-intent';

export type PartnershipMatchIntent = PartnershipIntent;

export type PartnershipMatchDirection = 'partners' | 'ventures';

export type PartnershipMatchBand = 'very_strong' | 'strong' | 'suitable' | 'below_threshold';

export type PartnershipMatchDimensionKey =
  | 'skills'
  | 'sector'
  | 'partnershipType'
  | 'commitment'
  | 'stage'
  | 'experience'
  | 'location'
  | 'equity';

export interface PartnershipMatchProfile {
  intent: PartnershipMatchIntent;
  title: string;
  description: string;
  skills: string[];
  sectors: string[];
  partnershipTypes: string[];
  commitment: string | null;
  stage: string | null;
  experience: string | null;
  location: string | null;
  equity: number | null;
}

export interface ResolvedPartnershipSource {
  intent: PartnershipMatchIntent;
  title: string;
  description: string;
  expertise: string[];
  requiredSkills: string[];
  offeredSkills: string[];
  sectors: string[];
  partnershipTypes: string[];
  commitment: string | null;
  stage: string | null;
  experience: string | null;
  location: string | null;
  equityRaw: unknown;
}

export interface PartnershipMatchDimensionResult {
  key: PartnershipMatchDimensionKey;
  label: string;
  weight: number;
  comparable: boolean;
  score: number | null;
  matchedCount?: number;
  missingCount?: number;
}

export interface PartnershipMatchExplanation {
  kind: 'match' | 'gap';
  text: string;
}

export interface PartnershipMatchResult {
  score: number;
  band: PartnershipMatchBand;
  bandLabel: string;
  recommendable: boolean;
  reasons: PartnershipMatchExplanation[];
  dimensions: PartnershipMatchDimensionResult[];
}

export interface PartnershipMatchCard {
  listingId: string;
  slug: string;
  href: string;
  title: string;
  intent: PartnershipMatchIntent;
  expertise: string[];
  sectors: string[];
  experience: string | null;
  location: string | null;
  commitment: string | null;
  partnershipType: string | null;
  stage: string | null;
  preferredVentureType: string | null;
  publishedAt: string | null;
  score: number;
  band: Exclude<PartnershipMatchBand, 'below_threshold'>;
  bandLabel: string;
  reasons: PartnershipMatchExplanation[];
}

export interface PartnershipMatchSection {
  direction: PartnershipMatchDirection;
  title: string;
  description: string;
  sourceListingId: string;
  sourceTitle: string;
  sourceIntent: PartnershipMatchIntent;
  matches: PartnershipMatchCard[];
  totalMatchesCount?: number;
}

export interface PartnershipMatchCompletionSummary {
  intent: PartnershipMatchIntent;
  listingId: string;
  percent: number;
  complete: boolean;
  missingLabels: string[];
}

export type PartnershipSourcePresence = 'none' | 'draft' | 'published';

export interface PartnershipMatchesResult {
  partners: PartnershipMatchSection | null;
  ventures: PartnershipMatchSection | null;
  completion: {
    seeking: PartnershipMatchCompletionSummary | null;
    joining: PartnershipMatchCompletionSummary | null;
  };
  presence: {
    seeking: PartnershipSourcePresence;
    joining: PartnershipSourcePresence;
  };
  editListingId: string | null;
}
