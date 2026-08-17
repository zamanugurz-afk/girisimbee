import { LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import {
  expandListingTypeIdFilter,
  MARKETPLACE_LISTING_TYPE_IDS,
} from '@/features/listings/config/marketplace-category-map';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { ListingTypeId } from '@/lib/domain/ids';
import type { CareerListingKind } from '@/features/matching-engine/types';

function uniqueTypeIds(ids: readonly ListingTypeId[]): ListingTypeId[] {
  return [...new Set(ids)];
}

export function getCareerSeekListingTypeIds(): ListingTypeId[] {
  return uniqueTypeIds([
    ...expandListingTypeIdFilter(LISTING_TYPE_IDS.isBulDefault),
    ...expandListingTypeIdFilter(MARKETPLACE_LISTING_TYPE_IDS.isAriyorum),
  ]);
}

export function getCareerHireListingTypeIds(): ListingTypeId[] {
  return uniqueTypeIds([
    ...expandListingTypeIdFilter(LISTING_TYPE_IDS.iseAlDefault),
    ...expandListingTypeIdFilter(MARKETPLACE_LISTING_TYPE_IDS.iseAliyorum),
  ]);
}

export function classifyCareerListingKind(
  listing: Pick<Listing, 'listingTypeId' | 'moduleKey'>,
): CareerListingKind | null {
  if (listing.moduleKey === 'candidates') return 'seek';
  if (listing.moduleKey === 'employers') return 'hire';
  const typeId = listing.listingTypeId;
  if (getCareerSeekListingTypeIds().includes(typeId)) return 'seek';
  if (getCareerHireListingTypeIds().includes(typeId)) return 'hire';
  return null;
}
