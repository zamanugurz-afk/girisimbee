import type { Listing } from '@/features/listings/types/listing.entity.types';
import type {
  FranchiseMatchResult,
  FranchiseOpportunityProfile,
  FranchiseSeekerProfile,
} from '@/features/franchise-matching/types';
import {
  extractFranchiseOpportunityProfile,
  isFranchiseListing,
} from '@/features/franchise-matching/normalize';
import {
  normalizeMatchScore,
  resolveScoreBand,
  scoreFranchiseDimensions,
} from '@/features/franchise-matching/scoring';
import { generateFranchiseMatchReasons } from '@/features/franchise-matching/explain';

export function calculateFranchiseMatch(
  seeker: FranchiseSeekerProfile,
  opp: FranchiseOpportunityProfile,
): FranchiseMatchResult {
  const dimensions = scoreFranchiseDimensions(seeker, opp);
  const score = normalizeMatchScore(dimensions);
  const { band, bandLabel, recommendable } = resolveScoreBand(score);
  const reasons = generateFranchiseMatchReasons(dimensions, seeker, opp);

  return {
    score,
    band,
    bandLabel,
    recommendable,
    reasons,
    dimensions,
  };
}

export function scoreFranchiseSources(
  seeker: FranchiseSeekerProfile,
  oppListing: Listing,
): FranchiseMatchResult | null {
  if (!isFranchiseListing(oppListing)) return null;
  const oppProfile = extractFranchiseOpportunityProfile(oppListing);
  return calculateFranchiseMatch(seeker, oppProfile);
}
