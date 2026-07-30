import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type { Favorite, CreateFavoriteInput } from '@/features/favorites/types/favorite.types';

export function createFavorite(overrides: Partial<Favorite> & Pick<Favorite, 'userId' | 'listingId'>): Favorite {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.favorite(crypto.randomUUID()),
    userId: overrides.userId,
    listingId: overrides.listingId,
    status: overrides.status ?? 'active',
    note: overrides.note ?? null,
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createFavoriteInput(overrides: Partial<CreateFavoriteInput> = {}): CreateFavoriteInput {
  return {
    userId: overrides.userId ?? ids.user(crypto.randomUUID()),
    listingId: overrides.listingId ?? ids.listing(crypto.randomUUID()),
    note: overrides.note,
  };
}
