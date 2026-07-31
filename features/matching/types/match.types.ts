/**
 * Match — investor↔startup or co-founder↔co-founder workflow.
 * v1: match → external contact (phone/WhatsApp/email/website).
 */
import type { Timestamps } from '@/lib/domain/base';
import type { MatchStatus } from '@/lib/domain/marketplace-enums';
import type { ModuleKey } from '@/lib/domain/modules';
import type { MatchId, ListingId, ProfileId } from '@/lib/domain/ids';

export interface Match extends Timestamps {
  id: MatchId;
  moduleKey: Extract<ModuleKey, 'entrepreneurs' | 'investors' | 'founders'>;
  listingId: ListingId | null;
  initiatorProfileId: ProfileId;
  targetProfileId: ProfileId;
  targetListingId: ListingId | null;
  status: MatchStatus;
  score: number | null;
  contactedAt: string | null;
  metadata: Record<string, unknown>;
}

export type CreateMatchInput = Pick<
  Match,
  'moduleKey' | 'initiatorProfileId' | 'targetProfileId'
> & {
  listingId?: ListingId | null;
  targetListingId?: ListingId | null;
  score?: number | null;
  metadata?: Record<string, unknown>;
};

export type UpdateMatchInput = Partial<
  Pick<Match, 'status' | 'contactedAt' | 'metadata' | 'score'>
>;

export interface MatchFilter {
  moduleKey?: Match['moduleKey'];
  listingId?: ListingId;
  initiatorProfileId?: ProfileId;
  targetProfileId?: ProfileId;
  status?: MatchStatus | MatchStatus[];
}
