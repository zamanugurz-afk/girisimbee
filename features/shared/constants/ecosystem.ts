import { ids } from '@/lib/domain/ids';
import type { CategoryId, ListingTypeId, SubcategoryId } from '@/lib/domain/ids';
import type { FranchiseSubcategorySlug } from '@/lib/domain/modules';

/** Stable IDs from P0 migrations — used by service layer only */
export const ECOSYSTEM_CATEGORY_IDS = {
  entrepreneurs: ids.category('c1000001-0001-4000-8000-000000000001'),
  investors: ids.category('c1000001-0001-4000-8000-000000000002'),
  candidates: ids.category('c1000001-0001-4000-8000-000000000003'),
  employers: ids.category('c1000001-0001-4000-8000-000000000004'),
  founders: ids.category('c1000001-0001-4000-8000-000000000005'),
  franchise: ids.category('c1000001-0001-4000-8000-000000000006'),
  businessTransfer: ids.category('c1000001-0001-4000-8000-000000000009'),
} as const;

export const FRANCHISE_SUBCATEGORY_IDS: Record<FranchiseSubcategorySlug, SubcategoryId> = {
  'franchise-buy': ids.subcategory('a0000001-0001-4000-8000-000000000001'),
  'franchise-give': ids.subcategory('a0000002-0001-4000-8000-000000000002'),
};

export const FRANCHISE_LISTING_TYPE_IDS = {
  buy: ids.listingType('a0000006-0001-4000-8000-000000000006'),
  give: ids.listingType('a0000007-0001-4000-8000-000000000007'),
} as const satisfies Record<'buy' | 'give', ListingTypeId>;

export const BUSINESS_TRANSFER_LISTING_TYPE_IDS = {
  sell: ids.listingType('a0000009-0001-4000-8000-000000000009'),
  buy: ids.listingType('a0000010-0001-4000-8000-000000000010'),
} as const satisfies Record<'sell' | 'buy', ListingTypeId>;

export const DEFAULT_LISTING_TYPE_IDS = {
  entrepreneurs: ids.listingType('lt000001-0001-4000-8000-000000000001'),
  investors: ids.listingType('lt000001-0001-4000-8000-000000000002'),
  candidates: ids.listingType('lt000001-0001-4000-8000-000000000003'),
  employers: ids.listingType('lt000001-0001-4000-8000-000000000004'),
  founders: ids.listingType('lt000001-0001-4000-8000-000000000005'),
  businessTransfer: BUSINESS_TRANSFER_LISTING_TYPE_IDS.sell,
} as const satisfies Record<string, ListingTypeId>;

export type EcosystemCategoryKey = keyof typeof ECOSYSTEM_CATEGORY_IDS;
