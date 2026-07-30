import type { ProductCategory } from './product-catalog';

export interface ProductWhitelistEntry {
  category: ProductCategory;
  /** Title must match one of these (checked in priority order). */
  keywords: string[];
}

/**
 * Whitelist entries — most specific categories first.
 * Shared by all providers via lib/product-classifier.ts.
 */
export const PRODUCT_WHITELIST: ProductWhitelistEntry[] = [
  {
    category: 'DUALSENSE_EDGE',
    keywords: ['dualsense edge', 'dual sense edge', 'dualsense-edge'],
  },
  {
    category: 'DUALSENSE',
    keywords: [
      'dualsense',
      'dual sense',
      'ps5 controller',
      'ps5 kol',
      'ps5 kumanda',
      'sony dualsense',
    ],
  },
  {
    category: 'XBOX_ELITE_SERIES_2',
    keywords: [
      'xbox elite series 2',
      'elite series 2',
      'xbox elite controller',
      'xbox elite wireless controller series 2',
    ],
  },
  {
    category: 'XBOX_CONTROLLER',
    keywords: [
      'xbox wireless controller',
      'xbox controller series',
      'xbox series controller',
      'xbox kumanda',
      'xbox kol',
    ],
  },
  {
    category: 'PS5_PRO',
    keywords: ['ps5 pro', 'playstation 5 pro', 'ps 5 pro', 'playstation5 pro'],
  },
  {
    category: 'PS5_SLIM',
    keywords: ['ps5 slim', 'playstation 5 slim', 'ps 5 slim', 'playstation5 slim'],
  },
  {
    category: 'PS5',
    keywords: [
      'ps5',
      'playstation 5',
      'ps 5',
      'playstation5',
      'sony playstation',
      'playstation',
    ],
  },
  {
    category: 'XBOX_SERIES_X',
    keywords: ['xbox series x', 'series x', 'xbox sx', 'xbox serisi x'],
  },
  {
    category: 'XBOX_SERIES_S',
    keywords: ['xbox series s', 'series s', 'xbox ss', 'xbox serisi s'],
  },
];

/** Flat unique whitelist keyword count (for reporting). */
export const TOTAL_WHITELIST_KEYWORDS = new Set(
  PRODUCT_WHITELIST.flatMap((entry) => entry.keywords.map((k) => k.toLowerCase())),
).size;
