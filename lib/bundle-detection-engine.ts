import {
  BUNDLE_ACCESSORY_DICTIONARY,
  BUNDLE_CONSOLE_CATEGORIES,
  BUNDLE_CONSOLE_PLATFORM_HINTS,
  BUNDLE_CONTROLLER_DICTIONARY,
  BUNDLE_CONTROLLER_QUANTITY_PATTERNS,
  BUNDLE_GAME_DICTIONARY,
  BUNDLE_PACKAGING_KEYWORDS,
  BUNDLE_SEPARATOR_PATTERNS,
  type BundleExtraCategory,
} from '@/config/bundle-detection-dictionaries';
import type { ProductCategory } from '@/config/product-catalog';
import { normalizeListingTitle } from '@/lib/product-classifier';

export type { BundleExtraCategory };
/** @deprecated Classification removed — extras category type alias. */
export type DetectedBundleCategory = BundleExtraCategory;

export interface BundleRejectionResult {
  reject: boolean;
  reason: string | null;
  extras: BundleExtraCategory[];
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

function containsAny(normalized: string, terms: readonly string[]): boolean {
  return terms.some((term) => containsTerm(normalized, term));
}

function hasBundleSeparator(normalized: string): boolean {
  return BUNDLE_SEPARATOR_PATTERNS.some((pattern) => pattern.test(normalized));
}

function detectExtraCategories(normalized: string): BundleExtraCategory[] {
  const extras: BundleExtraCategory[] = [];

  if (containsAny(normalized, BUNDLE_GAME_DICTIONARY)) {
    extras.push('GAME');
  }

  if (
    containsAny(normalized, BUNDLE_CONTROLLER_DICTIONARY) ||
    BUNDLE_CONTROLLER_QUANTITY_PATTERNS.some((pattern) => pattern.test(normalized))
  ) {
    extras.push('CONTROLLER');
  }

  if (containsAny(normalized, BUNDLE_ACCESSORY_DICTIONARY)) {
    extras.push('ACCESSORY');
  }

  return extras;
}

function hasPackagingKeyword(normalized: string): boolean {
  return containsAny(normalized, BUNDLE_PACKAGING_KEYWORDS);
}

function hasConsolePlatformHint(normalized: string): boolean {
  return containsAny(normalized, BUNDLE_CONSOLE_PLATFORM_HINTS);
}

function isBundledConsoleTitle(normalized: string): BundleRejectionResult {
  const extras = detectExtraCategories(normalized);
  const packaging = hasPackagingKeyword(normalized);
  const separator = hasBundleSeparator(normalized);

  if (packaging) {
    return {
      reject: true,
      reason: extras.length > 0 ? buildRejectionReason(extras) : 'console+bundle',
      extras,
    };
  }

  if (extras.length >= 2) {
    return { reject: true, reason: buildRejectionReason(extras), extras };
  }

  if (extras.length === 1 && separator) {
    return { reject: true, reason: buildRejectionReason(extras), extras };
  }

  return { reject: false, reason: null, extras: [] };
}

/**
 * Reject bundled console listings by title alone (used when category is ambiguous).
 * Example: "Xbox + Headset"
 */
export function shouldRejectBundledListingTitle(title: string): boolean {
  const normalized = normalizeListingTitle(title);
  if (!normalized || !hasConsolePlatformHint(normalized)) {
    return false;
  }
  return isBundledConsoleTitle(normalized).reject;
}

function buildRejectionReason(extras: BundleExtraCategory[]): string {
  if (extras.length >= 2) return 'console+bundle:mixed';
  if (extras.length === 1) return `console+${extras[0]!.toLowerCase()}`;
  return 'console+bundle';
}

/**
 * Returns true when a supported console listing includes bundled extras
 * and must be rejected before database insertion.
 */
export function shouldRejectBundledConsoleListing(
  title: string,
  consoleCategory: ProductCategory | null,
): boolean {
  return getBundleRejection(title, consoleCategory).reject;
}

/** Detailed bundle rejection result for logging and sync pipelines. */
export function getBundleRejection(
  title: string,
  consoleCategory: ProductCategory | null,
): BundleRejectionResult {
  if (!consoleCategory || !BUNDLE_CONSOLE_CATEGORIES.includes(consoleCategory)) {
    return { reject: false, reason: null, extras: [] };
  }

  const normalized = normalizeListingTitle(title);
  if (!normalized) {
    return { reject: false, reason: null, extras: [] };
  }

  return isBundledConsoleTitle(normalized);
}

/** Whether the category is a standalone console eligible for bundle filtering. */
export function isBundleFilteredConsole(category: ProductCategory): boolean {
  return BUNDLE_CONSOLE_CATEGORIES.includes(category);
}

/** @deprecated Alias — returns rejection flag only. */
export function detectBundle(title: string, consoleCategory: ProductCategory | null = null) {
  const result = getBundleRejection(title, consoleCategory);
  return {
    bundle: result.reject,
    bundle_type: result.reject ? 'MIXED' : 'CONSOLE_ONLY',
    categories: result.extras,
  };
}

/** @deprecated Bundles are rejected — always stores standalone defaults. */
export function bundleDetectionColumns(_title: string): {
  is_bundle: boolean;
  bundle_type: 'CONSOLE_ONLY';
} {
  return { is_bundle: false, bundle_type: 'CONSOLE_ONLY' };
}

/** @deprecated Use isBundleFilteredConsole */
export const isBundleEligibleConsole = isBundleFilteredConsole;

export const bundleDetectionEngine = {
  shouldReject: shouldRejectBundledConsoleListing,
  getRejection: getBundleRejection,
  isConsole: isBundleFilteredConsole,
};
