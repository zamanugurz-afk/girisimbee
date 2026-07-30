import type { ProductCategory } from '@/config/product-catalog';
import {
  BRAND_BY_PLATFORM,
  BRAND_PATTERNS,
  COLOR_PATTERNS,
  CONDITION_PATTERNS,
  EDITION_PATTERNS,
  FAMILY_BY_GENERATION,
  LEGACY_FAMILY_TO_STRUCTURED,
  GENERATION_PATTERNS,
  MODEL_BY_GENERATION,
  PLATFORM_BY_GENERATION,
  PLATFORM_PATTERNS,
  STORAGE_PATTERNS,
} from '@/config/product-intelligence-dictionaries';
import type { DetectedBundleType } from '@/config/bundle-detection-dictionaries';
import {
  classifyListingTitle,
  normalizeListingTitle,
} from '@/lib/product-classifier';

export type ProductBrand = 'SONY' | 'MICROSOFT' | 'UNKNOWN';
export type ProductPlatform = 'PLAYSTATION' | 'XBOX' | 'UNKNOWN';
export type ProductGeneration =
  | 'PS5'
  | 'PS5_PRO'
  | 'SERIES_X'
  | 'SERIES_S'
  | 'DUALSENSE'
  | 'DUALSENSE_EDGE'
  | 'XBOX_CONTROLLER'
  | 'XBOX_ELITE'
  | 'UNKNOWN';
export type ProductModel = 'BASE' | 'SLIM' | 'PRO' | 'STANDARD' | 'ELITE' | 'UNKNOWN';
export type IntelligenceFamily = 'CONSOLE' | 'CONTROLLER' | 'UNKNOWN';
export type ProductEdition = 'DISC' | 'DIGITAL' | 'UNKNOWN';
export type ProductStorage = 'UNKNOWN' | '512GB' | '825GB' | '1TB' | '2TB';
export type ProductColor =
  | 'BLACK'
  | 'WHITE'
  | 'RED'
  | 'BLUE'
  | 'PINK'
  | 'PURPLE'
  | 'GREY'
  | 'GREEN'
  | 'UNKNOWN';
export type ProductItemCondition = 'NEW' | 'LIKE_NEW' | 'USED' | 'UNKNOWN';
/** @deprecated Use DetectedBundleType — kept for backward compatibility. */
export type ProductBundleType = DetectedBundleType | 'CONSOLE_AND_CONTROLLER' | 'UNKNOWN';
export type LegacyProductFamily = ProductCategory;

/** Full structured product intelligence — reusable across search, grouping, pricing, recommendations. */
export interface StructuredProductIntelligence {
  brand: ProductBrand;
  platform: ProductPlatform;
  generation: ProductGeneration;
  model: ProductModel;
  edition: ProductEdition;
  storage: ProductStorage;
  color: ProductColor;
  condition: ProductItemCondition;
  /** Product type: console vs controller. */
  family: IntelligenceFamily;
  /** Legacy indexed category (backward compatible). */
  product_family: LegacyProductFamily;
  bundle: boolean;
  bundle_type: DetectedBundleType;
}

export interface ListingIntelligenceSource {
  title: string;
  product_family?: string | null;
  edition?: string | null;
  storage?: string | null;
  item_condition?: string | null;
  brand?: string | null;
  platform?: string | null;
  generation?: string | null;
  model?: string | null;
  color?: string | null;
  bundle_type?: string | null;
  is_bundle?: boolean | null;
}

const CONSOLE_GENERATIONS = new Set<ProductGeneration>([
  'PS5',
  'PS5_PRO',
  'SERIES_X',
  'SERIES_S',
]);

function containsTerm(normalized: string, term: string): boolean {
  const t = term.toLowerCase().trim();
  if (!t) return false;
  if (t.includes(' ')) {
    return normalized.includes(t);
  }
  const re = new RegExp(`(?:^|[\\s+\\-/,(])${t}(?:$|[\\s+\\-/,)])`, 'i');
  return re.test(normalized) || normalized === t;
}

function containsAny(normalized: string, terms: readonly string[]): boolean {
  return terms.some((term) => containsTerm(normalized, term));
}

function detectBrand(normalized: string, platform: ProductPlatform): ProductBrand {
  for (const [brand, patterns] of Object.entries(BRAND_PATTERNS) as [ProductBrand, readonly string[]][]) {
    if (containsAny(normalized, patterns)) return brand;
  }
  if (platform !== 'UNKNOWN') {
    return (BRAND_BY_PLATFORM[platform] as ProductBrand) ?? 'UNKNOWN';
  }
  return 'UNKNOWN';
}

function detectPlatform(normalized: string, generation: ProductGeneration): ProductPlatform {
  if (generation !== 'UNKNOWN') {
    return (PLATFORM_BY_GENERATION[generation] as ProductPlatform) ?? 'UNKNOWN';
  }
  for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS) as [ProductPlatform, readonly string[]][]) {
    if (containsAny(normalized, patterns)) return platform;
  }
  return 'UNKNOWN';
}

