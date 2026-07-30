import { ids } from '@/lib/domain/ids';
import { mockUuid, resetMockCounter } from '@/lib/domain/mock-utils';
import { createFavorite } from '@/features/favorites/factories/favorite.factory';
import type { Favorite } from '@/features/favorites/types/favorite.types';
import type { ListingId, UserId } from '@/lib/domain/ids';

export function generateMockFavorite(index = 1, userId?: UserId, listingId?: ListingId): Favorite {
  return createFavorite({
    id: ids.favorite(mockUuid('g0000001')),
    userId: userId ?? ids.user(mockUuid('a0000001')),
    listingId: listingId ?? ids.listing(mockUuid('d0000001')),
    note: index % 3 === 0 ? `Not ${index}` : null,
  });
}

export function generateMockFavorites(count: number, userId?: UserId): Favorite[] {
  resetMockCounter();
  return Array.from({ length: count }, (_, i) => generateMockFavorite(i + 1, userId));
}
