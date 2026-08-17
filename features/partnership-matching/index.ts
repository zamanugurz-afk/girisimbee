export { scorePartnershipProfiles, scorePartnershipSources } from '@/features/partnership-matching/engine';
export {
  normalizePartnershipSource,
  resolvePartnershipSource,
  isPartnershipListing,
} from '@/features/partnership-matching/normalize';
export { createPartnershipMatchService, PartnershipMatchService } from '@/features/partnership-matching/service';
export { PartnershipMatchResults } from '@/features/partnership-matching/presentation/partnership-match-results';
export type { PartnershipMatchesResult, PartnershipMatchCard } from '@/features/partnership-matching/types';
