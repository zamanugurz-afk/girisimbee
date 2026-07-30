import type { Repository } from '@/lib/domain/repository';
import type { FavoriteId } from '@/lib/domain/ids';
import type { Favorite, CreateFavoriteInput, UpdateFavoriteInput, FavoriteFilter } from '@/features/favorites/types/favorite.types';

export interface FavoriteRepository
  extends Repository<Favorite, FavoriteId, CreateFavoriteInput, UpdateFavoriteInput, FavoriteFilter> {
  findByUserAndListing(userId: Favorite['userId'], listingId: Favorite['listingId']): Promise<Favorite | null>;
  countByListingId(listingId: Favorite['listingId']): Promise<number>;
}
