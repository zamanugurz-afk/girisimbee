import {
  getPartnershipMatchBand,
  getPartnershipMatchReasons,
  isRecommendablePartnershipMatch,
  PARTNERSHIP_MATCH_BAND_LABELS,
} from '@/features/partnership-matching/explain';
import { normalizePartnershipSource } from '@/features/partnership-matching/normalize';
import { normalizePartnershipScore, scorePartnershipDimensions } from '@/features/partnership-matching/scoring';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { PartnershipMatchProfile, PartnershipMatchResult } from '@/features/partnership-matching/types';

function emptyResult(): PartnershipMatchResult {
  return {
    score: 0,
    band: 'below_threshold',
    bandLabel: PARTNERSHIP_MATCH_BAND_LABELS.below_threshold,
    recommendable: false,
    reasons: [],
    dimensions: [],
  };
}

export function scorePartnershipProfiles(
  left: PartnershipMatchProfile,
  right: PartnershipMatchProfile,
): PartnershipMatchResult {
  if (left.intent === right.intent) return emptyResult();

  const dimensions = scorePartnershipDimensions(left, right);
  let weightedSum = 0;
  let usedWeight = 0;

  for (const dimension of dimensions) {
    if (!dimension.comparable || dimension.score == null) continue;
    weightedSum += dimension.score * dimension.weight;
    usedWeight += dimension.weight;
  }

  const score = normalizePartnershipScore(weightedSum, usedWeight);
  const band = getPartnershipMatchBand(score);

  return {
    score,
    band,
    bandLabel: PARTNERSHIP_MATCH_BAND_LABELS[band],
    recommendable: isRecommendablePartnershipMatch(score),
    reasons: getPartnershipMatchReasons(dimensions),
    dimensions,
  };
}

export function scorePartnershipSources(left: Listing, right: Listing): PartnershipMatchResult {
  return scorePartnershipProfiles(normalizePartnershipSource(left), normalizePartnershipSource(right));
}
