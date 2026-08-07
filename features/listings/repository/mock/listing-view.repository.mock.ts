import type { ListingId, ListingViewId, UserId } from '@/lib/domain/ids';
import type { ListingViewRepository } from '@/features/listings/repositories/listing-view.repository';
import type {
  ListingView,
  RecordListingViewInput,
} from '@/features/listings/types/listing-view.types';

export class MockListingViewRepository implements ListingViewRepository {
  private rows: ListingView[] = [];

  async insert(
    input: RecordListingViewInput & { id: ListingViewId },
  ): Promise<ListingView> {
    const row: ListingView = {
      id: input.id,
      listingId: input.listingId,
      viewerId: input.viewerId ?? null,
      ipAddress: input.ipAddress ?? null,
      deviceType: input.deviceType ?? 'unknown',
      createdAt: new Date().toISOString(),
    };
    this.rows.push(row);
    return row;
  }

  async findRecentByViewer(
    listingId: ListingId,
    viewerId: UserId,
    sinceIso: string,
  ): Promise<ListingView | null> {
    return (
      this.rows.find(
        (row) =>
          row.listingId === listingId &&
          row.viewerId === viewerId &&
          row.createdAt >= sinceIso,
      ) ?? null
    );
  }

  async findRecentByIp(
    listingId: ListingId,
    ipAddress: string,
    sinceIso: string,
  ): Promise<ListingView | null> {
    return (
      this.rows.find(
        (row) =>
          row.listingId === listingId &&
          row.ipAddress === ipAddress &&
          row.createdAt >= sinceIso,
      ) ?? null
    );
  }

  async countByListing(listingId: ListingId): Promise<number> {
    return this.rows.filter((row) => row.listingId === listingId).length;
  }

  async countUniqueByListing(listingId: ListingId): Promise<number> {
    const keys = new Set<string>();
    for (const row of this.rows) {
      if (row.listingId !== listingId) continue;
      if (row.viewerId) keys.add(`u:${row.viewerId}`);
      else if (row.ipAddress) keys.add(`ip:${row.ipAddress}`);
      else keys.add(`anon:${row.id}`);
    }
    return keys.size;
  }

  async countSince(listingId: ListingId, sinceIso: string): Promise<number> {
    return this.rows.filter(
      (row) => row.listingId === listingId && row.createdAt >= sinceIso,
    ).length;
  }
}
