/** Supported indexed product categories (consoles + controllers). */
export type ProductCategory =
  | 'PS5'
  | 'PS5_SLIM'
  | 'PS5_PRO'
  | 'XBOX_SERIES_X'
  | 'XBOX_SERIES_S'
  | 'DUALSENSE'
  | 'DUALSENSE_EDGE'
  | 'XBOX_CONTROLLER'
  | 'XBOX_ELITE_SERIES_2';

export const SUPPORTED_PRODUCT_CATEGORIES: ProductCategory[] = [
  'PS5',
  'PS5_SLIM',
  'PS5_PRO',
  'XBOX_SERIES_X',
  'XBOX_SERIES_S',
  'DUALSENSE',
  'DUALSENSE_EDGE',
  'XBOX_CONTROLLER',
  'XBOX_ELITE_SERIES_2',
];

/** Rejected listing groups (not stored as product categories). */
export const REJECTED_LISTING_GROUPS = [
  'GAMES',
  'ACCESSORIES',
  'BUNDLES',
  'OLD_GENERATIONS',
  'UNSUPPORTED_PRODUCT',
] as const;

export type RejectedListingGroup = (typeof REJECTED_LISTING_GROUPS)[number];

export const CATEGORY_TO_PRODUCT_SLUG: Record<ProductCategory, string> = {
  PS5: 'playstation-5',
  PS5_SLIM: 'playstation-5-slim',
  PS5_PRO: 'playstation-5-pro',
  XBOX_SERIES_X: 'xbox-series-x',
  XBOX_SERIES_S: 'xbox-series-s',
  DUALSENSE: 'dualsense',
  DUALSENSE_EDGE: 'dualsense-edge',
  XBOX_CONTROLLER: 'xbox-wireless-controller',
  XBOX_ELITE_SERIES_2: 'xbox-elite-series-2',
};

export const PRODUCT_SLUG_TO_CATEGORY: Record<string, ProductCategory> = Object.fromEntries(
  Object.entries(CATEGORY_TO_PRODUCT_SLUG).map(([category, slug]) => [slug, category as ProductCategory]),
) as Record<string, ProductCategory>;

/** Search terms used by all provider sync jobs (no duplicates). */
export const SYNC_SEARCH_KEYWORDS: string[] = [
  'PlayStation 5 Pro',
  'PlayStation 5 Slim',
  'PlayStation 5',
  'Xbox Series X',
  'Xbox Series S',
  'DualSense Edge',
  'DualSense',
  'Xbox Elite Series 2',
  'Xbox Wireless Controller',
];

export const DEFAULT_SYNC_SEARCH_KEYWORD = SYNC_SEARCH_KEYWORDS[2];
