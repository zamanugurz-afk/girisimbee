/**
 * Single source of truth for browse UI slugs → app IDs → live DB IDs.
 * Used by filters, persistence mappers, and marketplace config.
 */
import { ids } from '@/lib/domain/ids';
import type { CategoryId, ListingTypeId } from '@/lib/domain/ids';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { FRANCHISE_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';

/** marketplace_categories — live DB */
export const MARKETPLACE_CATEGORY_IDS = {
  yatirim: ids.category('e1000001-0001-4000-8000-000000000001'),
  is: ids.category('e1000001-0001-4000-8000-000000000002'),
  ortaklik: ids.category('e1000001-0001-4000-8000-000000000003'),
  franchise: ids.category('c1000001-0001-4000-8000-000000000006'),
} as const;

/** marketplace_listing_types — live DB */
export const MARKETPLACE_LISTING_TYPE_IDS = {
  yatirimAriyorum: ids.listingType('e1000001-0001-4000-8000-000000000001'),
  yatirimYapiyorum: ids.listingType('e1000001-0001-4000-8000-000000000002'),
  isAriyorum: ids.listingType('e1000001-0001-4000-8000-000000000003'),
  iseAliyorum: ids.listingType('e1000001-0001-4000-8000-000000000004'),
  ortakAriyorum: ids.listingType('e1000001-0001-4000-8000-000000000005'),
  bayilikAl: ids.listingType('a0000006-0001-4000-8000-000000000006'),
  bayilikVer: ids.listingType('a0000007-0001-4000-8000-000000000007'),
} as const;

export interface BrowseCategoryEntry {
  slug: string;
  label: string;
  listingTypeSlug: string;
  appCategoryId: CategoryId;
  appListingTypeId: ListingTypeId;
  dbCategoryId: CategoryId;
  dbListingTypeId: ListingTypeId;
  /** Extra listing type IDs included when filtering (e.g. franchise variants). */
  filterListingTypeIds: ListingTypeId[];
}

export const BROWSE_CATEGORY_MAP: Record<string, BrowseCategoryEntry> = {
  'yatirim-bul': {
    slug: 'yatirim-bul',
    label: 'Yatırım Bul',
    listingTypeSlug: 'yatirim-ariyorum',
    appCategoryId: CATEGORY_IDS.yatirimBul,
    appListingTypeId: LISTING_TYPE_IDS.yatirimBulDefault,
    dbCategoryId: MARKETPLACE_CATEGORY_IDS.yatirim,
    dbListingTypeId: MARKETPLACE_LISTING_TYPE_IDS.yatirimAriyorum,
    filterListingTypeIds: [
      MARKETPLACE_LISTING_TYPE_IDS.yatirimAriyorum,
    ],
  },
  'yatirim-yap': {
    slug: 'yatirim-yap',
    label: 'Yatırım Yap',
    listingTypeSlug: 'yatirim-yapiyorum',
    appCategoryId: CATEGORY_IDS.yatirimYap,
    appListingTypeId: LISTING_TYPE_IDS.yatirimYapDefault,
    dbCategoryId: MARKETPLACE_CATEGORY_IDS.yatirim,
    dbListingTypeId: MARKETPLACE_LISTING_TYPE_IDS.yatirimYapiyorum,
    filterListingTypeIds: [
      MARKETPLACE_LISTING_TYPE_IDS.yatirimYapiyorum,
    ],
  },
  'is-bul': {
    slug: 'is-bul',
    label: 'İş Bul',
    listingTypeSlug: 'is-ariyorum',
    appCategoryId: CATEGORY_IDS.isBul,
    appListingTypeId: LISTING_TYPE_IDS.isBulDefault,
    dbCategoryId: MARKETPLACE_CATEGORY_IDS.is,
    dbListingTypeId: MARKETPLACE_LISTING_TYPE_IDS.isAriyorum,
    filterListingTypeIds: [
      MARKETPLACE_LISTING_TYPE_IDS.isAriyorum,
    ],
  },
  'ise-al': {
    slug: 'ise-al',
    label: 'İşe Al',
    listingTypeSlug: 'ise-aliyorum',
    appCategoryId: CATEGORY_IDS.iseAl,
    appListingTypeId: LISTING_TYPE_IDS.iseAlDefault,
    dbCategoryId: MARKETPLACE_CATEGORY_IDS.is,
    dbListingTypeId: MARKETPLACE_LISTING_TYPE_IDS.iseAliyorum,
    filterListingTypeIds: [
      MARKETPLACE_LISTING_TYPE_IDS.iseAliyorum,
    ],
  },
  'ortak-bul': {
    slug: 'ortak-bul',
    label: 'Ortak Bul',
    listingTypeSlug: 'ortak-ariyorum',
    appCategoryId: CATEGORY_IDS.ortakBul,
    appListingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
    dbCategoryId: MARKETPLACE_CATEGORY_IDS.ortaklik,
    dbListingTypeId: MARKETPLACE_LISTING_TYPE_IDS.ortakAriyorum,
    filterListingTypeIds: [
      MARKETPLACE_LISTING_TYPE_IDS.ortakAriyorum,
    ],
  },
  'bayilik-al': {
    slug: 'bayilik-al',
    label: 'Franchise',
    listingTypeSlug: 'franchise-ilan-ver',
    appCategoryId: CATEGORY_IDS.bayilikAl,
    appListingTypeId: LISTING_TYPE_IDS.franchiseGiveDefault,
    dbCategoryId: MARKETPLACE_CATEGORY_IDS.franchise,
    dbListingTypeId: MARKETPLACE_LISTING_TYPE_IDS.bayilikVer,
    filterListingTypeIds: [
      FRANCHISE_LISTING_TYPE_IDS.give,
      FRANCHISE_LISTING_TYPE_IDS.buy,
      MARKETPLACE_LISTING_TYPE_IDS.bayilikAl,
      MARKETPLACE_LISTING_TYPE_IDS.bayilikVer,
    ],
  },
};

/** Alternate slugs → canonical browse slug */
export const BROWSE_CATEGORY_SLUG_ALIASES: Record<string, string> = {
  franchise: 'bayilik-al',
  'calisan-ariyorum': 'ise-al',
};

const APP_CATEGORY_ID_TO_DB: Record<string, CategoryId> = {
  [CATEGORY_IDS.yatirimBul]: MARKETPLACE_CATEGORY_IDS.yatirim,
  [CATEGORY_IDS.yatirimYap]: MARKETPLACE_CATEGORY_IDS.yatirim,
  [CATEGORY_IDS.isBul]: MARKETPLACE_CATEGORY_IDS.is,
  [CATEGORY_IDS.iseAl]: MARKETPLACE_CATEGORY_IDS.is,
  [CATEGORY_IDS.ortakBul]: MARKETPLACE_CATEGORY_IDS.ortaklik,
  [CATEGORY_IDS.bayilikAl]: MARKETPLACE_CATEGORY_IDS.franchise,
  [MARKETPLACE_CATEGORY_IDS.yatirim]: MARKETPLACE_CATEGORY_IDS.yatirim,
  [MARKETPLACE_CATEGORY_IDS.is]: MARKETPLACE_CATEGORY_IDS.is,
  [MARKETPLACE_CATEGORY_IDS.ortaklik]: MARKETPLACE_CATEGORY_IDS.ortaklik,
  [MARKETPLACE_CATEGORY_IDS.franchise]: MARKETPLACE_CATEGORY_IDS.franchise,
};

const APP_LISTING_TYPE_ID_TO_DB: Record<string, ListingTypeId> = {
  [LISTING_TYPE_IDS.yatirimBulDefault]: MARKETPLACE_LISTING_TYPE_IDS.yatirimAriyorum,
  [LISTING_TYPE_IDS.yatirimYapDefault]: MARKETPLACE_LISTING_TYPE_IDS.yatirimYapiyorum,
  [LISTING_TYPE_IDS.isBulDefault]: MARKETPLACE_LISTING_TYPE_IDS.isAriyorum,
  [LISTING_TYPE_IDS.iseAlDefault]: MARKETPLACE_LISTING_TYPE_IDS.iseAliyorum,
  [LISTING_TYPE_IDS.ortakBulDefault]: MARKETPLACE_LISTING_TYPE_IDS.ortakAriyorum,
  [LISTING_TYPE_IDS.franchiseGiveDefault]: MARKETPLACE_LISTING_TYPE_IDS.bayilikVer,
  [FRANCHISE_LISTING_TYPE_IDS.give]: MARKETPLACE_LISTING_TYPE_IDS.bayilikVer,
  [FRANCHISE_LISTING_TYPE_IDS.buy]: MARKETPLACE_LISTING_TYPE_IDS.bayilikAl,
  [MARKETPLACE_LISTING_TYPE_IDS.yatirimAriyorum]: MARKETPLACE_LISTING_TYPE_IDS.yatirimAriyorum,
  [MARKETPLACE_LISTING_TYPE_IDS.yatirimYapiyorum]: MARKETPLACE_LISTING_TYPE_IDS.yatirimYapiyorum,
  [MARKETPLACE_LISTING_TYPE_IDS.isAriyorum]: MARKETPLACE_LISTING_TYPE_IDS.isAriyorum,
  [MARKETPLACE_LISTING_TYPE_IDS.iseAliyorum]: MARKETPLACE_LISTING_TYPE_IDS.iseAliyorum,
  [MARKETPLACE_LISTING_TYPE_IDS.ortakAriyorum]: MARKETPLACE_LISTING_TYPE_IDS.ortakAriyorum,
  [MARKETPLACE_LISTING_TYPE_IDS.bayilikAl]: MARKETPLACE_LISTING_TYPE_IDS.bayilikAl,
  [MARKETPLACE_LISTING_TYPE_IDS.bayilikVer]: MARKETPLACE_LISTING_TYPE_IDS.bayilikVer,
};

export function resolveBrowseCategorySlug(slug: string): string {
  return BROWSE_CATEGORY_SLUG_ALIASES[slug] ?? slug;
}

export function resolveBrowseCategory(slug: string): BrowseCategoryEntry | null {
  const canonical = resolveBrowseCategorySlug(slug);
  return BROWSE_CATEGORY_MAP[canonical] ?? null;
}

export function getBrowseCategorySlugs(): string[] {
  return Object.keys(BROWSE_CATEGORY_MAP);
}

/** Listing type IDs to use in browse filters (includes app + DB legacy IDs). */
export function resolveListingTypeIdsFromBrowseSlug(slug: string): ListingTypeId[] {
  const entry = resolveBrowseCategory(slug);
  if (!entry) return [];
  return uniqueIds(entry.filterListingTypeIds.flatMap((id) => expandListingTypeIdFilter(id)));
}

export function resolveDbCategoryId(categoryId: CategoryId): CategoryId {
  return APP_CATEGORY_ID_TO_DB[categoryId] ?? categoryId;
}

export function resolveDbListingTypeId(listingTypeId: ListingTypeId): ListingTypeId {
  return APP_LISTING_TYPE_ID_TO_DB[listingTypeId] ?? listingTypeId;
}

/** @deprecated Use resolveDbCategoryId */
export const toLegacyCategoryId = resolveDbCategoryId;

/** @deprecated Use resolveDbListingTypeId */
export const toPersistedListingTypeId = resolveDbListingTypeId;

/** @deprecated Use resolveDbCategoryId */
export const toPersistedCategoryId = resolveDbCategoryId;

export function expandCategoryIdFilter(categoryId: CategoryId): CategoryId[] {
  const dbId = resolveDbCategoryId(categoryId);
  return dbId === categoryId ? [categoryId] : [categoryId, dbId];
}

export function expandListingTypeIdFilter(listingTypeId: ListingTypeId): ListingTypeId[] {
  const dbId = resolveDbListingTypeId(listingTypeId);
  return dbId === listingTypeId ? [listingTypeId] : [listingTypeId, dbId];
}

function uniqueIds(values: ListingTypeId[]): ListingTypeId[] {
  return [...new Set(values)];
}
