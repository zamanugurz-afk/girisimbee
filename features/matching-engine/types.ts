/**
 * Generic matching-engine contracts.
 * V1 implements career (İş Arıyorum ↔ İşe Alıyorum) only.
 * Partnership / franchise / investment stay out of the visible engine.
 */

export type MatchDomain = 'career';

export type CareerListingKind = 'seek' | 'hire';

export type MatchDirection = 'opportunities' | 'candidates';

export type MatchBand = 'very_strong' | 'strong' | 'suitable' | 'below_threshold';

export type MatchDimensionKey =
  | 'role'
  | 'sector'
  | 'professionalSkills'
  | 'technicalSkills'
  | 'experience'
  | 'workModel'
  | 'location'
  | 'salary'
  | 'availability'
  | 'language'
  | 'education';

export interface CareerMatchProfile {
  role: string | null;
  roles: string[];
  sector: string | null;
  sectors: string[];
  professionalSkills: string[];
  technicalSkills: string[];
  experienceLevel: string | null;
  workType: string | null;
  workplacePreference: string | null;
  city: string | null;
  languages: string[];
  educationLevel: string | null;
  salary?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  availability?: string | null;
}

export interface MatchDimensionResult {
  key: MatchDimensionKey;
  label: string;
  weight: number;
  comparable: boolean;
  /** 0–1 when comparable; null when the dimension is skipped. */
  score: number | null;
  matchedCount?: number;
  missingCount?: number;
  requiredCount?: number;
}

export interface MatchExplanation {
  kind: 'match' | 'gap';
  text: string;
}

export interface MatchResult {
  domain: MatchDomain;
  score: number;
  band: MatchBand;
  bandLabel: string;
  recommendable: boolean;
  reasons: MatchExplanation[];
  dimensions: MatchDimensionResult[];
}

export interface CareerMatchCard {
  listingId: string;
  slug: string;
  href: string;
  title: string;
  listingKind: CareerListingKind;
  listingTypeLabel: string;
  /** Safe public party label — company / masked candidate name. Never contact channels. */
  partyLabel: string | null;
  sectorLabel?: string | null;
  experienceLabel: string | null;
  highlightSkills: string[];
  location: string | null;
  workModel: string | null;
  salary?: string | null;
  publishedAt: string | null;
  score: number;
  band: Exclude<MatchBand, 'below_threshold'>;
  bandLabel: string;
  reasons: MatchExplanation[];
}

export interface CareerMatchSection {
  direction: MatchDirection;
  title: string;
  description: string;
  sourceListingId: string;
  sourceTitle: string;
  sourceKind: CareerListingKind;
  matches: CareerMatchCard[];
  totalMatchesCount?: number;
}

export interface CareerMatchCompletionSummary {
  kind: CareerListingKind;
  listingId: string;
  percent: number;
  complete: boolean;
  missingLabels: string[];
}

export type CareerSourcePresence = 'none' | 'draft' | 'published';

export interface CareerMatchesResult {
  opportunities: CareerMatchSection | null;
  candidates: CareerMatchSection | null;
  completion?: {
    seek: CareerMatchCompletionSummary | null;
    hire: CareerMatchCompletionSummary | null;
  };
  presence?: {
    seek: CareerSourcePresence;
    hire: CareerSourcePresence;
  };
}
