import {
  CATEGORY_TO_PRODUCT_SLUG,
  DEFAULT_SYNC_SEARCH_KEYWORD,
  PRODUCT_SLUG_TO_CATEGORY,
  REJECTED_LISTING_GROUPS,
  SUPPORTED_PRODUCT_CATEGORIES,
  SYNC_SEARCH_KEYWORDS,
  type ProductCategory,
  type RejectedListingGroup,
} from '@/config/product-catalog';
import {
  BLACKLIST_ACCESSORIES,
  BLACKLIST_BUNDLE_KEYWORDS,
  BLACKLIST_BUNDLE_PATTERNS,
  BLACKLIST_GAME_KEYWORDS,
  BLACKLIST_GAME_TITLES,
  BLACKLIST_OLD_GENERATIONS,
  TOTAL_BLACKLIST_KEYWORDS,
} from '@/config/product-blacklist';
import { PRODUCT_WHITELIST, TOTAL_WHITELIST_KEYWORDS } from '@/config/product-whitelist';
import { getBundleRejection, isBundleFilteredConsole, shouldRejectBundledListingTitle } from '@/lib/bundle-detection-engine';
import { validatePrimaryProduct } from '@/lib/engines/product-validation-engine';

export type { ProductCategory, RejectedListingGroup };
export {
  SUPPORTED_PRODUCT_CATEGORIES,
  REJECTED_LISTING_GROUPS,
  SYNC_SEARCH_KEYWORDS,
  DEFAULT_SYNC_SEARCH_KEYWORD,
  CATEGORY_TO_PRODUCT_SLUG,
  PRODUCT_SLUG_TO_CATEGORY,
  TOTAL_WHITELIST_KEYWORDS,
  TOTAL_BLACKLIST_KEYWORDS,
};

export interface ClassificationResult {
  category: ProductCategory;
}

export interface RejectionResult {
  rejected: true;
  reason: RejectedListingGroup;
}

export type ListingClassification = ClassificationResult | RejectionResult;

const COMPILED_BUNDLE_PATTERNS = BLACKLIST_BUNDLE_PATTERNS.map((source) => new RegExp(source, 'i'));

/** Categories checked in whitelist order (most specific first). */
const CLASSIFICATION_ORDER = PRODUCT_WHITELIST.map((entry) => entry.category);

export function normalizeListingTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s+\-/]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsTerm(normalized: string, term: string): boolean {
  const t = term.toLowerCase().trim();
  if (!t) return false;
  if (t.includes(' ')) {
    return normalized.includes(t);
  }
  const re = new RegExp(`(?:^|[\\s+\\-/,(])${t}(?:$|[\\s+\\-/,)])`, 'i');
  return re.test(normalized) || normalized === t;
}

function getWhitelistKeywords(category: ProductCategory): string[] {
  return PRODUCT_WHITELIST.find((entry) => entry.category === category)?.keywords ?? [];
}

function matchesWhitelistCategory(normalized: string, category: ProductCategory): boolean {
  const keywords = getWhitelistKeywords(category);
  if (!keywords.some((keyword) => containsTerm(normalized, keyword))) {
    return false;
  }

  switch (category) {
    case 'PS5':
      return (
        !containsTerm(normalized, 'pro') &&
        !containsTerm(normalized, 'slim') &&
        !isControllerOnlyListing(normalized, 'playstation')
      );
    case 'PS5_SLIM':
      return !containsTerm(normalized, 'pro');
    case 'PS5_PRO':
      return true;
    case 'DUALSENSE':
      return !containsTerm(normalized, 'edge');
    case 'DUALSENSE_EDGE':
      return true;
    case 'XBOX_CONTROLLER':
      return (
        !containsTerm(normalized, 'elite') &&
        !containsTerm(normalized, 'series x') &&
        !containsTerm(normalized, 'series s')
      );
    case 'XBOX_ELITE_SERIES_2':
      return true;
    case 'XBOX_SERIES_X':
      return (
        !containsTerm(normalized, 'series s') &&
        !containsTerm(normalized, 'controller') &&
        !containsTerm(normalized, 'kumanda') &&
        !containsTerm(normalized, 'kol')
      );
    case 'XBOX_SERIES_S':
      return (
        !containsTerm(normalized, 'series x') &&
        !containsTerm(normalized, 'controller') &&
        !containsTerm(normalized, 'kumanda') &&
        !containsTerm(normalized, 'kol')
      );
    default:
      return true;
  }
}

