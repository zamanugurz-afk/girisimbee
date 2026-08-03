import type { ListingId, UserId } from '@/lib/domain/ids';
import type {
  AddFavoriteListingInput,
  FavoriteListing,
} from '@/features/favorites/types/favorite-listing.types';

export interface FavoriteListingRepository {
  add(input: AddFavoriteListingInput): Promise<FavoriteListing>;
  remove(userId: UserId, listingId: ListingId): Promise<void>;
  listByUser(userId: UserId): Promise<FavoriteListing[]>;
  exists(userId: UserId, listingId: ListingId): Promise<boolean>;
}
