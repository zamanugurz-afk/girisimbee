import type { ListingId, UserId } from '@/lib/domain/ids';
import type { FavoriteListingRepository } from '@/features/favorites/repositories/favorite-listing.repository';
import type {
  AddFavoriteListingInput,
  FavoriteListing,
} from '@/features/favorites/types/favorite-listing.types';

export class MockFavoriteListingRepository implements FavoriteListingRepository {
  private rows: FavoriteListing[] = [];

  async add(input: AddFavoriteListingInput): Promise<FavoriteListing> {
    const existing = this.rows.find(
      (row) => row.userId === input.userId && row.listingId === input.listingId,
    );
    if (existing) return existing;
    const next: FavoriteListing = {
      userId: input.userId,
      listingId: input.listingId,
      createdAt: new Date().toISOString(),
    };
    this.rows.push(next);
    return next;
  }

  async remove(userId: UserId, listingId: ListingId): Promise<void> {
    this.rows = this.rows.filter(
      (row) => !(row.userId === userId && row.listingId === listingId),
    );
  }

  async listByUser(userId: UserId): Promise<FavoriteListing[]> {
    return this.rows
      .filter((row) => row.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async exists(userId: UserId, listingId: ListingId): Promise<boolean> {
    return this.rows.some(
      (row) => row.userId === userId && row.listingId === listingId,
    );
  }
}
