import type { ListingResponse } from '@/types';
import { isOpenableMarketplaceUrl } from '@/lib/listing-url-validator';

/** Maximum age for marketplace-visible listings (archive threshold). */
export const ACTIVE_LISTING_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export const LISTING_TIME_WINDOWS = {
  today: 24 * 60 * 60 * 1000,
  last3Days: 72 * 60 * 60 * 1000,
  last30Days: ACTIVE_LISTING_WINDOW_MS,
} as const;

export type ListingTimeWindow = keyof typeof LISTING_TIME_WINDOWS;

export function getListingActivityTimestamp(listing: ListingResponse): number {
  const raw = listing.first_seen_at || listing.created_at;
  return new Date(raw).getTime();
}

/** Listings older than 30 days remain in DB but are excluded from marketplace flows. */
export function isArchivedListing(listing: ListingResponse): boolean {
  return Date.now() - getListingActivityTimestamp(listing) > ACTIVE_LISTING_WINDOW_MS;
}

export function isMarketplaceEligibleListing(listing: ListingResponse): boolean {
  const sourceUrl = listing.source_url?.trim() || listing.url?.trim() || '';

  return (
    listing.is_active &&
    !listing.deleted_at &&
    !listing.is_bundle &&
    !isArchivedListing(listing) &&
    listing.source_url_status !== 'invalid' &&
    isOpenableMarketplaceUrl(sourceUrl)
  );
}

export function filterMarketplaceListings(listings: ListingResponse[]): ListingResponse[] {
  return listings.filter(isMarketplaceEligibleListing);
}

export function filterListingsByWindow(
  listings: ListingResponse[],
  window: ListingTimeWindow,
): ListingResponse[] {
  const cutoff = Date.now() - LISTING_TIME_WINDOWS[window];
  return filterMarketplaceListings(listings).filter(
    (listing) => getListingActivityTimestamp(listing) >= cutoff,
  );
}

export function countListingsInWindow(
  listings: ListingResponse[],
  window: ListingTimeWindow,
): number {
  return filterListingsByWindow(listings, window).length;
}
