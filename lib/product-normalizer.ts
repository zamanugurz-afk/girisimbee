import type { DetectedBundleType } from '@/config/bundle-detection-dictionaries';
import type { ProductCategory } from '@/config/product-catalog';
import {
  analyzeProduct,
  buildStructuredLabel,
  buildStructuredMatchKey,
  groupingEdition,
  resolveStructuredIntelligence,
  structuredIntelligenceColumns,
  type IntelligenceFamily,
  type LegacyProductFamily,
  type ListingIntelligenceSource,
  type ProductBrand,
  type ProductBundleType,
  type ProductColor,
  type ProductEdition,
  type ProductGeneration,
  type ProductItemCondition,
  type ProductModel,
  type ProductPlatform,
  type ProductStorage,
  type StructuredProductIntelligence,
} from '@/lib/product-analyzer';
import { SUPPORTED_PRODUCT_CATEGORIES } from '@/lib/product-classifier';

export type ProductFamily = ProductCategory;

/** @deprecated Use StructuredProductIntelligence — kept for backward compatibility. */
export interface NormalizedProduct {
  product_family: ProductFamily;
  edition: ProductEdition;
  storage: ProductStorage;
  condition: ProductItemCondition;
  bundle: boolean;
  bundle_type: DetectedBundleType;
}

export {
  analyzeProduct,
  buildStructuredLabel,
  buildStructuredMatchKey,
  groupingEdition,
  resolveStructuredIntelligence,
  structuredIntelligenceColumns,
  type IntelligenceFamily,
  type ProductBrand,
  type ProductBundleType,
  type ProductColor,
  type ProductEdition,
  type ProductGeneration,
  type ProductItemCondition,
  type ProductModel,
  type ProductPlatform,
  type ProductStorage,
  type StructuredProductIntelligence,
};

export { SUPPORTED_PRODUCT_CATEGORIES as SUPPORTED_PRODUCT_FAMILIES };

function toNormalizedProduct(intel: StructuredProductIntelligence): NormalizedProduct {
  return {
    product_family: intel.product_family,
    edition: intel.edition,
    storage: intel.storage,
    condition: intel.condition,
    bundle: intel.bundle,
    bundle_type: intel.bundle_type,
  };
}

/** Normalize a listing title into canonical product intelligence fields. */
export function normalizeProduct(title: string): NormalizedProduct | null {
  const intel = analyzeProduct(title);
  return intel ? toNormalizedProduct(intel) : null;
}

/** Map normalizer output to listing column payload (preserves existing `condition` grade). */
export function productIntelligenceColumns(title: string): Record<string, string | boolean> | null {
  return structuredIntelligenceColumns(title);
}

export interface ListingIntelligenceInput extends ListingIntelligenceSource {}

/** Resolve intelligence from stored columns or title normalization. */
export function resolveListingIntelligence(
  listing: ListingIntelligenceInput,
): NormalizedProduct | null {
  const intel = resolveStructuredIntelligence(listing);
  return intel ? toNormalizedProduct(intel) : null;
}

/** Resolve full structured intelligence from stored columns or title. */
export function resolveProductIntelligence(
  listing: ListingIntelligenceInput,
): StructuredProductIntelligence | null {
  return resolveStructuredIntelligence(listing);
}

export type { LegacyProductFamily };