function isControllerOnlyListing(normalized: string, platform: 'playstation' | 'xbox'): boolean {
  const controllerHints = ['controller', 'kol', 'kumanda', 'dualsense', 'dual sense', 'gamepad'];
  const consoleHints = ['console', 'konsol', 'cihaz'];
  const hasControllerHint = controllerHints.some((hint) => containsTerm(normalized, hint));
  const hasConsoleHint = consoleHints.some((hint) => containsTerm(normalized, hint));
  if (!hasControllerHint) return false;
  if (hasConsoleHint) return false;
  if (platform === 'playstation' && containsTerm(normalized, 'ps5')) {
    return true;
  }
  if (platform === 'xbox' && containsTerm(normalized, 'xbox')) {
    return true;
  }
  return hasControllerHint;
}

function findWhitelistCategory(normalized: string): ProductCategory | null {
  for (const category of CLASSIFICATION_ORDER) {
    if (matchesWhitelistCategory(normalized, category)) {
      return category;
    }
  }
  return null;
}

export function getListingRejectionReason(title: string): RejectedListingGroup | null {
  const normalized = normalizeListingTitle(title);
  if (!normalized) return 'UNSUPPORTED_PRODUCT';

  for (const term of BLACKLIST_OLD_GENERATIONS) {
    if (containsTerm(normalized, term)) return 'OLD_GENERATIONS';
  }

  const primaryCategory = findWhitelistCategory(normalized);

  if (
    primaryCategory &&
    isBundleFilteredConsole(primaryCategory) &&
    getBundleRejection(title, primaryCategory).reject
  ) {
    return 'BUNDLES';
  }

  if (shouldRejectBundledListingTitle(title)) {
    return 'BUNDLES';
  }

  for (const pattern of COMPILED_BUNDLE_PATTERNS) {
    if (pattern.test(normalized)) return 'BUNDLES';
  }

  for (const keyword of BLACKLIST_BUNDLE_KEYWORDS) {
    if (containsTerm(normalized, keyword) && /\+|plus|ve |and |ile /i.test(normalized)) {
      return 'BUNDLES';
    }
  }

  for (const term of BLACKLIST_GAME_TITLES) {
    if (containsTerm(normalized, term)) return 'GAMES';
  }

  for (const term of BLACKLIST_GAME_KEYWORDS) {
    if (containsTerm(normalized, term)) return 'GAMES';
  }

  for (const term of BLACKLIST_ACCESSORIES) {
    if (containsTerm(normalized, term)) return 'ACCESSORIES';
  }

  return null;
}

/** Classify a listing title or return null if it must not be indexed. */
export function classifyListingTitle(title: string): ProductCategory | null {
  const rejection = getListingRejectionReason(title);
  if (rejection) return null;

  const normalized = normalizeListingTitle(title);
  return findWhitelistCategory(normalized);
}

export function classifyListing(title: string): ListingClassification | null {
  const rejection = getListingRejectionReason(title);
  if (rejection) return { rejected: true, reason: rejection };

  const category = classifyListingTitle(title);
  if (!category) return null;
  return { category };
}

export function getProductSlugForCategory(category: ProductCategory): string {
  return CATEGORY_TO_PRODUCT_SLUG[category];
}

export function getCategoryFromProductSlug(slug: string): ProductCategory | null {
  return PRODUCT_SLUG_TO_CATEGORY[slug] ?? null;
}

/**
 * Map a user search query to allowed product categories.
 * Returns null when the query is generic (no product-specific filter).
 */
