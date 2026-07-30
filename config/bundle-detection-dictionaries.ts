/** Separators that indicate bundled items in a listing title. */
export const BUNDLE_SEPARATOR_PATTERNS: readonly RegExp[] = [
  /\+/,
  /\bplus\b/,
  /\bve\b/,
  /\band\b/,
  /\bile\b/,
  /\bwith\b/,
  /\bbirlikte\b/,
];

/** Packaging keywords — console listings with these are rejected outright. */
export const BUNDLE_PACKAGING_KEYWORDS: readonly string[] = [
  'bundle',
  'paket',
  'package',
  'full set',
  'combo',
  'koleksiyon',
  'collection',
  'set',
];

/** Console platform hints for titles that omit the exact model name. */
export const BUNDLE_CONSOLE_PLATFORM_HINTS: readonly string[] = [
  'ps5',
  'playstation 5',
  'play station 5',
  'xbox series x',
  'xbox series s',
  'xbox series',
  'xbox',
];

/** Supported standalone console categories subject to bundle rejection. */
export const BUNDLE_CONSOLE_CATEGORIES: readonly string[] = [
  'PS5',
  'PS5_SLIM',
  'PS5_PRO',
  'XBOX_SERIES_X',
  'XBOX_SERIES_S',
];

/** Bundled game / subscription extras (TR + EN). */
export const BUNDLE_GAME_DICTIONARY: readonly string[] = [
  'fc26',
  'fc 26',
  'fc25',
  'fc 25',
  'fc24',
  'fc 24',
  'fifa',
  'ea fc',
  'game pass',
  'xbox game pass',
  'pes',
  'call of duty',
  'cod',
  'god of war',
  'spider-man',
  'spiderman',
  'ghost of tsushima',
  'horizon',
  'gran turismo',
  'gta',
  'nba',
  'mortal kombat',
  'the last of us',
  'last of us',
  'resident evil',
  'cyberpunk',
  'forza',
  'halo',
  'minecraft',
  'oyun',
  'oyunlar',
  'game',
  'games',
];

/** Bundled controller extras (TR + EN). */
export const BUNDLE_CONTROLLER_DICTIONARY: readonly string[] = [
  'dualsense',
  'dual sense',
  'controller',
  'controllers',
  'wireless controller',
  'gamepad',
  'kol',
  'kumanda',
  'game controller',
  'xbox kol',
  'xbox kumanda',
];

/** Controller quantity patterns (e.g. "2 kol", "2 controllers"). */
export const BUNDLE_CONTROLLER_QUANTITY_PATTERNS: readonly RegExp[] = [
  /\b\d+\s*kol\b/,
  /\b\d+\s*kumanda\b/,
  /\b\d+\s*controller\b/,
  /\b\d+\s*controllers\b/,
  /\b\d+\s*adet\s*kol\b/,
];

/** Bundled accessory extras (headset, camera, dock, ssd, hdmi, etc.). */
export const BUNDLE_ACCESSORY_DICTIONARY: readonly string[] = [
  'kamera',
  'camera',
  'headset',
  'kulaklik',
  'kulaklık',
  'stand',
  'dock',
  'charging station',
  'ssd',
  'hdmi',
  'cable',
  'kablo',
  'adaptör',
  'adapter',
  'case',
  'cover',
  'çanta',
  'canta',
  'bag',
  'backpack',
  'grip',
  'mount',
  'fan',
  'cooler',
];

export type BundleExtraCategory = 'GAME' | 'CONTROLLER' | 'ACCESSORY';

/** @deprecated Classification removed — kept for backward-compatible imports. */
export type DetectedBundleCategory = BundleExtraCategory;

/** @deprecated Use CONSOLE_ONLY for standalone listings stored in DB. */
export type DetectedBundleType =
  | 'CONSOLE_ONLY'
  | 'GAME'
  | 'CONTROLLER'
  | 'ACCESSORY'
  | 'MIXED';
