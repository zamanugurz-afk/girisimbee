import { ids } from '@/lib/domain/ids';
import type { FavoriteListing } from '@/features/favorites/types/favorite-listing.types';

export interface FavoriteListingRow {
  user_id: string;
  listing_id: string;
  created_at: string;
}

export function mapFavoriteListingRow(row: FavoriteListingRow): FavoriteListing {
  return {
    userId: ids.user(row.user_id),
    listingId: ids.listing(row.listing_id),
    createdAt: row.created_at,
  };
}

export function toFavoriteListingInsert(input: {
  userId: string;
  listingId: string;
}): Omit<FavoriteListingRow, 'created_at'> & { created_at?: string } {
  return {
    user_id: input.userId,
    listing_id: input.listingId,
  };
}
