import { ids } from '@/lib/domain/ids';
import { timestamps } from '@/lib/domain/factory';
import type { Match, CreateMatchInput } from '@/features/matching/types/match.types';

export function createMatch(overrides: Partial<Match> & CreateMatchInput): Match {
  return {
    id: overrides.id ?? ids.match(crypto.randomUUID()),
    moduleKey: overrides.moduleKey,
    listingId: overrides.listingId ?? null,
    initiatorProfileId: overrides.initiatorProfileId,
    targetProfileId: overrides.targetProfileId,
    targetListingId: overrides.targetListingId ?? null,
    status: overrides.status ?? 'requested',
    score: overrides.score ?? null,
    contactedAt: overrides.contactedAt ?? null,
    metadata: overrides.metadata ?? {},
    ...timestamps(overrides.createdAt),
  };
}
