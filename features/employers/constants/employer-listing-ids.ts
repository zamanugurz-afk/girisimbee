import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { MARKETPLACE_CATEGORY_IDS, MARKETPLACE_LISTING_TYPE_IDS } from '@/features/listings/config/marketplace-category-map';

/** App-layer category id — maps to live DB parent "is" via resolveDbCategoryId. */
export const EMPLOYER_CATEGORY_ID = CATEGORY_IDS.iseAl;
/** App-layer listing type id (ise-aliyorum). */
export const EMPLOYER_LISTING_TYPE_ID = LISTING_TYPE_IDS.iseAlDefault;

/**
 * Values written to Postgres — must match live marketplace_categories / marketplace_listing_types rows.
 * Category "is" (e1000001-...002) + listing type "ise-aliyorum" (e1000001-...004).
 */
export const EMPLOYER_PERSISTED_CATEGORY_ID = MARKETPLACE_CATEGORY_IDS.is;
export const EMPLOYER_PERSISTED_LISTING_TYPE_ID = MARKETPLACE_LISTING_TYPE_IDS.iseAliyorum;
