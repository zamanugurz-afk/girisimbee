export interface WeightedValidationTerm {
  term: string;
  weight: number;
}

export const VALIDATION_CONSOLE_TERMS: WeightedValidationTerm[] = [
  { term: 'ps5 slim', weight: 28 },
  { term: 'playstation 5 slim', weight: 28 },
  { term: 'ps5 pro', weight: 28 },
  { term: 'playstation 5 pro', weight: 28 },
  { term: 'playstation 5', weight: 26 },
  { term: 'sony playstation', weight: 24 },
  { term: 'playstation', weight: 20 },
  { term: 'ps5', weight: 24 },
  { term: 'xbox series x', weight: 28 },
  { term: 'xbox series s', weight: 28 },
  { term: 'series x', weight: 18 },
  { term: 'series s', weight: 18 },
  { term: 'oyun konsolu', weight: 16 },
  { term: 'konsol', weight: 14 },
  { term: 'ps5 konsol', weight: 26 },
  { term: 'playstation konsol', weight: 24 },
  { term: 'xbox konsol', weight: 24 },
];

export const VALIDATION_CONTROLLER_TERMS: WeightedValidationTerm[] = [
  { term: 'dualsense edge', weight: 30 },
  { term: 'dualsense', weight: 28 },
  { term: 'dual sense', weight: 28 },
  { term: 'xbox elite', weight: 28 },
  { term: 'elite series 2', weight: 28 },
  { term: 'xbox wireless controller', weight: 26 },
  { term: 'wireless controller', weight: 22 },
  { term: 'xbox controller', weight: 24 },
  { term: 'gamepad', weight: 20 },
  { term: 'controller', weight: 18 },
  { term: 'kumanda', weight: 20 },
  { term: 'kol', weight: 18 },
];

export const VALIDATION_GAME_TERMS: WeightedValidationTerm[] = [
  { term: 'ea fc 26', weight: 32 },
  { term: 'fc 26', weight: 30 },
  { term: 'fc26', weight: 30 },
  { term: 'ea fc', weight: 28 },
  { term: 'fifa 26', weight: 28 },
  { term: 'fifa', weight: 24 },
  { term: 'call of duty', weight: 26 },
  { term: 'cod', weight: 18 },
  { term: 'spider man', weight: 24 },
  { term: 'spiderman', weight: 24 },
  { term: 'god of war', weight: 26 },
  { term: 'gran turismo', weight: 26 },
  { term: 'nba 2k', weight: 24 },
  { term: 'nba', weight: 16 },
  { term: 'minecraft', weight: 24 },
  { term: 'halo', weight: 22 },
  { term: 'forza', weight: 22 },
  { term: 'resident evil', weight: 24 },
  { term: 'cyberpunk', weight: 24 },
  { term: 'the last of us', weight: 26 },
  { term: 'ghost of tsushima', weight: 26 },
  { term: 'oyun', weight: 12 },
  { term: 'game', weight: 10 },
];

export const VALIDATION_ACCESSORY_TERMS: WeightedValidationTerm[] = [
  { term: 'charging station', weight: 24 },
  { term: 'headset', weight: 22 },
  { term: 'kulaklik', weight: 22 },
  { term: 'kulaklık', weight: 22 },
  { term: 'dock', weight: 20 },
  { term: 'stand', weight: 18 },
  { term: 'ssd', weight: 22 },
  { term: 'hdmi', weight: 20 },
  { term: 'sarj', weight: 18 },
  { term: 'şarj', weight: 18 },
  { term: 'camera', weight: 18 },
  { term: 'kamera', weight: 18 },
  { term: 'cover', weight: 16 },
  { term: 'skin', weight: 16 },
  { term: 'case', weight: 16 },
  { term: 'fan', weight: 18 },
  { term: 'cooling', weight: 18 },
  { term: 'soğutucu', weight: 18 },
  { term: 'sogutucu', weight: 18 },
  { term: 'power supply', weight: 20 },
  { term: 'psu', weight: 18 },
  { term: 'sticker', weight: 16 },
  { term: 'repair', weight: 22 },
  { term: 'tamir', weight: 22 },
  { term: 'servis', weight: 18 },
  { term: 'wanted', weight: 20 },
  { term: 'araniyor', weight: 20 },
  { term: 'aranıyor', weight: 20 },
  { term: 'fifa', weight: 24 },
  { term: 'bundle', weight: 18 },
  { term: 'set', weight: 12 },
  { term: 'aksesuar', weight: 14 },
];

