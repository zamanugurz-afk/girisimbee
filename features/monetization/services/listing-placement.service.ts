import type { ListingPlacementId, UserId } from '@/lib/domain/ids';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ListingPlacementRepository } from '@/features/monetization/repositories/listing-placement.repository';
import { PLACEMENT_PACKAGE_CONFIG } from '@/features/monetization/types/listing-placement.types';
import type {
  ExtendPlacementInput,
  ListingPlacementRecord,
  PlacementType,
} from '@/features/monetization/types/listing-placement-record.types';

/**
 * Account panel placements API over marketplace_listing_placements.
 * Method names match ACCOUNT INTEGRATION – STEP 5 contract.
 */
export class ListingPlacementService {
  constructor(
    private readonly placements: ListingPlacementRepository,
    private readonly listings: ListingRepository,
  ) {}

  async getPlacements(userId: UserId): Promise<ListingPlacementRecord[]> {
    await this.placements.expireOverdue();
    return this.placements.listByUserId(userId);
  }

  async getFeaturedPlacements(userId: UserId): Promise<ListingPlacementRecord[]> {
    await this.placements.expireOverdue();
    return this.placements.listByUserIdAndType(userId, 'featured');
  }

  async getUrgentPlacements(userId: UserId): Promise<ListingPlacementRecord[]> {
    await this.placements.expireOverdue();
    return this.placements.listByUserIdAndType(userId, 'urgent');
  }

  async activatePlacement(id: ListingPlacementId): Promise<ListingPlacementRecord> {
    const current = await this.placements.findById(id);
    if (!current) throw new Error('Vitrin paketi bulunamadı.');

    const now = Date.now();
    const expiresMs = new Date(current.expiresAt).getTime();
    if (Number.isNaN(expiresMs) || expiresMs <= now) {
      throw new Error('Süresi dolmuş paket aktifleştirilemez. Önce süreyi uzatın.');
    }

    const updated = await this.placements.updateStatus(id, 'active');
    await this.syncListingFlags(updated.listingId);
    return updated;
  }

  async cancelPlacement(id: ListingPlacementId): Promise<ListingPlacementRecord> {
    const updated = await this.placements.updateStatus(id, 'cancelled');
    await this.syncListingFlags(updated.listingId);
    return updated;
  }

  async extendPlacement(
    id: ListingPlacementId,
    input: ExtendPlacementInput = {},
  ): Promise<ListingPlacementRecord> {
    const current = await this.placements.findById(id);
    if (!current) throw new Error('Vitrin paketi bulunamadı.');

    const days =
      input.days ??
      PLACEMENT_PACKAGE_CONFIG[current.packageSlug]?.durationDays ??
      30;

    const baseMs = Math.max(
      Date.now(),
      new Date(current.expiresAt).getTime() || 0,
    );
    const expiresAt = new Date(baseMs + days * 24 * 60 * 60 * 1000).toISOString();

    const updated = await this.placements.updateExpiresAt(id, expiresAt, 'active');
    await this.syncListingFlags(updated.listingId);
    return updated;
  }

  async isPlacementActive(id: ListingPlacementId): Promise<boolean> {
    await this.placements.expireOverdue();
    const placement = await this.placements.findById(id);
    if (!placement || placement.status !== 'active') return false;
    return new Date(placement.expiresAt).getTime() > Date.now();
  }

  /** Featured + urgent can coexist — recompute listing denormalized flags. */
  private async syncListingFlags(listingId: ListingPlacementRecord['listingId']) {
    const active = await this.placements.listActiveByListingId(listingId);
    const now = Date.now();
    const live = active.filter((row) => new Date(row.expiresAt).getTime() > now);

    const featured = live.filter((row) => row.placementType === 'featured');
    const urgent = live.filter((row) => row.placementType === 'urgent');

    const featuredUntil =
      featured.length > 0
        ? featured
            .map((row) => row.expiresAt)
            .sort((a, b) => b.localeCompare(a))[0]
        : null;
    const urgentUntil =
      urgent.length > 0
        ? urgent
            .map((row) => row.expiresAt)
            .sort((a, b) => b.localeCompare(a))[0]
        : null;

    await this.listings.update(listingId, {
      isFeatured: featured.length > 0,
      isUrgent: urgent.length > 0,
      featuredUntil,
      urgentUntil,
    });
  }
}

export function remainingDays(expiresAt: string, nowMs = Date.now()): number {
  const end = new Date(expiresAt).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - nowMs) / (24 * 60 * 60 * 1000)));
}

export function placementTypeLabel(type: PlacementType): string {
  return type === 'urgent' ? 'Acil Vitrin' : 'Vitrin';
}