function detectGeneration(normalized: string): ProductGeneration {
  for (const [generation, patterns] of GENERATION_PATTERNS) {
    if (patterns.some((pattern) => containsTerm(normalized, pattern))) {
      return generation as ProductGeneration;
    }
  }
  return 'UNKNOWN';
}

function detectModel(generation: ProductGeneration, normalized: string): ProductModel {
  if (generation === 'PS5' && containsTerm(normalized, 'slim')) return 'SLIM';
  if (generation === 'PS5_PRO') return 'PRO';
  if (generation !== 'UNKNOWN') {
    return (MODEL_BY_GENERATION[generation] as ProductModel) ?? 'UNKNOWN';
  }
  if (containsTerm(normalized, 'slim')) return 'SLIM';
  if (containsTerm(normalized, 'pro')) return 'PRO';
  if (containsTerm(normalized, 'elite')) return 'ELITE';
  return 'UNKNOWN';
}

function detectIntelligenceFamily(generation: ProductGeneration): IntelligenceFamily {
  if (generation === 'UNKNOWN') return 'UNKNOWN';
  return FAMILY_BY_GENERATION[generation] ?? 'UNKNOWN';
}

function detectEdition(normalized: string, family: IntelligenceFamily): ProductEdition {
  if (family !== 'CONSOLE') return 'UNKNOWN';
  const hasDigital = containsAny(normalized, EDITION_PATTERNS.DIGITAL);
  const hasDisc = containsAny(normalized, EDITION_PATTERNS.DISC);
  if (hasDigital && !hasDisc) return 'DIGITAL';
  if (hasDisc) return 'DISC';
  return 'UNKNOWN';
}

function detectStorage(normalized: string): ProductStorage {
  for (const [storage, pattern] of STORAGE_PATTERNS) {
    if (pattern.test(normalized)) {
      return storage as ProductStorage;
    }
  }
  return 'UNKNOWN';
}

function detectColor(normalized: string): ProductColor {
  let best: { color: ProductColor; length: number } | null = null;

  for (const [color, phrases] of COLOR_PATTERNS) {
    for (const phrase of phrases) {
      if (normalized.includes(phrase)) {
        if (!best || phrase.length > best.length) {
          best = { color: color as ProductColor, length: phrase.length };
        }
      }
    }
  }

  return best?.color ?? 'UNKNOWN';
}

function detectCondition(normalized: string): ProductItemCondition {
  if (containsAny(normalized, CONDITION_PATTERNS.NEW)) return 'NEW';
  if (containsAny(normalized, CONDITION_PATTERNS.LIKE_NEW)) return 'LIKE_NEW';
  if (containsAny(normalized, CONDITION_PATTERNS.USED)) return 'USED';
  return 'UNKNOWN';
}

function resolveBundleFields(): { bundle: boolean; bundle_type: DetectedBundleType } {
  return { bundle: false, bundle_type: 'CONSOLE_ONLY' };
}

function legacyFamilyFromStructured(
  generation: ProductGeneration,
  model: ProductModel,
): LegacyProductFamily | null {
  if (generation === 'PS5') {
    if (model === 'SLIM') return 'PS5_SLIM';
    return 'PS5';
  }
  switch (generation) {
    case 'PS5_PRO':
      return 'PS5_PRO';
    case 'SERIES_X':
      return 'XBOX_SERIES_X';
    case 'SERIES_S':
      return 'XBOX_SERIES_S';
    case 'DUALSENSE':
      return 'DUALSENSE';
    case 'DUALSENSE_EDGE':
      return 'DUALSENSE_EDGE';
    case 'XBOX_CONTROLLER':
      return 'XBOX_CONTROLLER';
    case 'XBOX_ELITE':
      return 'XBOX_ELITE_SERIES_2';
    default:
      return null;
  }
}

/** Analyze a listing title into structured product intelligence. */
export function analyzeProduct(title: string): StructuredProductIntelligence | null {
  const legacyFamily = classifyListingTitle(title);
  if (!legacyFamily) return null;

  const normalized = normalizeListingTitle(title);
  let generation = detectGeneration(normalized);

  if (generation === 'UNKNOWN') {
    const mapped = LEGACY_FAMILY_TO_STRUCTURED[legacyFamily];
    if (mapped) {
      generation = mapped.generation as ProductGeneration;
    }
  }

  const platform = detectPlatform(normalized, generation);
  const brand = detectBrand(normalized, platform);
  const model = detectModel(generation, normalized);
  const family = detectIntelligenceFamily(generation);
  const edition = detectEdition(normalized, family);
  const storage = detectStorage(normalized);
  const color = detectColor(normalized);
  const condition = detectCondition(normalized);
  const { bundle, bundle_type } = resolveBundleFields();
  const product_family = legacyFamilyFromStructured(generation, model) ?? legacyFamily;

  return {
    brand,
    platform,
    generation,
    model,
    edition,
    storage,
    color,
    condition,
    family,
    product_family,
    bundle,
    bundle_type,
  };
}

