import {
  extractCareerMatchProfile,
  normalizeCareerSource,
  toCareerMatchProfile,
  type CareerFieldSource,
} from '@/features/career-profile/normalize';
import { calculateCareerMatch } from '@/features/matching-engine/engine';
import type { CareerMatchProfile, MatchResult } from '@/features/matching-engine/types';

/**
 * Normalize stored seek/hire fields, then score.
 * Scoring weights stay in scoring.ts — this only prepares input.
 */
export function scoreNormalizedCareerSources(
  seeker: CareerFieldSource | null | undefined,
  hire: CareerFieldSource | null | undefined,
): MatchResult {
  return calculateCareerMatch(
    toCareerMatchProfile(normalizeCareerSource(seeker)),
    toCareerMatchProfile(normalizeCareerSource(hire)),
  );
}

export function profileFromCareerSource(source: CareerFieldSource | null | undefined): CareerMatchProfile {
  return extractCareerMatchProfile(source);
}
