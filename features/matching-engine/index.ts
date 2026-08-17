export { calculateCareerMatch } from '@/features/matching-engine/engine';
export { scoreNormalizedCareerSources } from '@/features/matching-engine/normalized-match';
export { getMatchReasons, getMatchBand, isRecommendableMatch, selectDisplayReasons } from '@/features/matching-engine/explain';
export { normalizeMatchScore, CAREER_MATCH_WEIGHTS, MATCH_RECOMMENDATION_THRESHOLD } from '@/features/matching-engine/scoring';
export { extractCareerMatchProfile } from '@/features/matching-engine/adapters/career-fields';
export { classifyCareerListingKind } from '@/features/matching-engine/adapters/career-listing-kinds';
export { toPublicCareerMatchCard } from '@/features/matching-engine/adapters/public-card';
export { CareerMatchService, createCareerMatchService } from '@/features/matching-engine/career-match.service';
export {
  MATCH_SECTION_COPY,
  formatMatchScore,
  presentMatchReasons,
} from '@/features/matching-engine/presentation/career-match-copy';
export { filterAndSortMatchCards } from '@/features/matching-engine/presentation/career-match-filters';
export type {
  CareerMatchCard,
  CareerMatchProfile,
  CareerMatchesResult,
  MatchExplanation,
  MatchResult,
} from '@/features/matching-engine/types';
