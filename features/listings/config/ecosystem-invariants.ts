import type { Listing } from '@/features/listings/types/listing.entity.types';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { FRANCHISE_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';

export type EcosystemType = 'employment' | 'venture_partnership' | 'venture_franchise' | 'venture_transfer' | 'other';

export const EMPLOYMENT_CATEGORY_IDS = [
  CATEGORY_IDS.isBul,
  CATEGORY_IDS.iseAl,
] as const;

export const VENTURE_CATEGORY_IDS = [
  CATEGORY_IDS.ortakBul,
  CATEGORY_IDS.bayilikAl,
  CATEGORY_IDS.isletmeDevri,
] as const;

export function classifyListingEcosystem(
  listing: Pick<Listing, 'categoryId' | 'listingTypeId' | 'moduleKey'>,
): EcosystemType {
  const cat = listing.categoryId;
  const type = listing.listingTypeId;
  const mod = listing.moduleKey;

  if (
    cat === CATEGORY_IDS.isBul ||
    cat === CATEGORY_IDS.iseAl ||
    mod === 'candidates' ||
    mod === 'employers' ||
    (Boolean(type) && (type === LISTING_TYPE_IDS.isBulDefault || type === LISTING_TYPE_IDS.iseAlDefault))
  ) {
    return 'employment';
  }

  if (
    cat === CATEGORY_IDS.ortakBul ||
    mod === 'founders' ||
    (Boolean(type) && type === LISTING_TYPE_IDS.ortakBulDefault)
  ) {
    return 'venture_partnership';
  }

  if (
    cat === CATEGORY_IDS.bayilikAl ||
    mod === 'franchise' ||
    (Boolean(type) && (
      type === FRANCHISE_LISTING_TYPE_IDS.give ||
      type === FRANCHISE_LISTING_TYPE_IDS.buy ||
      type === LISTING_TYPE_IDS.franchiseGiveDefault ||
      type === LISTING_TYPE_IDS.franchiseBuyDefault
    ))
  ) {
    return 'venture_franchise';
  }

  if (
    cat === CATEGORY_IDS.isletmeDevri ||
    (Boolean(type) && (
      type === LISTING_TYPE_IDS.businessTransferSellDefault ||
      type === LISTING_TYPE_IDS.businessTransferBuyDefault
    ))
  ) {
    return 'venture_transfer';
  }

  return 'other';
}

export function areEcosystemsCompatible(
  sourceListing: Pick<Listing, 'categoryId' | 'listingTypeId' | 'moduleKey'>,
  targetListing: Pick<Listing, 'categoryId' | 'listingTypeId' | 'moduleKey'>,
): boolean {
  const sourceEco = classifyListingEcosystem(sourceListing);
  const targetEco = classifyListingEcosystem(targetListing);

  // Strict invariant: An ecosystem can only ever match within its exact own ecosystem!
  if (sourceEco === 'employment') return targetEco === 'employment';
  if (sourceEco === 'venture_partnership') return targetEco === 'venture_partnership';
  if (sourceEco === 'venture_franchise') return targetEco === 'venture_franchise';
  if (sourceEco === 'venture_transfer') return targetEco === 'venture_transfer';

  return false;
}
