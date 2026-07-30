/**
 * Mock favorite repository — in-memory favorites store.
 */
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError, ConflictError } from '@/lib/domain/errors';
import type { FavoriteId, UserId, ListingId } from '@/lib/domain/ids';
import type { Favorite, CreateFavoriteInput, UpdateFavoriteInput, FavoriteFilter } from '@/features/favorites/types/favorite.types';
import type { FavoriteRepository } from '@/features/favorites/repositories/favorite.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createFavorite } from '@/features/favorites/factories/favorite.factory';

export class MockFavoriteRepository implements FavoriteRepository {
  private favorites = new Map<FavoriteId, Favorite>();

  async findById(id: FavoriteId, filter?: RepositoryFilter): Promise<Favorite | null> {
    const fav = this.favorites.get(id);
    if (!fav) return null;
    if (!filter?.includeDeleted && fav.deletedAt) return null;
    return fav;
  }

  async findByUserAndListing(userId: UserId, listingId: ListingId): Promise<Favorite | null> {
    const fav = [...this.favorites.values()].find(
      (f) => f.userId === userId && f.listingId === listingId && !f.deletedAt,
    );
    return fav ?? null;
  }

  async findMany(filter: FavoriteFilter, pagination?: PaginationParams): Promise<PaginatedResult<Favorite>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.favorites.values()];
    if (!filter.includeDeleted) results = results.filter((f) => !f.deletedAt);
    if (filter.userId) results = results.filter((f) => f.userId === filter.userId);
    if (filter.listingId) results = results.filter((f) => f.listingId === filter.listingId);
    if (filter.status) results = results.filter((f) => f.status === filter.status);
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: FavoriteFilter, pagination?: PaginationParams): Promise<PaginatedResult<Favorite>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: FavoriteFilter, pagination?: PaginationParams): Promise<PaginatedResult<Favorite>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: FavoriteFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async countByListingId(listingId: ListingId): Promise<number> {
    return this.count({ listingId, status: 'active' });
  }

  async exists(id: FavoriteId): Promise<boolean> {
    return this.favorites.has(id);
  }

  async create(input: CreateFavoriteInput): Promise<Favorite> {
    const existing = await this.findByUserAndListing(input.userId, input.listingId);
    if (existing) throw new ConflictError('Favorite already exists');
    const favorite = createFavorite(input);
    this.favorites.set(favorite.id, favorite);
    return favorite;
  }

  async update(id: FavoriteId, input: UpdateFavoriteInput): Promise<Favorite> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Favorite', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.favorites.set(id, updated);
    return updated;
  }

  async softDelete(id: FavoriteId): Promise<void> {
    const fav = await this.findById(id);
    if (!fav) throw new NotFoundError('Favorite', id);
    this.favorites.set(id, { ...fav, status: 'deleted', deletedAt: now(), updatedAt: now() });
  }

  async delete(id: FavoriteId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: FavoriteId): Promise<Favorite> {
    const fav = await this.findById(id, { includeDeleted: true });
    if (!fav) throw new NotFoundError('Favorite', id);
    const updated = { ...fav, status: 'active' as Favorite['status'], deletedAt: null, updatedAt: now() };
    this.favorites.set(id, updated);
    return updated;
  }
}

export const mockFavoriteRepository = new MockFavoriteRepository();
