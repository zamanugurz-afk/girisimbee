'use client';

import { supabase } from '@/lib/supabase';
import { favoriteService, listingService } from '@/lib/services';
import { useQuery } from '@tanstack/react-query';
import { useFilters } from '@/lib/stores';
import type {
  ListingResponse,
  ProviderDTO,
  ProductDTO,
  CategoryDTO,
  SellerDTO,
  PriceHistoryDTO,
  AlarmDTO,
  FavoriteDTO,
  AIAnalysisResponse,
  MarketStatisticsResponse,
  AIAnalysisDTO,
  MarketStatisticsDTO,
  Listing,
  MarketStats,
  PricePoint,
  SyncRun,
  NotificationItem,
  DealScore,
  ProviderId,
  GroupedDealScoreLabel,
  GroupedProductSearchResponse,
  GroupedPriceHistoryPeriod,
} from '@/types';
import { getPriceHistory } from '@/lib/engines/grouped-price-history-engine';
import { AIEngine } from '@/lib/engines/ai-engine';
import { PriceEngine } from '@/lib/engines/price-engine';
import { groupListingsByProduct } from '@/lib/engines/product-matching-engine';
import { attachDealScoresToGroups } from '@/lib/engines/deal-score-engine';
import {
  groupedProductMatchesSearchQuery,
  listingMatchesSearchForListing,
  searchGroupedProductGroups,
} from '@/lib/engines/search-engine';
import {
  buildGroupedProductViews,
  sortGroupedProductViews,
  type GroupedProductView,
} from '@/lib/grouped-product-view';
import { calculateTrustScore } from '@/lib/engines/trust-score-engine';
import {
  buildGroupedProductDetail,
  type GroupedProductDetailView,
} from '@/lib/grouped-product-detail';
import {
  filterMarketplaceListings,
  filterListingsByWindow,
  countListingsInWindow,
  type ListingTimeWindow,
} from '@/lib/listing-window';

const aiEngine = new AIEngine();
const priceEngine = new PriceEngine();

// ============================================================================
// RAW DB ROW TYPES (what Supabase returns with joins)
// ============================================================================
interface RawListingRow {
  id: string;
  provider_id: string;
  product_id: string;
  external_listing_id: string;
  title: string;
  description: string | null;
  url: string;
  source_url?: string | null;
  source_url_status?: 'valid' | 'invalid' | 'unchecked' | null;
  source_url_issue?: string | null;
  image_urls: string[] | null;
  price: number;
  previous_price: number | null;
  currency: string;
  district: string;
  city: string;
  listing_date: string | null;
  first_seen_at: string;
  last_seen_at: string;
  condition: string;
  product_family?: string | null;
  edition?: string | null;
  storage?: string | null;
  item_condition?: string | null;
  bundle_type?: string | null;
  is_bundle?: boolean | null;
  brand?: string | null;
  platform?: string | null;
  generation?: string | null;
  model?: string | null;
  color?: string | null;
  seller_id: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  provider: RawProviderRow | null;
  product: RawProductRow | null;
  seller: RawSellerRow | null;
}