export const VALIDATION_ACCOUNT_TERMS: WeightedValidationTerm[] = [
  { term: 'hesap', weight: 30 },
  { term: 'hesabi', weight: 30 },
  { term: 'hesabı', weight: 30 },
  { term: 'account', weight: 28 },
  { term: 'primary account', weight: 26 },
  { term: 'secondary account', weight: 26 },
  { term: 'primary', weight: 16 },
  { term: 'secondary', weight: 16 },
  { term: 'offline', weight: 14 },
  { term: 'online', weight: 12 },
  { term: 'shared', weight: 14 },
  { term: 'paylasimli', weight: 14 },
  { term: 'paylaşımlı', weight: 14 },
];

export const VALIDATION_SUBSCRIPTION_TERMS: WeightedValidationTerm[] = [
  { term: 'playstation plus deluxe', weight: 32 },
  { term: 'playstation plus extra', weight: 30 },
  { term: 'playstation plus essential', weight: 30 },
  { term: 'playstation plus', weight: 28 },
  { term: 'ps plus', weight: 28 },
  { term: 'xbox game pass ultimate', weight: 30 },
  { term: 'game pass ultimate', weight: 28 },
  { term: 'game pass', weight: 24 },
  { term: 'ultimate', weight: 14 },
  { term: 'deluxe', weight: 14 },
  { term: 'extra', weight: 12 },
  { term: 'essential', weight: 12 },
  { term: 'core', weight: 12 },
  { term: 'abonelik', weight: 18 },
  { term: 'subscription', weight: 16 },
];

export const VALIDATION_DIGITAL_CODE_TERMS: WeightedValidationTerm[] = [
  { term: 'gift card', weight: 28 },
  { term: 'digital code', weight: 28 },
  { term: 'voucher', weight: 24 },
  { term: 'redeem', weight: 22 },
  { term: 'kod', weight: 22 },
  { term: 'code', weight: 18 },
  { term: 'dijital kod', weight: 26 },
  { term: 'epin', weight: 20 },
  { term: 'cd key', weight: 24 },
];

export const VALIDATION_BUNDLE_SEPARATORS =
  /\s*(?:\+|&|\/|,|\band\b|\bve\b|\bile\b|\bwith\b|\bplus\b|\bartı\b|\barti\b)\s*/i;

export const VALIDATION_MARKETPLACE_CATEGORY_HINTS: Record<
  'console' | 'game' | 'controller' | 'accessory' | 'account' | 'digital_code' | 'subscription',
  readonly string[]
> = {
  console: ['konsol', 'console', 'oyun konsolu', 'playstation', 'xbox'],
  game: ['oyun', 'game', 'video oyun', 'video game'],
  controller: ['kumanda', 'controller', 'kol', 'gamepad', 'joystick'],
  accessory: ['aksesuar', 'accessory', 'sarj', 'şarj', 'kulaklik', 'kulaklık'],
  account: ['hesap', 'account'],
  digital_code: ['dijital', 'digital', 'kod', 'epin', 'gift card'],
  subscription: ['abonelik', 'subscription', 'plus', 'game pass'],
};

/** Physical product types that can form a bundle together with a console. */
export const VALIDATION_BUNDLE_COMPONENT_TYPES = [
  'game',
  'controller',
  'accessory',
  'subscription',
  'digital_code',
] as const;

export type ValidationBundleComponentType =
  (typeof VALIDATION_BUNDLE_COMPONENT_TYPES)[number];

export const VALIDATION_SCORE_KEYS = [
  'console',
  'game',
  'controller',
  'accessory',
  'account',
  'digital_code',
  'subscription',
  'bundle',
] as const;

export type ValidationScoreKey = (typeof VALIDATION_SCORE_KEYS)[number];

export const VALIDATION_TYPE_DICTIONARIES: Record<
  Exclude<ValidationScoreKey, 'bundle'>,
  WeightedValidationTerm[]
> = {
  console: VALIDATION_CONSOLE_TERMS,
  game: VALIDATION_GAME_TERMS,
  controller: VALIDATION_CONTROLLER_TERMS,
  accessory: VALIDATION_ACCESSORY_TERMS,
  account: VALIDATION_ACCOUNT_TERMS,
  digital_code: VALIDATION_DIGITAL_CODE_TERMS,
  subscription: VALIDATION_SUBSCRIPTION_TERMS,
};
