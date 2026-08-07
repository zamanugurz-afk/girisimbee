import type { ListingId, ListingPlacementId, UserId } from '@/lib/domain/ids';
import type { ListingPlacementStatus } from '@/features/monetization/types/listing-placement.types';
import type { ListingPlacementRepository } from '@/features/monetization/repositories/listing-placement.repository';
import type {
  ListingPlacementRecord,
  PlacementType,
} from '@/features/monetization/types/listing-placement-record.types';

export class MockListingPlacementRepository implements ListingPlacementRepository {
  private rows: ListingPlacementRecord[] = [];

  async findById(id: ListingPlacementId) {
    return this.rows.find((row) => row.id === id) ?? null;
  }

  async listByUserId(userId: UserId) {
    return this.rows
      .filter((row) => row.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listByUserIdAndType(userId: UserId, placementType: PlacementType) {
    const all = await this.listByUserId(userId);
    return all.filter((row) => row.placementType === placementType);
  }

  async updateStatus(id: ListingPlacementId, status: ListingPlacementStatus) {
    const row = await this.findById(id);
    if (!row) throw new Error('Vitrin paketi bulunamadı.');
    row.status = status;
    return row;
  }

  async updateExpiresAt(
    id: ListingPlacementId,
    expiresAt: string,
    status?: ListingPlacementStatus,
  ) {
    const row = await this.findById(id);
    if (!row) throw new Error('Vitrin paketi bulunamadı.');
    row.expiresAt = expiresAt;
    if (status) row.status = status;
    return row;
  }

  async expireOverdue(nowIso = new Date().toISOString()) {
    let count = 0;
    for (const row of this.rows) {
      if (
        (row.status === 'active' || row.status === 'pending') &&
        row.expiresAt <= nowIso
      ) {
        row.status = 'expired';
        count += 1;
      }
    }
    return count;
  }

  async listActiveByListingId(listingId: ListingId) {
    return this.rows.filter(
      (row) => row.listingId === listingId && row.status === 'active',
    );
  }
}
