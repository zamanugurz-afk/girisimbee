import type { ProductCategory } from '@/config/product-catalog';
import { getListingSourceUrl } from '@/lib/listing-source';
import { formatGroupedProductName } from '@/lib/grouped-product-view';
import {
  classifyListingTitle,
  getCategoryFromProductSlug,
  listingMatchesSearchQuery,
  normalizeListingTitle,
  resolveSearchCategories,
} from '@/lib/product-classifier';
import { resolveStructuredIntelligence } from '@/lib/product-analyzer';
import { filterMarketplaceListings } from '@/lib/listing-window';
import { attachDealScoresToGroups } from '@/lib/engines/deal-score-engine';
import { productMatchingEngine } from '@/lib/engines/product-matching-engine';
import type {
  SearchResult,
  SearchResponse,
  SearchEntityType,
  ListingResponse,
  ProductMatchGroup,
  ProductResponse,
  SellerResponse,
  ProviderResponse,
} from '@/types';

/** Resolve the product category used for search using stored intelligence fields. */
export function resolveListingSearchCategory(
  listing: ListingResponse,
): ProductCategory | null {
  const intel = resolveStructuredIntelligence(listing);
  if (intel?.product_family) {
    return intel.product_family;
  }

  return (
    (listing.product_family as ProductCategory | null) ??
    (listing.product?.slug ? getCategoryFromProductSlug(listing.product.slug) : null) ??
    classifyListingTitle(listing.title)
  );
}

export function listingMatchesSearchForListing(
  listing: ListingResponse,
  productSlug: string | null | undefined,
  query: string,
): boolean {
  return listingMatchesSearchQuery(
    listing.title,
    productSlug,
    query,
    resolveListingSearchCategory(listing),
  );
}

/** Match a grouped product against a user query using intelligence-backed group fields. */
export function groupedProductMatchesSearchQuery(
  group: ProductMatchGroup,
  query: string,
): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;

  const allowed = resolveSearchCategories(trimmed);
  if (allowed) {
    return allowed.includes(group.product_family as ProductCategory);
  }

  const q = normalizeListingTitle(trimmed);
  const candidates = [
    group.label,
    formatGroupedProductName(group),
    group.product_family.replace(/_/g, ' '),
  ];

  return candidates.some((text) => normalizeListingTitle(text).includes(q));
}

export function searchGroupedProductGroups(
  query: string,
  listings: ListingResponse[],
): ProductMatchGroup[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const eligible = filterMarketplaceListings(listings);
  const marketContext = productMatchingEngine.groupListings(eligible);
  const groups = attachDealScoresToGroups(marketContext, marketContext);

  return groups.filter((group) => groupedProductMatchesSearchQuery(group, trimmed));
}

function scoreText(text: string, query: string): number {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  if (lower === q) return 100;
  if (lower.startsWith(q)) return 80;
  if (lower.includes(q)) return 60;
  const words = q.split(' ').filter(Boolean);
  const matched = words.filter((w) => lower.includes(w)).length;
  if (matched > 0) return Math.round((matched / words.length) * 40);
  return 0;
}

export class SearchEngine {
  search(
    query: string,
    data: {
      listings?: ListingResponse[];
      products?: ProductResponse[];
      sellers?: SellerResponse[];
      providers?: ProviderResponse[];
    },
    ownerRoute: string,
  ): SearchResponse {
    const start = Date.now();
    const q = query.trim();
    if (!q) return { query, results: [], total: 0, duration_ms: 0 };

    const results: SearchResult[] = [];

    for (const p of data.products ?? []) {
      const score = Math.max(scoreText(p.name, q), scoreText(p.brand, q));
      const searchCategories = resolveSearchCategories(q);
      const productCategory = getCategoryFromProductSlug(p.slug);
      if (
        score > 0 &&
        searchCategories &&
        productCategory &&
        !searchCategories.includes(productCategory)
      ) {
        continue;
      }
      if (score > 0) {
        results.push({
          type: 'product',
          id: p.id,
          title: p.name,
          subtitle: p.brand,
          href: `${ownerRoute}/products/${p.slug}`,
          score,
          icon: 'Tag',
        });
      }
    }

    for (const s of data.sellers ?? []) {
      const score = scoreText(s.display_name, q);
      if (score > 0) {
        results.push({
          type: 'seller',
          id: s.id,
          title: s.display_name,
          subtitle: `Seller · ${s.rating}★`,
          href: `${ownerRoute}/listings`,
          score,
          icon: 'User',
        });
      }
    }

    for (const p of data.providers ?? []) {
      const score = Math.max(scoreText(p.name, q), scoreText(p.slug, q));
      if (score > 0) {
        results.push({
          type: 'provider',
          id: p.id,
          title: p.name,
          subtitle: p.website ?? '',
          href: `${ownerRoute}/sources`,
          score,
          icon: 'Zap',
        });
      }
    }

    const seenDistricts = new Set<string>();
    for (const l of data.listings ?? []) {
      const districtScore = scoreText(l.district, q);
      if (districtScore > 0 && !seenDistricts.has(l.district)) {
        seenDistricts.add(l.district);
        results.push({
          type: 'district',
          id: l.district,
          title: l.district,
          subtitle: `${l.city} district`,
          href: `${ownerRoute}/listings`,
          score: districtScore,
          icon: 'MapPin',
        });
      }

      const productSlug = l.product?.slug;
      const searchCategories = resolveSearchCategories(q);
      const titleScore = Math.max(
        scoreText(l.title, q),
        l.description ? scoreText(l.description, q) : 0,
      );
      const familyScore =
        searchCategories &&
        l.product_family &&
        searchCategories.includes(l.product_family as ProductCategory)
          ? 70
          : 0;
      const listingScore = Math.max(titleScore, familyScore);

      if (listingScore > 0 && !listingMatchesSearchForListing(l, productSlug, q)) {
        continue;
      }
      if (listingScore > 0) {
        results.push({
          type: 'listing',
          id: l.id,
          title: l.title,
          subtitle: `${l.district} · ₺${l.price.toLocaleString('tr-TR')}`,
          href: getListingSourceUrl(l),
          score: listingScore,
          icon: 'Search',
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    const top = results.slice(0, 20);

    const activeListings = (data.listings ?? []).filter((l) => l.is_active && !l.deleted_at);

    return {
      query,
      results: top,
      product_groups: searchGroupedProductGroups(q, activeListings),
      total: results.length,
      duration_ms: Date.now() - start,
    };
  }

  groupByType(results: SearchResult[]): Record<SearchEntityType, SearchResult[]> {
    return results.reduce(
      (acc, r) => {
        (acc[r.type] ??= []).push(r);
        return acc;
      },
      {} as Record<SearchEntityType, SearchResult[]>,
    );
  }
}
