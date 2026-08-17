import { MATCH_RECOMMENDATION_THRESHOLD } from '@/features/matching-engine/scoring';
import type { CareerMatchCard } from '@/features/matching-engine/types';

export type MatchMinScoreFilter = 'all' | '65' | '80';
export type MatchSort = 'score' | 'newest';

export interface CareerMatchFilterState {
  minScore: MatchMinScoreFilter;
  location: string;
  workModel: string;
  sort: MatchSort;
}

export const DEFAULT_MATCH_FILTERS: CareerMatchFilterState = {
  minScore: 'all',
  location: 'all',
  workModel: 'all',
  sort: 'score',
};

export function uniqueFilterValues(cards: readonly CareerMatchCard[], key: 'location' | 'workModel'): string[] {
  const values = cards
    .map((card) => card[key])
    .filter((value): value is string => Boolean(value && value.trim()));
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'tr'));
}

export function filterAndSortMatchCards(
  cards: readonly CareerMatchCard[],
  filters: CareerMatchFilterState,
): CareerMatchCard[] {
  const minScore =
    filters.minScore === 'all' ? MATCH_RECOMMENDATION_THRESHOLD : Number(filters.minScore);

  const filtered = cards.filter((card) => {
    if (card.score < MATCH_RECOMMENDATION_THRESHOLD) return false;
    if (card.score < minScore) return false;
    if (filters.location !== 'all' && card.location !== filters.location) return false;
    if (filters.workModel !== 'all' && card.workModel !== filters.workModel) return false;
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
