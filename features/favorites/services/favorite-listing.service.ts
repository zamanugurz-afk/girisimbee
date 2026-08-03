import type { ListingId, UserId } from '@/lib/domain/ids';
import type { FavoriteListingRepository } from '@/features/favorites/repositories/favorite-listing.repository';
import type {
  AddFavoriteListingInput,
  FavoriteListing,
} from '@/features/favorites/types/favorite-listing.types';

/**
 * Account / panel favorites API over favorite_listings.
 * Method names match ACCOUNT INTEGRATION – STEP 2 contract.
 */
export class FavoriteListingService {
  constructor(private readonly repo: FavoriteListingRepository) {}

  addFavorite(input: AddFavoriteListingInput): Promise<FavoriteListing> {
    return this.repo.add(input);
  }

  removeFavorite(userId: UserId, listingId: ListingId): Promise<void> {
    return this.repo.remove(userId, listingId);
  }

  async toggleFavorite(
    userId: UserId,
    listingId: ListingId,
  ): Promise<{ favorited: boolean; favorite: FavoriteListing | null }> {
    const isFav = await this.repo.exists(userId, listingId);
    if (isFav) {
      await this.repo.remove(userId, listingId);
      return { favorited: false, favorite: null };
    }
    const favorite = await this.repo.add({ userId, listingId });
    return { favorited: true, favorite };
  }

  getFavorites(userId: UserId): Promise<FavoriteListing[]> {
    return this.repo.listByUser(userId);
  }

  isFavorite(userId: UserId, listingId: ListingId): Promise<boolean> {
    return this.repo.exists(userId, listingId);
  }
}