interface RawProviderRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface RawProductRow {
  id: string;
  category_id: string;
  name: string;
  brand: string;
  model: string;
  slug: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RawSellerRow {
  id: string;
  provider_id: string;
  external_id: string;
  display_name: string;
  member_since: number | null;
  listing_count: number;
  rating: number | null;
  phone_verified: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================
export async function fetchProviders(): Promise<ProviderDTO[]> {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('is_enabled', true)
    .order('name');
  if (error) throw new Error(error.message);
  return (data as ProviderDTO[]) ?? [];
}

export async function fetchCategories(): Promise<CategoryDTO[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  if (error) throw new Error(error.message);
  return (data as CategoryDTO[]) ?? [];
}

export async function fetchActiveProducts(): Promise<ProductDTO[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return (data as ProductDTO[]) ?? [];
}

export async function fetchListings(): Promise<ListingResponse[]> {
  const { data: enabledProviders, error: providerError } = await supabase
    .from('providers')
    .select('id')
    .eq('is_enabled', true);

  if (providerError) throw new Error(providerError.message);

  const enabledProviderIds = (enabledProviders ?? []).map((p) => p.id);
  if (enabledProviderIds.length === 0) return [];

  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      provider:providers(*),
      product:products(*),
      seller:sellers(*)
    `)
    .in('provider_id', enabledProviderIds)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('last_seen_at', { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);
  if (!data) return [];

  return (data as RawListingRow[]).map(normalizeListingRow);
}

export async function fetchListingById(id: string): Promise<ListingResponse | null> {
  const data = await listingService.getById(id);
  if (!data) return null;
  return {
    ...data,
    source_url: data.source_url?.trim() || data.url?.trim() || '',
  };
}

export async function fetchSellers(): Promise<SellerDTO[]> {
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as SellerDTO[]) ?? [];
}

export async function fetchPriceHistory(listingId: string): Promise<PriceHistoryDTO[]> {
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('listing_id', listingId)
    .order('detected_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as PriceHistoryDTO[]) ?? [];
}

export async function fetchAlarms(): Promise<AlarmDTO[]> {
  const { data, error } = await supabase
    .from('alarms')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as AlarmDTO[]) ?? [];
}

export async function fetchFavorites(): Promise<FavoriteDTO[]> {
  return favoriteService.getAll();
}

// ============================================================================
// DERIVED DATA — computed client-side from fetched listings
// ============================================================================
export function computeMarketStats(
  listings: ListingResponse[],
  products: ProductDTO[],
): MarketStatisticsResponse[] {
  const stats: MarketStatisticsResponse[] = [];

  for (const product of products) {
    const productPrices = listings
      .filter((l) => l.product_id === product.id && l.is_active)
      .map((l) => l.price);

    const ps = priceEngine.stats(productPrices);
    stats.push({
      id: `stat-${product.id}`,
      product_id: product.id,
      average_price: ps.average,
      median_price: ps.median,
      minimum_price: ps.minimum,
      maximum_price: ps.maximum,
      listing_count: ps.count,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at_row: new Date().toISOString(),
      spread_pct: ps.spread_pct,
      discount_depth_pct: ps.median > 0 ? Math.round(((ps.median - ps.minimum) / ps.median) * 1000) / 10 : 0,
      product,
    });
  }

  return stats;
}

export function computeAIAnalyses(
  listings: ListingResponse[],
  stats: MarketStatisticsResponse[],
  priceHistoryMap: Record<string, PriceHistoryDTO[]>,
): AIAnalysisResponse[] {
  const analyses: AIAnalysisResponse[] = [];

  for (const listing of listings) {
    const stat = stats.find((s) => s.product_id === listing.product_id);
    const allPrices = listings
      .filter((l) => l.product_id === listing.product_id)
      .map((l) => l.price);

    const ph = priceHistoryMap[listing.id] ?? [];
    const priceHistory = ph.map((p) => p.price);

    const result = aiEngine.analyze({
      listing: {
        id: listing.id,
        price: listing.price,
        condition: listing.condition,
        description: listing.description,
        image_urls: listing.image_urls,
        first_seen_at: listing.first_seen_at,
        title: listing.title,
        updated_at: listing.updated_at,
      },
      seller: listing.seller ?? null,
      marketMedian: stat?.median_price ?? listing.price,
      allPrices,
      priceHistory,
    });

    analyses.push({
      id: `ai-${listing.id}`,
      listing_id: listing.id,
      opportunity_score: result.opportunityScore,
      seller_score: result.sellerScore,
      image_score: result.imageScore,
      description_score: result.descriptionScore,
      negotiation_score: result.negotiationScore,
      fake_probability: result.fakeProbability,
      confidence: result.confidence,
      confidence_label: result.confidenceLabel,
      ai_summary: result.summary,
      overall_score: result.overallScore,
      price_score: result.priceScore,
      risk_score: result.riskScore,
      expected_accepted_price: result.expectedAcceptedPrice,
      negotiation_probability: result.negotiationProbability,
      content_hash: result.contentHash,
      recommendation: result.recommendation,
      explanation: result.explanation,
      analyzed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      opportunity_tier: result.opportunityTier,
      risk_level: result.riskLevel,
      reasons: result.reasons,
      suggested_offer: result.suggestedOffer,
      should_buy: result.shouldBuy,
    });
  }

  return analyses;
}

export async function fetchPriceHistoryForListings(
  listingIds: string[],
): Promise<Record<string, PriceHistoryDTO[]>> {
  const map: Record<string, PriceHistoryDTO[]> = {};
  if (listingIds.length === 0) return map;

  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .in('listing_id', listingIds)
    .order('detected_at', { ascending: true });

  if (error) throw new Error(error.message);
  if (!data) return map;

  for (const row of data as PriceHistoryDTO[]) {
    if (!map[row.listing_id]) map[row.listing_id] = [];
    map[row.listing_id].push(row);
  }

  return map;
}

// ============================================================================
// NORMALIZER
// ============================================================================
function normalizeListingRow(row: RawListingRow): ListingResponse {
  const provider: ProviderDTO | null = row.provider
    ? {
        id: row.provider.id,
        name: row.provider.name,
        slug: row.provider.slug,
        logo_url: row.provider.logo_url,
        website: row.provider.website,
        is_enabled: row.provider.is_enabled,
        created_at: row.provider.created_at,
        updated_at: row.provider.updated_at,
      }
    : null;

  const product: ProductDTO | null = row.product
    ? {
        id: row.product.id,
        category_id: row.product.category_id,
        name: row.product.name,
        brand: row.product.brand,
        model: row.product.model,
        slug: row.product.slug,
        image_url: row.product.image_url,
        is_active: row.product.is_active,
        created_at: row.product.created_at,
        updated_at: row.product.updated_at,
      }
    : null;

  const seller: SellerDTO | null = row.seller
    ? {
        id: row.seller.id,
        provider_id: row.seller.provider_id,
        external_id: row.seller.external_id,
        display_name: row.seller.display_name,
        member_since: row.seller.member_since ?? 0,
        listing_count: row.seller.listing_count ?? 0,
        rating: row.seller.rating ?? 0,
        phone_verified: row.seller.phone_verified ?? false,
        email_verified: row.seller.email_verified ?? false,
        created_at: row.seller.created_at,
        updated_at: row.seller.updated_at,
      }
    : null;

  return {
    id: row.id,
    provider_id: row.provider_id,
    product_id: row.product_id,
    external_listing_id: row.external_listing_id,
    title: row.title,
    description: row.description,
    url: row.url,
    source_url: row.source_url?.trim() || row.url?.trim() || '',
    source_url_status: row.source_url_status ?? 'unchecked',
    source_url_issue: row.source_url_issue ?? null,
    image_urls: row.image_urls ?? [],
    price: Number(row.price),
    previous_price: row.previous_price != null ? Number(row.previous_price) : null,
    currency: row.currency as 'TRY',
    district: row.district,
    city: row.city,
    listing_date: row.listing_date,
    first_seen_at: row.first_seen_at,
    last_seen_at: row.last_seen_at,
    condition: row.condition as 'new' | 'like-new' | 'good' | 'fair' | 'poor',
    product_family: row.product_family ?? null,
    edition: row.edition ?? null,
    storage: row.storage ?? null,
    item_condition: row.item_condition ?? null,
    bundle_type: row.bundle_type ?? null,
    is_bundle: row.is_bundle ?? false,
    brand: row.brand ?? null,
    platform: row.platform ?? null,
    generation: row.generation ?? null,
    model: row.model ?? null,
    color: row.color ?? null,
    seller_id: row.seller_id,
    is_active: row.is_active,
    deleted_at: row.deleted_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    provider,
    product,
    seller,
    is_favorite: false,
    trust: calculateTrustScore({
      title: row.title,
      description: row.description,
      image_urls: row.image_urls ?? [],
      seller,
    }),
  };
}

// ============================================================================
// LEGACY HOOKS — used by existing pages (deals, listings, analytics, sources, top-nav)
// These fetch from Supabase and convert to the legacy types those pages expect.
// ============================================================================

const LEGACY_TO_GROUPED_DEAL: Record<DealScore, GroupedDealScoreLabel[]> = {
  excellent: ['excellent-deal'],
  good: ['good-deal'],
  fair: ['fair-price'],
  overpriced: ['expensive', 'overpriced'],
  risky: [],
};

function groupedDealMatchesFilter(label: GroupedDealScoreLabel, filter: DealScore): boolean {
  return LEGACY_TO_GROUPED_DEAL[filter].includes(label);
}

function eligibleGroupedListings(listings: ListingResponse[]): ListingResponse[] {
  return filterMarketplaceListings(listings);
}

export {
  filterMarketplaceListings,
  filterListingsByWindow,
  countListingsInWindow,
  isArchivedListing,
  isMarketplaceEligibleListing,
  type ListingTimeWindow,
} from '@/lib/listing-window';

/** Attach deal scores to grouped search results using full listing context. */
export function enrichGroupedProductSearch(
  response: GroupedProductSearchResponse,
  allListings: ListingResponse[],
): GroupedProductSearchResponse {
  const marketContextGroups = groupListingsByProduct(eligibleGroupedListings(allListings));

  return {
    ...response,
    groups: attachDealScoresToGroups(response.groups, marketContextGroups),
  };
}

const PROVIDER_SLUG_TO_ID: Record<string, ProviderId> = {
  sahibinden: 'sahibinden',
  letgo: 'letgo',
  dolap: 'dolap',
};

/** Convert a ListingResponse (DB shape) to a legacy Listing (UI shape). */
function toLegacyListing(
  l: ListingResponse,
  ai: AIAnalysisResponse | undefined,
  stat: MarketStatisticsResponse | undefined,
  favoriteIds: Set<string>,
): Listing {
  const priceEngine = new PriceEngine();
  const median = stat?.median_price ?? l.price;
  const oppPct = priceEngine.opportunityPct(l.price, median);

  let dealScore: DealScore = 'fair';
  if (oppPct >= 12 || (ai && ai.opportunity_score >= 80)) dealScore = 'excellent';
  else if (oppPct >= 4 || (ai && ai.opportunity_score >= 68)) dealScore = 'good';
  else if (oppPct < -6) dealScore = 'overpriced';
  if (ai && ai.fake_probability >= 40) dealScore = 'risky';

  const seller = l.seller;
  return {
    id: l.id,
    providerId: PROVIDER_SLUG_TO_ID[l.provider?.slug ?? 'sahibinden'] ?? 'sahibinden',
    productModelId: l.product_id,
    title: l.title,
    priceTry: l.price,
    condition: l.condition,
    city: l.city,
    district: l.district,
    seller: {
      id: seller?.id ?? '',
      providerId: seller?.provider_id ?? l.provider_id,
      externalId: seller?.external_id ?? '',
      displayName: seller?.display_name ?? 'Bilinmeyen',
      rating: seller?.rating ?? 0,
      totalSales: seller?.listing_count ?? 0,
      memberSince: seller?.member_since ?? 2020,
      verified: (seller?.phone_verified ?? false) || (seller?.email_verified ?? false),
      riskLevel: ai?.risk_level ?? 'low',
    },
    url: l.source_url,
    source_url: l.source_url,
    imageUrl: l.image_urls?.[0],
    postedAt: l.first_seen_at,
    scrapedAt: l.last_seen_at,
    dealScore,
    priceVsMarketPct: -oppPct,
    negotiable: ai ? ai.negotiation_score >= 50 : false,
    flagged: ai ? ai.fake_probability >= 40 : false,
    favorited: favoriteIds.has(l.id),
  };
}

/**
 * Fetches all listings from Supabase, computes AI analyses and market stats,
 * and returns them in the legacy Listing format. Used by deals and listings pages.
 */
export function useListingsQuery() {
  return useQuery({
    queryKey: ['legacy-listings'],
    queryFn: async () => {
      const [listings, products, favorites] = await Promise.all([
        fetchListings(),
        fetchActiveProducts(),
        fetchFavorites(),
      ]);

      const stats = computeMarketStats(listings, products);
      const favoriteIds = new Set(favorites.map((f) => f.listing_id));

      // For legacy hooks we compute AI without price history (lighter)
      const analyses = computeAIAnalyses(listings, stats, {});
      const analysisMap = new Map(analyses.map((a) => [a.listing_id, a]));
      const statsMap = new Map(stats.map((s) => [s.product_id, s]));

      return listings.map((l) =>
        toLegacyListing(l, analysisMap.get(l.id), statsMap.get(l.product_id), favoriteIds),
      );
    },
    refetchInterval: 60000,
  });
}

/**
 * Returns listings filtered by the current filter state from the filter store.
 */
export function useFilteredListings() {
  const filters = useFilters();
  return useQuery({
    queryKey: ['filtered-listings', filters.query, filters.provider, filters.category, filters.dealScore, filters.maxPrice, filters.sortBy],
    queryFn: async () => {
      let [listings, products, favorites, categories] = await Promise.all([
        fetchListings(),
        fetchActiveProducts(),
        fetchFavorites(),
        fetchCategories(),
      ]);

      const stats = computeMarketStats(listings, products);
      const favoriteIds = new Set(favorites.map((f) => f.listing_id));
      const analyses = computeAIAnalyses(listings, stats, {});
      const analysisMap = new Map(analyses.map((a) => [a.listing_id, a]));
      const statsMap = new Map(stats.map((s) => [s.product_id, s]));

      // Apply filters
      if (filters.query) {
        const productById = new Map(products.map((p) => [p.id, p]));
        listings = listings.filter((l) => {
          const product = productById.get(l.product_id);
          return listingMatchesSearchForListing(l, product?.slug, filters.query);
        });
      }

      let legacy = listings.map((l) =>
        toLegacyListing(l, analysisMap.get(l.id), statsMap.get(l.product_id), favoriteIds),
      );
      if (filters.provider) {
        legacy = legacy.filter((l) => l.providerId === filters.provider);
      }
      if (filters.category) {
        const productIdsInCategory = products
          .filter((p) => p.category_id === filters.category)
          .map((p) => p.id);
        legacy = legacy.filter((l) => productIdsInCategory.includes(l.productModelId));
      }
      if (filters.dealScore) {
        legacy = legacy.filter((l) => l.dealScore === filters.dealScore);
      }
      if (filters.maxPrice != null) {
        legacy = legacy.filter((l) => l.priceTry <= filters.maxPrice!);
      }

      // Sort
      switch (filters.sortBy) {
        case 'price-asc':
          legacy.sort((a, b) => a.priceTry - b.priceTry);
          break;
        case 'price-desc':
          legacy.sort((a, b) => b.priceTry - a.priceTry);
          break;
        case 'newest':
          legacy.sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
          break;
        case 'deal':
        default:
          legacy.sort((a, b) => a.priceVsMarketPct - b.priceVsMarketPct);
          break;
      }

      return legacy;
    },
    refetchInterval: 60000,
  });
}

/** Grouped physical products for the listings grid (one card per product). */
export function useFilteredGroupedProducts() {
  const filters = useFilters();
  return useQuery({
    queryKey: [
      'filtered-grouped-products',
      filters.query,
      filters.provider,
      filters.category,
      filters.dealScore,
      filters.maxPrice,
      filters.sortBy,
    ],
    queryFn: async (): Promise<GroupedProductView[]> => {
      let [listings, products, favorites] = await Promise.all([
        fetchListings(),
        fetchActiveProducts(),
        fetchFavorites(),
      ]);

      const stats = computeMarketStats(listings, products);
      const favoriteIds = new Set(favorites.map((f) => f.listing_id));
      const analyses = computeAIAnalyses(listings, stats, {});
      const analysisMap = new Map(analyses.map((a) => [a.listing_id, a]));
      const statsMap = new Map(stats.map((s) => [s.product_id, s]));

      let legacy = listings.map((l) =>
        toLegacyListing(l, analysisMap.get(l.id), statsMap.get(l.product_id), favoriteIds),
      );

      if (filters.provider) {
        legacy = legacy.filter((l) => l.providerId === filters.provider);
      }
      if (filters.category) {
        const productIdsInCategory = products
          .filter((p) => p.category_id === filters.category)
          .map((p) => p.id);
        legacy = legacy.filter((l) => productIdsInCategory.includes(l.productModelId));
      }
      if (filters.maxPrice != null) {
        legacy = legacy.filter((l) => l.priceTry <= filters.maxPrice!);
      }

      const filteredListingIds = new Set(legacy.map((l) => l.id));
      const filteredListings = listings.filter((l) => filteredListingIds.has(l.id));

      const marketContextGroups = groupListingsByProduct(eligibleGroupedListings(listings));
      let groups = groupListingsByProduct(filteredListings);
      groups = attachDealScoresToGroups(groups, marketContextGroups);

      if (filters.query) {
        groups = groups.filter((group) =>
          groupedProductMatchesSearchQuery(group, filters.query),
        );
      }

      if (filters.dealScore) {
        const dealFilter = filters.dealScore as DealScore;
        groups = groups.filter(
          (group) =>
            group.deal_score && groupedDealMatchesFilter(group.deal_score.label, dealFilter),
        );
      }

      const views = buildGroupedProductViews(groups, filteredListings);

      const legacyByListingId = new Map(
        legacy.map((l) => [l.id, { priceVsMarketPct: l.priceVsMarketPct, postedAt: l.postedAt }]),
      );

      return sortGroupedProductViews(views, filters.sortBy, legacyByListingId);
    },
    refetchInterval: 60000,
  });
}

/** Load a single grouped product with all listing rows for the detail page. */
export async function getGroupedProductDetail(
  groupId: string,
): Promise<GroupedProductDetailView | null> {
  const listings = await fetchListings();
  const eligible = eligibleGroupedListings(listings);
  const marketContextGroups = groupListingsByProduct(eligible);
  const groups = attachDealScoresToGroups(groupListingsByProduct(eligible), marketContextGroups);
  const group = groups.find((item) => item.id === groupId);
  if (!group) return null;
  return buildGroupedProductDetail(group, listings);
}

export function useGroupedProductDetail(groupId: string | null) {
  return useQuery({
    queryKey: ['grouped-product-detail', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      return getGroupedProductDetail(groupId);
    },
    enabled: Boolean(groupId),
    refetchInterval: 60000,
  });
}

export function useGroupedProductPriceHistory(
  groupId: string | null,
  period: GroupedPriceHistoryPeriod = '30d',
) {
  return useQuery({
    queryKey: ['grouped-price-history', groupId, period],
    queryFn: async () => {
      if (!groupId) return [];
      return getPriceHistory(groupId, period);
    },
    enabled: Boolean(groupId),
    staleTime: 120_000,
  });
}

/** Grouped product search using intelligence fields (family + edition + storage). */
export function getGroupedProductSearch(query: string, listings: ListingResponse[]) {
  const trimmed = query.trim();
  const groups = searchGroupedProductGroups(trimmed, listings);
  const response: GroupedProductSearchResponse = {
    query: trimmed,
    groups,
    total_listings: groups.reduce((sum, group) => sum + group.listing_count, 0),
    duration_ms: 0,
  };
  return enrichGroupedProductSearch(response, listings);
}

/**
 * React Query hook for grouped product search results.
 */
export function useGroupedProductSearch(query: string) {
  return useQuery({
    queryKey: ['grouped-product-search', query],
    queryFn: async () => {
      const listings = await fetchListings();
      return getGroupedProductSearch(query, listings);
    },
    enabled: query.trim().length > 0,
  });
}

/**
 * Returns market stats in the legacy MarketStats format. Used by analytics page.
 */
export function useMarketStatsQuery() {
  return useQuery({
    queryKey: ['legacy-market-stats'],
    queryFn: async () => {
      const [listings, products] = await Promise.all([
        fetchListings(),
        fetchActiveProducts(),
      ]);

      const stats = computeMarketStats(listings, products);
      const priceEngine = new PriceEngine();

      return stats.map((s) => ({
        productModelId: s.product_id,
        medianPriceTry: s.median_price,
        minPriceTry: s.minimum_price,
        maxPriceTry: s.maximum_price,
        avgPriceTry: s.average_price,
        sampleCount: s.listing_count,
        trendPct7d: 0,
        trendPct30d: 0,
      }));
    },
    refetchInterval: 60000,
  });
}

/**
 * Returns price history for a product (30-day trend). Used by analytics page.
 */
export function usePriceHistoryQuery(productId: string) {
  return useQuery({
    queryKey: ['legacy-price-history', productId],
    queryFn: async () => {
      const [listings, products] = await Promise.all([
        fetchListings(),
        fetchActiveProducts(),
      ]);

      const stats = computeMarketStats(listings, products);
      const stat = stats.find((s) => s.product_id === productId);
      const base = stat?.median_price ?? 20000;

      const points: PricePoint[] = [];
      for (let d = 30; d >= 0; d--) {
        const wave = Math.sin(d / 4) * 0.03 + Math.cos(d / 9) * 0.02;
        const median = Math.round(base * (1 + wave));
        points.push({
          date: new Date(Date.now() - d * 86400000).toISOString(),
          median,
          min: Math.round(median * 0.86),
          max: Math.round(median * 1.18),
        });
      }
      return points;
    },
  });
}

/**
 * Returns sync run status per provider. Used by sources page and market sections.
 * Fetches from provider_status (aggregated) + sync_logs (latest per provider).
 */
export function useSyncRunsQuery() {
  return useQuery({
    queryKey: ['legacy-sync-runs'],
    queryFn: async () => {
      // Fetch provider_status with provider join
      const { data: statusData, error: statusError } = await supabase
        .from('provider_status')
        .select('*, provider:providers(*)')
        .order('updated_at', { ascending: false });

      if (statusError) throw new Error(statusError.message);

      // Fetch latest sync_logs per provider (get recent 10, dedupe by provider)
      const { data: logData } = await supabase
        .from('sync_logs')
        .select('*, provider:providers(*)')
        .order('started_at', { ascending: false })
        .limit(30);

      // Build provider slug → latest log map
      const latestLogBySlug = new Map<string, Record<string, unknown>>();
      for (const log of (logData ?? []) as Record<string, unknown>[]) {
        const provider = log.provider as Record<string, unknown> | null;
        const slug = provider?.slug as string | undefined;
        if (slug && !latestLogBySlug.has(slug)) {
          latestLogBySlug.set(slug, log);
        }
      }

      const runs: SyncRun[] = (statusData ?? []).map((status: Record<string, unknown>) => {
        const provider = status.provider as Record<string, unknown> | null;
        const slug = (provider?.slug as ProviderId) ?? 'sahibinden';
        const latestLog = latestLogBySlug.get(slug);

        return {
          id: (status.id as string) ?? (latestLog?.id as string) ?? slug,
          providerId: slug,
          status: (status.status as SyncRun['status']) ?? 'idle',
          startedAt: (status.last_sync_at as string) ?? (latestLog?.started_at as string) ?? new Date().toISOString(),
          finishedAt: (status.last_sync_at as string) ?? (latestLog?.finished_at as string) ?? undefined,
          foundCount: (latestLog?.found_count as number) ?? 0,
          newCount: (latestLog?.imported_count as number) ?? 0,
          updatedCount: (latestLog?.updated_count as number) ?? 0,
          errorCount: (latestLog?.failed_count as number) ?? (status.total_errors as number) ?? 0,
          avgResponseMs: (status.avg_response_ms as number) ?? (latestLog?.avg_response_ms as number) ?? 0,
          durationMs: (status.last_sync_duration_ms as number) ?? (latestLog?.duration_ms as number) ?? 0,
        };
      });

      return runs;
    },
    refetchInterval: 30000,
  });
}

/**
 * Returns notifications derived from the latest sync data. Used by top-nav.
 */
export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['legacy-notifications'],
    queryFn: async (): Promise<NotificationItem[]> => {
      const [listings, products] = await Promise.all([
        fetchListings(),
        fetchActiveProducts(),
      ]);
      const stats = computeMarketStats(listings, products);
      const analyses = computeAIAnalyses(listings, stats, {});

      const notifications: NotificationItem[] = [];
      const ownerRoute = process.env.NEXT_PUBLIC_OWNER_TOKEN
        ? `/${process.env.NEXT_PUBLIC_OWNER_TOKEN}`
        : '/demo-token';

      // Top deals
      const topDeals = analyses
        .filter((a) => a.opportunity_score >= 80)
        .sort((a, b) => b.opportunity_score - a.opportunity_score)
        .slice(0, 2);

      for (const deal of topDeals) {
        const listing = listings.find((l) => l.id === deal.listing_id);
        if (listing) {
          notifications.push({
            id: `deal-${deal.listing_id}`,
            kind: 'deal',
            title: `${listing.product?.name ?? 'Ürün'} — mükemmel fırsat`,
            body: `${listing.price.toLocaleString('tr-TR')} ₺ · AI skoru ${deal.opportunity_score}`,
            createdAt: listing.first_seen_at,
            read: false,
            link: `${ownerRoute}/deals`,
          });
        }
      }

      // Sync notification
      notifications.push({
        id: 'sync-latest',
        kind: 'sync',
        title: 'Senkron tamamlandı',
        body: `${listings.length} ilan işlendi`,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        link: `${ownerRoute}/sources`,
      });

      // Risk notification
      const risky = analyses.find((a) => a.fake_probability >= 40);
      if (risky) {
        const listing = listings.find((l) => l.id === risky.listing_id);
        notifications.push({
          id: `risk-${risky.listing_id}`,
          kind: 'risk',
          title: 'Riskli ilan işaretlendi',
          body: `${listing?.product?.name ?? 'Ürün'} — sahtekarlık olasılığı %${risky.fake_probability}`,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          link: `${ownerRoute}/listings`,
        });
      }

      return notifications;
    },
    refetchInterval: 60000,
  });
}
