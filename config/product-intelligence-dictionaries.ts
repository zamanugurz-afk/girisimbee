/** Canonical brand tokens. */
export const BRAND_PATTERNS = {
  SONY: ['sony'],
  MICROSOFT: ['microsoft', 'ms'],
} as const;

/** Platform tokens (normalized title substring / term match). */
export const PLATFORM_PATTERNS = {
  PLAYSTATION: [
    'playstation',
    'play station',
    'ps5',
    'ps 5',
    'ps-5',
    'dualsense',
    'dual sense',
  ],
  XBOX: ['xbox', 'series x', 'series s', 'xbox wireless controller', 'xbox elite'],
} as const;

/**
 * Generation detection — ordered most-specific first.
 * Each entry: [generation, patterns[]]
 */
export const GENERATION_PATTERNS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['DUALSENSE_EDGE', ['dualsense edge', 'dual sense edge']],
  ['DUALSENSE', ['dualsense', 'dual sense']],
  ['XBOX_ELITE', ['xbox elite', 'elite series 2', 'elite wireless controller series 2']],
  ['XBOX_CONTROLLER', ['xbox wireless controller', 'xbox controller', 'xbox kol', 'xbox kumanda']],
  ['PS5_PRO', ['ps5 pro', 'playstation 5 pro', 'play station 5 pro', 'ps 5 pro']],
  ['PS5', ['ps5 slim', 'playstation 5 slim', 'play station 5 slim', 'ps 5 slim', 'ps5', 'playstation 5', 'play station 5', 'ps 5', 'ps-5']],
  ['SERIES_X', ['xbox series x', 'series x']],
  ['SERIES_S', ['xbox series s', 'series s']],
];

export const MODEL_BY_GENERATION: Record<string, string> = {
  PS5: 'BASE',
  PS5_PRO: 'PRO',
  SERIES_X: 'BASE',
  SERIES_S: 'BASE',
  DUALSENSE: 'STANDARD',
  DUALSENSE_EDGE: 'STANDARD',
  XBOX_CONTROLLER: 'STANDARD',
  XBOX_ELITE: 'ELITE',
};

export const FAMILY_BY_GENERATION: Record<string, 'CONSOLE' | 'CONTROLLER'> = {
  PS5: 'CONSOLE',
  PS5_PRO: 'CONSOLE',
  SERIES_X: 'CONSOLE',
  SERIES_S: 'CONSOLE',
  DUALSENSE: 'CONTROLLER',
  DUALSENSE_EDGE: 'CONTROLLER',
  XBOX_CONTROLLER: 'CONTROLLER',
  XBOX_ELITE: 'CONTROLLER',
};

export const BRAND_BY_PLATFORM: Record<string, string> = {
  PLAYSTATION: 'SONY',
  XBOX: 'MICROSOFT',
};

export const PLATFORM_BY_GENERATION: Record<string, string> = {
  PS5: 'PLAYSTATION',
  PS5_PRO: 'PLAYSTATION',
  SERIES_X: 'XBOX',
  SERIES_S: 'XBOX',
  DUALSENSE: 'PLAYSTATION',
  DUALSENSE_EDGE: 'PLAYSTATION',
  XBOX_CONTROLLER: 'XBOX',
  XBOX_ELITE: 'XBOX',
};

/** Maps legacy product_family slug to structured generation + model. */
export const LEGACY_FAMILY_TO_STRUCTURED: Record<string, { generation: string; model: string }> = {
  PS5: { generation: 'PS5', model: 'BASE' },
  PS5_SLIM: { generation: 'PS5', model: 'SLIM' },
  PS5_PRO: { generation: 'PS5_PRO', model: 'PRO' },
  XBOX_SERIES_X: { generation: 'SERIES_X', model: 'BASE' },
  XBOX_SERIES_S: { generation: 'SERIES_S', model: 'BASE' },
  DUALSENSE: { generation: 'DUALSENSE', model: 'STANDARD' },
  DUALSENSE_EDGE: { generation: 'DUALSENSE_EDGE', model: 'STANDARD' },
  XBOX_CONTROLLER: { generation: 'XBOX_CONTROLLER', model: 'STANDARD' },
  XBOX_ELITE_SERIES_2: { generation: 'XBOX_ELITE', model: 'ELITE' },
};

export const EDITION_PATTERNS = {
  DISC: ['disc', 'disk', 'diskli', 'blu-ray', 'bluray', 'blu ray'],
  DIGITAL: ['digital', 'dijital', 'digital edition'],
} as const;

export const STORAGE_PATTERNS: ReadonlyArray<readonly [string, RegExp]> = [
  ['2TB', /(?:^|\s)2\s*tb(?:$|\s)|\b2tb\b/],
  ['1TB', /(?:^|\s)1\s*tb(?:$|\s)|\b1tb\b/],
  ['825GB', /(?:^|\s)825\s*gb(?:$|\s)|\b825gb\b/],
  ['512GB', /(?:^|\s)512\s*gb(?:$|\s)|\b512gb\b/],
];

export const CONDITION_PATTERNS = {
  NEW: ['sifir', 'kapali kutu', 'jelatinli', 'yeni', 'new', 'sealed', 'brand new'],
  LIKE_NEW: ['az kullanilmis', 'temiz', 'like new', 'like-new', 'cok temiz', 'mint'],
  USED: ['2.el', '2 el', 'ikinci el', 'used', 'second hand', 'secondhand'],
} as const;

/** Color phrases → canonical color (longest match wins). */
export const COLOR_PATTERNS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['BLACK', ['midnight black', 'carbon black', 'siyah', 'black', 'jet black']],
  ['WHITE', ['white', 'beyaz', 'cosmic red white']],
  ['RED', ['cosmic red', 'volcanic red', 'kirmizi', 'red']],
  ['BLUE', ['starlight blue', 'cobalt blue', 'mavi', 'blue']],
  ['PINK', ['nova pink', 'pembe', 'pink']],
  ['PURPLE', ['galactic purple', 'mor', 'purple']],
  ['GREY', ['grey', 'gray', 'gri']],
  ['GREEN', ['green', 'yesil']],
];

export const CONTROLLER_TERMS = ['controller', 'kol', 'kumanda', 'gamepad'];
export const CONSOLE_TERMS = ['console', 'konsol', 'cihaz'];
export const BUNDLE_HINTS = ['+', ' plus ', ' ve ', ' and ', ' ile ', 'set', 'paket', 'bundle', 'combo'];
