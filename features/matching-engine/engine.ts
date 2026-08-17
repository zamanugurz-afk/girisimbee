import { getMatchBand, getMatchReasons, MATCH_BAND_LABELS, isRecommendableMatch } from '@/features/matching-engine/explain';
import { normalizeMatchScore, scoreCareerDimensions } from '@/features/matching-engine/scoring';
import type { CareerMatchProfile, MatchResult } from '@/features/matching-engine/types';

export function calculateCareerMatch(
  seeker: CareerMatchProfile,
  hire: CareerMatchProfile,
): MatchResult {
  const dimensions = scoreCareerDimensions(seeker, hire);
  let weightedSum = 0;
  let usedWeight = 0;

  for (const dimension of dimensions) {
    if (!dimension.comparable || dimension.score == null) continue;
    weightedSum += dimension.score * dimension.weight;
    usedWeight += dimension.weight;
  }

  const score = normalizeMatchScore(weightedSum, usedWeight);
  const band = getMatchBand(score);

  return {
    domain: 'career',
    score,
    band,
    bandLabel: MATCH_BAND_LABELS[band],
    recommendable: isRecommendableMatch(score),
    reasons: getMatchReasons(dimensions),
    dimensions,
  };
}
