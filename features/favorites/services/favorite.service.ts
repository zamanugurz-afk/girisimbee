import type { FavoriteId, ListingId, UserId } from '@/lib/domain/ids';
import type { Favorite, CreateFavoriteInput } from '@/features/favorites/types/favorite.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type { IFavoriteService } from '@/features/favorites/services/favorite.service.interface';
import type { FavoriteRepository } from '@/features/favorites/repositories/favorite.repository';
import { NotFoundError, ForbiddenError } from '@/lib/domain/errors';

export class FavoriteService implements IFavoriteService {
  constructor(private repo: FavoriteRepository) {}

  add(input: CreateFavoriteInput): Promise<Favorite> {
    return this.repo.create(input);
  }

  async remove(userId: UserId, listingId: ListingId): Promise<void> {
    const favorite = await this.repo.findByUserAndListing(userId, listingId);
    if (!favorite) throw new NotFoundError('Favorite', `${userId}:${listingId}`);
    await this.repo.delete(favorite.id);
  }

  async isFavorited(userId: UserId, listingId: ListingId): Promise<boolean> {
    const favorite = await this.repo.findByUserAndListing(userId, listingId);
    return Boolean(favorite);
  }

  listByUser(userId: UserId, pagination?: PaginationParams): Promise<PaginatedResult<Favorite>> {
    return this.repo.paginate({ userId, status: 'active' }, pagination);
  }

  async updateNote(id: FavoriteId, userId: UserId, note: string | null): Promise<Favorite> {
    const favorite = await this.repo.findById(id);
    if (!favorite) throw new NotFoundError('Favorite', id);
    if (favorite.userId !== userId) throw new ForbiddenError('Not your favorite');
    return this.repo.update(id, { note });
  }
}
