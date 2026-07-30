/** Game titles — listings containing these are rejected. */
export const BLACKLIST_GAME_TITLES: string[] = [
  'fifa',
  'ea fc',
  'pes',
  'call of duty',
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
];

/** Generic game / media keywords. */
export const BLACKLIST_GAME_KEYWORDS: string[] = [
  'game',
  'oyun',
  'oyunlar',
  'cd',
  'disc',
  'disk',
  'blu-ray',
  'bluray',
];

/** Accessories — never indexed. */
export const BLACKLIST_ACCESSORIES: string[] = [
  'headset',
  'kulaklık',
  'kulaklik',
  'ssd',
  'stand',
  'dock',
  'charging station',
  'kamera',
  'camera',
  'hdmi',
  'cable',
  'kablo',
  'fan',
  'cooler',
  'adaptör',
  'adapter',
  'battery',
  'power supply',
  'skin',
  'sticker',
  'case',
  'cover',
  'çanta',
  'canta',
  'bag',
  'backpack',
  'grip',
  'mount',
];

/** Bundle keywords. */
export const BLACKLIST_BUNDLE_KEYWORDS: string[] = [
  'bundle',
  'paket',
  'set',
  'full set',
  'collection',
  'koleksiyon',
  'toptan',
];

/** Bundle phrase patterns (case-insensitive regex sources). */
export const BLACKLIST_BUNDLE_PATTERNS: string[] = [
  'ps5\\s*\\+\\s*game',
  'ps5\\s*\\+\\s*games',
  'ps5\\s*\\+\\s*controller',
  'ps5\\s*\\+\\s*oyun',
  'xbox\\s*\\+\\s*game',
  'xbox\\s*\\+\\s*controller',
  'xbox\\s*\\+\\s*oyun',
  '\\+\\s*\\d+\\s*oyun',
  '\\d+\\s*adet\\s*oyun',
];

/** Old console / controller generations. */
export const BLACKLIST_OLD_GENERATIONS: string[] = [
  'ps1',
  'ps2',
  'ps3',
  'ps4',
  'playstation 4',
  'playstation4',
  'dualshock',
  'ds4',
  'xbox one',
  'xbox 360',
  'xbox original',
  'nintendo switch',
  'switch oled',
  'switch lite',
];

/** Flat unique blacklist keyword count (patterns counted individually). */
export const TOTAL_BLACKLIST_KEYWORDS = new Set([
  ...BLACKLIST_GAME_TITLES,
  ...BLACKLIST_GAME_KEYWORDS,
  ...BLACKLIST_ACCESSORIES,
  ...BLACKLIST_BUNDLE_KEYWORDS,
  ...BLACKLIST_OLD_GENERATIONS,
  ...BLACKLIST_BUNDLE_PATTERNS,
].map((k) => k.toLowerCase())).size;