/** Build a stable comparison key from structured intelligence (ignores title wording). */
export function buildStructuredMatchKey(intel: StructuredProductIntelligence): string {
  if (intel.family === 'CONTROLLER') {
    const color = intel.color === 'UNKNOWN' ? '*' : intel.color;
    return `STANDALONE|CTRL|${intel.generation}|${color}`;
  }

  const edition = intel.edition === 'DIGITAL' ? 'DIGITAL' : 'DISC';
  return `STANDALONE|CON|${intel.platform}|${intel.generation}|${intel.model}|${edition}|${intel.storage}`;
}

/** Human-readable label from structured intelligence. */
export function buildStructuredLabel(intel: StructuredProductIntelligence): string {
  const parts: string[] = [];

  if (intel.brand !== 'UNKNOWN') parts.push(intel.brand);
  if (intel.platform !== 'UNKNOWN') parts.push(intel.platform.replace('_', ' '));
  if (intel.generation !== 'UNKNOWN') parts.push(intel.generation.replace(/_/g, ' '));
  if (intel.model !== 'UNKNOWN' && intel.model !== 'BASE' && intel.model !== 'STANDARD') {
    parts.push(intel.model);
  }
  if (intel.edition !== 'UNKNOWN') parts.push(intel.edition);
  if (intel.storage !== 'UNKNOWN') parts.push(intel.storage);
  if (intel.color !== 'UNKNOWN') parts.push(intel.color);

  return parts.join(' · ') || intel.product_family.replace(/_/g, ' ');
}

/** Map structured intelligence to DB column payload (includes legacy fields). */
export function structuredIntelligenceColumns(title: string): Record<string, string | boolean> | null {
  const intel = analyzeProduct(title);
  if (!intel) return null;

  return {
    brand: intel.brand,
    platform: intel.platform,
    generation: intel.generation,
    model: intel.model,
    color: intel.color,
    product_family: intel.product_family,
    edition: intel.edition,
    storage: intel.storage,
    item_condition: intel.condition,
    is_bundle: false,
    bundle_type: 'CONSOLE_ONLY',
  };
}

/** Resolve intelligence from stored DB columns or title analysis. */
export function resolveStructuredIntelligence(
  listing: ListingIntelligenceSource,
): StructuredProductIntelligence | null {
  if (listing.generation || listing.product_family) {
    let generation: ProductGeneration = 'UNKNOWN';
    let model: ProductModel = 'UNKNOWN';

    if (listing.generation) {
      generation = listing.generation as ProductGeneration;
      model = (listing.model as ProductModel) ?? detectModel(generation, normalizeListingTitle(listing.title));
    } else if (listing.product_family) {
      const mapped = LEGACY_FAMILY_TO_STRUCTURED[listing.product_family];
      if (mapped) {
        generation = mapped.generation as ProductGeneration;
        model = (listing.model as ProductModel) ?? (mapped.model as ProductModel);
      }
    }

    const platform =
      (listing.platform as ProductPlatform) ??
      (PLATFORM_BY_GENERATION[generation] as ProductPlatform) ??
      'UNKNOWN';

    const brand =
      (listing.brand as ProductBrand) ??
      (BRAND_BY_PLATFORM[platform] as ProductBrand) ??
      'UNKNOWN';

    if (listing.model) {
      model = listing.model as ProductModel;
    }

    const family =
      (FAMILY_BY_GENERATION[generation] as IntelligenceFamily) ?? 'UNKNOWN';

    const product_family =
      (listing.product_family as LegacyProductFamily) ??
      legacyFamilyFromStructured(generation, model) ??
      'PS5';

    const { bundle, bundle_type } = resolveBundleFields();

    return {
      brand,
      platform,
      generation,
      model,
      edition: (listing.edition ?? 'UNKNOWN') as ProductEdition,
      storage: (listing.storage ?? 'UNKNOWN') as ProductStorage,
      color: (listing.color ?? 'UNKNOWN') as ProductColor,
      condition: (listing.item_condition ?? 'UNKNOWN') as ProductItemCondition,
      family,
      product_family,
      bundle,
      bundle_type,
    };
  }

  return analyzeProduct(listing.title);
}

/** Edition grouping helper — DIGITAL separate, DISC merges with UNKNOWN. */
export function groupingEdition(edition: ProductEdition): 'DIGITAL' | 'DISC' {
  return edition === 'DIGITAL' ? 'DIGITAL' : 'DISC';
}

export function isConsoleGeneration(generation: ProductGeneration): boolean {
  return CONSOLE_GENERATIONS.has(generation);
}
