import type { ListingDetail } from '@/features/listings/types/listing.types';
import {
  getListingById,
  hasListing,
  getAllListingIds,
  listingHref,
} from '@/features/listings/mock/listing-detail.mock';

export {
  getListingById,
  hasListing,
  getAllListingIds,
  listingHref,
};

/** Read-only mock service for GirisimBee listing detail pages (UI view model). */
export const listingViewService = {
  getById: (id: string): ListingDetail | undefined => getListingById(id),
  has: (id: string): boolean => hasListing(id),
  href: (id: string): string => listingHref(id),
  allIds: (): string[] => getAllListingIds(),
};

/** @deprecated Use listingViewService — avoids collision with lib/services/listingService (marketplace). */
export const listingService = listingViewService;
