import { listingMatchesSearchQuery } from '@/lib/product-classifier';
import {
  buildStructuredLabel,
  buildStructuredMatchKey,
  groupingEdition,
  resolveStructuredIntelligence,
  type ProductEdition,
  type ProductStorage,
} from '@/lib/product-analyzer';
import type { LegacyProductFamily } from '@/lib/product-normalizer';
import type { GroupedProductSearchResponse, ListingResponse, ProductMatchGroup } from '@/types';

export interface ProductMatchKey {
  product_family: LegacyProductFamily;
  edition: ProductEdition;
  storage: ProductStorage;
}

export {
  groupingEdition,
  buildStructuredMatchKey,
  buildStructuredLabel,
} from '@/lib/product-analyzer';

/** Stable match key — ignores seller, provider, district, and title wording. */
export function buildProductMatchKey(intel: ProductMatchKey): string {
  const edition = groupingEdition(intel.edition);
  return `${intel.product_family}|${edition}|${intel.storage}`;
}

export function buildProductMatchLabel(intel: ProductMatchKey): string {
  const structured = resolveStructuredIntelligence({
    title: '',
    product_family: intel.product_family,
    edition: intel.edition,
    storage: intel.storage,
  });

  if (structured) {
    return buildStructuredLabel(structured);
  }

  const familyLabel = intel.product_family.replace(/_/g, ' ');
  const parts = [familyLabel];
  if (intel.edition !== 'UNKNOWN') parts.push(intel.edition);
  if (intel.storage !== 'UNKNOWN') parts.push(intel.storage);
  return parts.join(' · ');
}

function resolveMatchKey(listing: ListingResponse): string | null {
  const intel = resolveStructuredIntelligence(listing);
  if (!intel) return null;
  return buildStructuredMatchKey(intel);
}

function resolveLegacyKey(listing: ListingResponse): ProductMatchKey | null {
  const intel = resolveStructuredIntelligence(listing);
  if (!intel) return null;

  return {
    product_family: intel.product_family,
    edition: intel.edition,
    storage: intel.storage,
  };
}

function averagePrice(prices: number[]): number {
  if (prices.length === 0) return 0;
  return Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
}

export class ProductMatchingEngine {
  /** Group listings that represent the same physical product. */
  groupListings(listings: ListingResponse[]): ProductMatchGroup[] {
    const buckets = new Map<
      string,
      { key: ProductMatchKey; label: string; listings: ListingResponse[] }
    >();

    for (const listing of listings) {
      if (!listing.is_active || listing.deleted_at) continue;
      if (listing.is_bundle) continue;

      const intel = resolveStructuredIntelligence(listing);
      if (intel?.bundle) continue;

      const matchId = resolveMatchKey(listing);
      const legacyKey = resolveLegacyKey(listing);
      if (!matchId || !legacyKey) continue;

      const structured = resolveStructuredIntelligence(listing);
      const label = structured ? buildStructuredLabel(structured) : buildProductMatchLabel(legacyKey);

      const bucket = buckets.get(matchId);
      if (bucket) {
        bucket.listings.push(listing);
      } else {
        buckets.set(matchId, { key: legacyKey, label, listings: [listing] });
      }
    }

    const groups: ProductMatchGroup[] = [];

    for (const [id, bucket] of buckets) {
      const prices = bucket.listings.map((listing) => listing.price);
      const providerMap = new Map<string, ProductMatchGroup['providers'][number]>();

      for (const listing of bucket.listings) {
        const provider = listing.provider;
        if (provider && !providerMap.has(provider.id)) {
          providerMap.set(provider.id, {
            id: provider.id,
            slug: provider.slug,
            name: provider.name,
          });
        }
      }

      groups.push({
        id,
        product_family: bucket.key.product_family,
        edition: bucket.key.edition,
        storage: bucket.key.storage,
        label: bucket.label,
        listing_count: bucket.listings.length,
        lowest_price: Math.min(...prices),
        highest_price: Math.max(...prices),
        average_price: averagePrice(prices),
        providers: [...providerMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
        listing_ids: bucket.listings.map((listing) => listing.id),
      });
    }

    return groups.sort((a, b) => {
      if (b.listing_count !== a.listing_count) return b.listing_count - a.listing_count;
      return a.lowest_price - b.lowest_price;
    });
  }

  /** Filter listings by search query, then group by product intelligence fields. */
  searchGrouped(query: string, listings: ListingResponse[]): GroupedProductSearchResponse {
    const start = Date.now();
    const trimmed = query.trim();

    if (!trimmed) {
      return { query, groups: [], total_listings: 0, duration_ms: 0 };
    }

    const matched = listings.filter((listing) => {
      if (!listing.is_active || listing.deleted_at) return false;
      return listingMatchesSearchQuery(
        listing.title,
        listing.product?.slug,
        trimmed,
        listing.product_family,
      );
    });

    const groups = this.groupListings(matched);

    return {
      query: trimmed,
      groups,
      total_listings: matched.length,
      duration_ms: Date.now() - start,
    };
  }
}

export const productMatchingEngine = new ProductMatchingEngine();

export function groupListingsByProduct(listings: ListingResponse[]): ProductMatchGroup[] {
  return productMatchingEngine.groupListings(listings);
}

export function searchGroupedProducts(
  query: string,
  listings: ListingResponse[],
): GroupedProductSearchResponse {
  return productMatchingEngine.searchGrouped(query, listings);
}
