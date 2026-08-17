import type { Listing } from '@/features/listings/types/listing.entity.types';
import type {
  DigitalSolutionConsumerProfile,
  DigitalSolutionMatchResult,
  DigitalSolutionProfile,
} from '@/features/digital-solution-matching/types';
import {
  extractDigitalSolutionProfile,
  isDigitalSolutionListing,
} from '@/features/digital-solution-matching/normalize';
import {
  normalizeMatchScore,
  resolveScoreBand,
  scoreDigitalSolutionDimensions,
} from '@/features/digital-solution-matching/scoring';
import { generateDigitalSolutionMatchReasons } from '@/features/digital-solution-matching/explain';

export function calculateDigitalSolutionMatch(
  consumer: DigitalSolutionConsumerProfile,
  solution: DigitalSolutionProfile,
): DigitalSolutionMatchResult {
  const dimensions = scoreDigitalSolutionDimensions(consumer, solution);
  const score = normalizeMatchScore(dimensions);
  const { band, bandLabel, recommendable } = resolveScoreBand(score);
  const reasons = generateDigitalSolutionMatchReasons(dimensions, consumer, solution);

  return {
    score,
    band,
    bandLabel,
    recommendable,
    reasons,
    dimensions,
  };
}

export function scoreDigitalSolutionSources(
  consumer: DigitalSolutionConsumerProfile,
  solutionListing: Listing,
): DigitalSolutionMatchResult | null {
  if (!isDigitalSolutionListing(solutionListing)) return null;
  const solutionProfile = extractDigitalSolutionProfile(solutionListing);
  return calculateDigitalSolutionMatch(consumer, solutionProfile);
}
