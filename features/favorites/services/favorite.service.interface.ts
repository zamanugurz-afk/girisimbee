import type { FavoriteId, ListingId, UserId } from '@/lib/domain/ids';
import type { Favorite, CreateFavoriteInput } from '@/features/favorites/types/favorite.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface IFavoriteService {
  add(input: CreateFavoriteInput): Promise<Favorite>;
  remove(userId: UserId, listingId: ListingId): Promise<void>;
  isFavorited(userId: UserId, listingId: ListingId): Promise<boolean>;
  listByUser(userId: UserId, pagination?: PaginationParams): Promise<PaginatedResult<Favorite>>;
  updateNote(id: FavoriteId, userId: UserId, note: string | null): Promise<Favorite>;
}
