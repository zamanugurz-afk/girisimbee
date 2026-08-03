import type { ListingId, ListingPlacementId, UserId } from '@/lib/domain/ids';
import type { ListingPlacementStatus } from '@/features/monetization/types/listing-placement.types';
import type {
  ListingPlacementRecord,
  PlacementType,
} from '@/features/monetization/types/listing-placement-record.types';

export interface ListingPlacementRepository {
  findById(id: ListingPlacementId): Promise<ListingPlacementRecord | null>;
  listByUserId(userId: UserId): Promise<ListingPlacementRecord[]>;
  listByUserIdAndType(
    userId: UserId,
    placementType: PlacementType,
  ): Promise<ListingPlacementRecord[]>;
  updateStatus(
    id: ListingPlacementId,
    status: ListingPlacementStatus,
  ): Promise<ListingPlacementRecord>;
  updateExpiresAt(
    id: ListingPlacementId,
    expiresAt: string,
    status?: ListingPlacementStatus,
  ): Promise<ListingPlacementRecord>;
  expireOverdue(nowIso?: string): Promise<number>;
  listActiveByListingId(listingId: ListingId): Promise<ListingPlacementRecord[]>;
}
