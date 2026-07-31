import type { Repository } from '@/lib/domain/repository';
import type { MatchId } from '@/lib/domain/ids';
import type {
  Match,
  CreateMatchInput,
  UpdateMatchInput,
  MatchFilter,
} from '@/features/matching/types/match.types';

export interface MatchRepository
  extends Repository<Match, MatchId, CreateMatchInput, UpdateMatchInput, MatchFilter> {
  findForProfile(profileId: Match['initiatorProfileId']): Promise<Match[]>;
  findForListing(listingId: NonNullable<Match['listingId']>): Promise<Match[]>;
  transitionStatus(id: MatchId, status: Match['status']): Promise<Match>;
}