export function resolveSearchCategories(query: string): ProductCategory[] | null {
  const normalized = normalizeListingTitle(query);
  if (!normalized) return null;

  if (
    containsTerm(normalized, 'dualsense edge') ||
    containsTerm(normalized, 'dual sense edge')
  ) {
    return ['DUALSENSE_EDGE'];
  }
  if (containsTerm(normalized, 'dualsense') || containsTerm(normalized, 'dual sense')) {
    return ['DUALSENSE'];
  }
  if (containsTerm(normalized, 'elite series 2') || containsTerm(normalized, 'xbox elite')) {
    return ['XBOX_ELITE_SERIES_2'];
  }
  if (
    containsTerm(normalized, 'xbox controller') ||
    containsTerm(normalized, 'xbox wireless controller') ||
    containsTerm(normalized, 'xbox kol') ||
    containsTerm(normalized, 'xbox kumanda')
  ) {
    return ['XBOX_CONTROLLER'];
  }
  if (containsTerm(normalized, 'ps5 pro') || containsTerm(normalized, 'playstation 5 pro')) {
    return ['PS5_PRO'];
  }
  if (containsTerm(normalized, 'ps5 slim') || containsTerm(normalized, 'playstation 5 slim')) {
    return ['PS5_SLIM'];
  }
  if (containsTerm(normalized, 'ps5') || containsTerm(normalized, 'playstation 5')) {
    return ['PS5', 'PS5_SLIM', 'PS5_PRO'];
  }
  if (containsTerm(normalized, 'xbox series x') || normalized === 'series x') {
    return ['XBOX_SERIES_X'];
  }
  if (containsTerm(normalized, 'xbox series s') || normalized === 'series s') {
    return ['XBOX_SERIES_S'];
  }

  return null;
}

export function listingMatchesSearchQuery(
  title: string,
  productSlug: string | null | undefined,
  query: string,
  productFamily?: ProductCategory | string | null,
): boolean {
  const allowed = resolveSearchCategories(query);
  if (!allowed) {
    const q = normalizeListingTitle(query);
    return normalizeListingTitle(title).includes(q);
  }

  const category =
    (productFamily as ProductCategory | null | undefined) ??
    (productSlug ? getCategoryFromProductSlug(productSlug) : null) ??
    classifyListingTitle(title);
  return category != null && allowed.includes(category);
}

export function listingTitleFromMarketplaceUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const letgoSlug = pathname.match(/\/item\/(.+)-iid-\d+/i)?.[1];
    if (letgoSlug) {
      return letgoSlug.replace(/-/g, ' ').trim();
    }

    const dolapSlug = pathname.match(/\/urun\/(.+)-(\d+)/i)?.[1];
    if (dolapSlug) {
      return dolapSlug.replace(/-/g, ' ').trim();
    }
  } catch {
    return null;
  }

  return null;
}

export function listingClassificationCandidates(input: {
  title: string;
  url?: string | null;
}): string[] {
  const candidates = [input.title.trim()];
  const fromUrl = input.url ? listingTitleFromMarketplaceUrl(input.url) : null;
  if (fromUrl && !candidates.includes(fromUrl)) {
    candidates.push(fromUrl);
  }
  return candidates.filter(Boolean);
}

/** True when a scraped listing represents a supported console we index. */
export function isIndexableGamingListing(input: {
  title: string;
  description?: string | null;
  url?: string | null;
}): boolean {
  for (const candidate of listingClassificationCandidates(input)) {
    if (classifyListingTitle(candidate)) return true;

    const primary = validatePrimaryProduct({
      title: candidate,
      description: input.description ?? null,
    });
    if (primary.accepted) return true;
  }

  return false;
}

export function classifyListingFromSources(input: {
  title: string;
  url?: string | null;
}): ProductCategory | null {
  for (const candidate of listingClassificationCandidates(input)) {
    const category = classifyListingTitle(candidate);
    if (category) return category;
  }
  return null;
}

export function getClassifierStats() {
  return {
    totalWhitelistKeywords: TOTAL_WHITELIST_KEYWORDS,
    totalBlacklistKeywords: TOTAL_BLACKLIST_KEYWORDS,
    supportedCategories: SUPPORTED_PRODUCT_CATEGORIES,
    rejectedCategories: [...REJECTED_LISTING_GROUPS],
  };
}
