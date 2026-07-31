import { fromTimestamps } from '@/lib/persistence/mappers';
import type { MatchId, ListingId, ProfileId } from '@/lib/domain/ids';
import type { ModuleKey } from '@/lib/domain/modules';
import type { MatchStatus } from '@/lib/domain/marketplace-enums';
import type { Match } from '@/features/matching/types/match.types';

export interface MatchRow {
  id: string;
  module_key: string;
  listing_id: string | null;
  initiator_profile_id: string;
  target_profile_id: string;
  target_listing_id: string | null;
  status: string;
  score: string | null;
  contacted_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function mapMatchRow(row: MatchRow): Match {
  return {
    id: row.id as MatchId,
    moduleKey: row.module_key as Extract<ModuleKey, 'entrepreneurs' | 'investors' | 'founders'>,
    listingId: row.listing_id as ListingId | null,
    initiatorProfileId: row.initiator_profile_id as ProfileId,
    targetProfileId: row.target_profile_id as ProfileId,
    targetListingId: row.target_listing_id as ListingId | null,
    status: row.status as MatchStatus,
    score: row.score ? Number(row.score) : null,
    contactedAt: row.contacted_at,
    metadata: row.metadata ?? {},
    ...fromTimestamps(row),
  };
}

export function toMatchRow(input: Partial<Match>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.moduleKey !== undefined) row.module_key = input.moduleKey;
  if (input.listingId !== undefined) row.listing_id = input.listingId;
  if (input.initiatorProfileId !== undefined) row.initiator_profile_id = input.initiatorProfileId;
  if (input.targetProfileId !== undefined) row.target_profile_id = input.targetProfileId;
  if (input.targetListingId !== undefined) row.target_listing_id = input.targetListingId;
  if (input.status !== undefined) row.status = input.status;
  if (input.score !== undefined) row.score = input.score;
  if (input.contactedAt !== undefined) row.contacted_at = input.contactedAt;
  if (input.metadata !== undefined) row.metadata = input.metadata;
  return row;
}
