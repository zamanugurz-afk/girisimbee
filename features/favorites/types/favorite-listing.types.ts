/**
 * Simple favorite row — `favorite_listings` (user_id, listing_id, created_at).
 * Distinct from the richer `marketplace_favorites` domain entity.
 */
import type { ListingId, UserId } from '@/lib/domain/ids';

export interface FavoriteListing {
  userId: UserId;
  listingId: ListingId;
  createdAt: string;
}

export type AddFavoriteListingInput = {
  userId: UserId;
  listingId: ListingId;
};
