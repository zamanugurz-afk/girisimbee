import type { Repository } from '@/lib/domain/repository';
import type { FavoriteId } from '@/lib/domain/ids';
import type { Favorite, CreateFavoriteInput, UpdateFavoriteInput, FavoriteFilter } from '@/features/favorites/types/favorite.types';

export interface FavoriteRepository
  extends Repository<Favorite, FavoriteId, CreateFavoriteInput, UpdateFavoriteInput, FavoriteFilter> {
  findByUserAndListing(userId: Favorite['userId'], listingId: Favorite['listingId']): Promise<Favorite | null>;
  countByListingId(listingId: Favorite['listingId']): Promise<number>;
  /** Batch counts; map includes only listing IDs with count > 0. */
  countActiveByListingIds(listingIds: Favorite['listingId'][]): Promise<Map<Favorite['listingId'], number>>;
}
