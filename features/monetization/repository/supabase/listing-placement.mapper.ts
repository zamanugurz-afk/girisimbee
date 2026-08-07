import { ids } from '@/lib/domain/ids';
import type { ListingPlacementStatus } from '@/features/monetization/types/listing-placement.types';
import {
  isPlacementPackageSlug,
  type PlacementPackageSlug,
} from '@/features/monetization/types/listing-placement.types';
import type {
  ListingPlacementRecord,
  PlacementType,
} from '@/features/monetization/types/listing-placement-record.types';

export interface MarketplaceListingPlacementRow {
  id: string;
  listing_id: string;
  package_slug: string;
  featured_listing: boolean;
  urgent_listing: boolean;
  starts_at: string;
  ends_at: string;
  status: string;
  created_at: string;
  updated_at?: string;
  payment_id?: string | null;
  payment_status?: string;
}

const STATUSES: ListingPlacementStatus[] = [
  'pending',
  'active',
  'expired',
  'cancelled',
];

export function mapPlacementType(row: {
  package_slug: string;
  featured_listing: boolean;
  urgent_listing: boolean;
}): PlacementType {
  if (row.package_slug === 'hizli_erisim' || row.urgent_listing) return 'urgent';
  return 'featured';
}

export function packageSlugFromPlacementType(
  type: PlacementType,
): PlacementPackageSlug {
  return type === 'urgent' ? 'hizli_erisim' : 'vitrin';
}

export function mapMarketplaceListingPlacementRow(
  row: MarketplaceListingPlacementRow,
  userId: string | null = null,
): ListingPlacementRecord {
  const packageSlug: PlacementPackageSlug = isPlacementPackageSlug(row.package_slug)
    ? row.package_slug
    : packageSlugFromPlacementType(mapPlacementType(row));

  const status = STATUSES.includes(row.status as ListingPlacementStatus)
    ? (row.status as ListingPlacementStatus)
    : 'pending';

  return {
    id: ids.listingPlacement(row.id),
    listingId: ids.listing(row.listing_id),
    userId: userId ? ids.user(userId) : null,
    placementType: mapPlacementType(row),
    status,
    startedAt: row.starts_at,
    expiresAt: row.ends_at,
    createdAt: row.created_at,
    packageSlug,
  };
}
