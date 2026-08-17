import { PARTNERSHIP_RECOMMENDATION_THRESHOLD } from '@/features/partnership-matching/scoring';
import type { PartnershipMatchCard } from '@/features/partnership-matching/types';

export type PartnershipMinScoreFilter = '50' | '65' | '80';
export type PartnershipMatchSort = 'score' | 'newest';

export interface PartnershipMatchFilterState {
  minScore: PartnershipMinScoreFilter;
  location: string;
  partnershipType: string;
  sort: PartnershipMatchSort;
}

export const DEFAULT_PARTNERSHIP_MATCH_FILTERS: PartnershipMatchFilterState = {
  minScore: '50',
  location: 'all',
  partnershipType: 'all',
  sort: 'score',
};

export const PARTNERSHIP_FILTER_QUERY = {
  minScore: 'uyum',
  location: 'lokasyon',
  partnershipType: 'tip',
  sort: 'sira',
} as const;

function readParam(
  source: URLSearchParams | Record<string, string | undefined> | null | undefined,
  key: string,
): string | undefined {
  if (!source) return undefined;
  if (source instanceof URLSearchParams) return source.get(key) ?? undefined;
  return source[key];
}

export function parsePartnershipMatchFilters(
  source?: URLSearchParams | Record<string, string | undefined> | null,
): PartnershipMatchFilterState {
  const min = readParam(source, PARTNERSHIP_FILTER_QUERY.minScore);
  const sort = readParam(source, PARTNERSHIP_FILTER_QUERY.sort);
  return {
    minScore: min === '65' || min === '80' || min === '50' ? min : DEFAULT_PARTNERSHIP_MATCH_FILTERS.minScore,
    location: readParam(source, PARTNERSHIP_FILTER_QUERY.location) || DEFAULT_PARTNERSHIP_MATCH_FILTERS.location,
    partnershipType:
      readParam(source, PARTNERSHIP_FILTER_QUERY.partnershipType) || DEFAULT_PARTNERSHIP_MATCH_FILTERS.partnershipType,
    sort: sort === 'newest' || sort === 'score' ? sort : DEFAULT_PARTNERSHIP_MATCH_FILTERS.sort,
  };
}

export function partnershipMatchFiltersAreDefault(filters: PartnershipMatchFilterState): boolean {
  return (
    filters.minScore === DEFAULT_PARTNERSHIP_MATCH_FILTERS.minScore
    && filters.location === DEFAULT_PARTNERSHIP_MATCH_FILTERS.location
    && filters.partnershipType === DEFAULT_PARTNERSHIP_MATCH_FILTERS.partnershipType
    && filters.sort === DEFAULT_PARTNERSHIP_MATCH_FILTERS.sort
  );
}

export function partnershipMatchFiltersToQuery(filters: PartnershipMatchFilterState): string {
  const params = new URLSearchParams();
  if (filters.minScore !== DEFAULT_PARTNERSHIP_MATCH_FILTERS.minScore) {
    params.set(PARTNERSHIP_FILTER_QUERY.minScore, filters.minScore);
  }
  if (filters.location !== DEFAULT_PARTNERSHIP_MATCH_FILTERS.location) {
    params.set(PARTNERSHIP_FILTER_QUERY.location, filters.location);
  }
  if (filters.partnershipType !== DEFAULT_PARTNERSHIP_MATCH_FILTERS.partnershipType) {
    params.set(PARTNERSHIP_FILTER_QUERY.partnershipType, filters.partnershipType);
  }
  if (filters.sort !== DEFAULT_PARTNERSHIP_MATCH_FILTERS.sort) {
    params.set(PARTNERSHIP_FILTER_QUERY.sort, filters.sort);
  }
  return params.toString();
}

export function uniquePartnershipFilterValues(
  cards: readonly PartnershipMatchCard[],
  key: 'location' | 'partnershipType',
): string[] {
  const values = cards
    .map((card) => card[key])
    .filter((value): value is string => Boolean(value && value.trim()));
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'tr'));
}

export function filterAndSortPartnershipMatchCards(
  cards: readonly PartnershipMatchCard[],
  filters: PartnershipMatchFilterState,
): PartnershipMatchCard[] {
  const minScore = Number(filters.minScore);

  const filtered = cards.filter((card) => {
    if (card.score < PARTNERSHIP_RECOMMENDATION_THRESHOLD) return false;
    if (card.score < minScore) return false;
    if (filters.location !== 'all' && card.location !== filters.location) return false;
    if (filters.partnershipType !== 'all' && card.partnershipType !== filters.partnershipType) {
      return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (filters.sort === 'newest') {
      const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bTime - aTime || b.score - a.score;
    }
    return b.score - a.score || a.title.localeCompare(b.title, 'tr');
  });
}
