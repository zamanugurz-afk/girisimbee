/**
 * Account / panel placement API shape.
 * Maps onto marketplace_listing_placements (starts_at/ends_at, package_slug, flags).
 */
import type { ListingId, ListingPlacementId, UserId } from '@/lib/domain/ids';
import type {
  ListingPlacementStatus,
  PlacementPackageSlug,
} from '@/features/monetization/types/listing-placement.types';

/** User-facing placement kinds — featured = vitrin, urgent = acil vitrin */
export type PlacementType = 'featured' | 'urgent';

export interface ListingPlacementRecord {
  id: ListingPlacementId;
  listingId: ListingId;
  userId: UserId | null;
  placementType: PlacementType;
  status: ListingPlacementStatus;
  startedAt: string;
  expiresAt: string;
  createdAt: string;
  packageSlug: PlacementPackageSlug;
}

export type ExtendPlacementInput = {
  days?: number;
};
