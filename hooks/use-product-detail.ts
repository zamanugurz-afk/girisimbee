'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchActiveProducts,
  fetchCategories,
  fetchListings,
  fetchPriceHistoryForListings,
  computeMarketStats,
  computeAIAnalyses,
} from '@/lib/queries';
import type {
  ListingResponse,
  MarketStatisticsResponse,
  ProductDTO,
  CategoryDTO,
  AIAnalysisResponse,
  PriceHistoryDTO,
} from '@/types';

export interface ProductDetailData {
  product: ProductDTO | null;
  category: CategoryDTO | null;
  stats: MarketStatisticsResponse | null;
  relatedListings: Array<{
    listing: ListingResponse;
    analysis: AIAnalysisResponse | undefined;
    discountPct: number;
  }>;
  priceHistory: PriceHistoryDTO[];
  bestDeal: ListingResponse | null;
  avgPrice: number;
  lowestPrice: number;
  highestPrice: number;
  listingCount: number;
  isLoading: boolean;
}

function emptyData(): ProductDetailData {
  return {
    product: null,
    category: null,
    stats: null,
    relatedListings: [],
    priceHistory: [],
    bestDeal: null,
    avgPrice: 0,
    lowestPrice: 0,
    highestPrice: 0,
    listingCount: 0,
    isLoading: false,
  };
}

export function useProductDetail(slugOrId: string | null): ProductDetailData {
  const productsQ = useQuery({ queryKey: ['active-products'], queryFn: fetchActiveProducts });
  const categoriesQ = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const listingsQ = useQuery({ queryKey: ['listings'], queryFn: fetchListings });

  const products = productsQ.data ?? [];
  const categories = categoriesQ.data ?? [];
  const listings = listingsQ.data ?? [];

  // Compute market stats
  const stats = useMemo(
    () => computeMarketStats(listings, products),
    [listings, products],
  );

  // Find the product
  const product = useMemo(
    () => products.find((p) => p.slug === slugOrId || p.id === slugOrId) ?? null,
    [products, slugOrId],
  );

  // Fetch price history for this product's listings
  const productListings = useMemo(
    () => product ? listings.filter((l) => l.product_id === product.id) : [],
    [listings, product],
  );

  const listingIds = useMemo(
    () => productListings.slice(0, 20).map((l) => l.id),
    [productListings],
  );

  const priceHistoryQ = useQuery({
    queryKey: ['price-history-batch', listingIds],
    queryFn: () => fetchPriceHistoryForListings(listingIds),
    enabled: listingIds.length > 0,
  });

  const priceHistoryMap = priceHistoryQ.data ?? {};

  // Compute AI analyses for this product's listings
  const analyses = useMemo(
    () => computeAIAnalyses(productListings, stats, priceHistoryMap),
    [productListings, stats, priceHistoryMap],
  );

  return useMemo(() => {
    if (!slugOrId || !product) {
      return { ...emptyData(), isLoading: productsQ.isLoading };
    }

    const category = categories.find((c) => c.id === product.category_id) ?? null;
    const stat = stats.find((s) => s.product_id === product.id) ?? null;

    const analysisMap = new Map(analyses.map((a) => [a.listing_id, a]));

    const relatedListings = productListings
      .map((l) => {
        const ai = analysisMap.get(l.id);
        const median = stat?.median_price ?? l.price;
        const discountPct = median > 0
          ? Math.round(((median - l.price) / median) * 1000) / 10
          : 0;
        return { listing: l, analysis: ai, discountPct };
      })
      .sort((a, b) => (b.analysis?.opportunity_score ?? 0) - (a.analysis?.opportunity_score ?? 0));

    const prices = productListings.map((l) => l.price);
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, p) => a + p, 0) / prices.length) : stat?.average_price ?? 0;
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : stat?.minimum_price ?? 0;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : stat?.maximum_price ?? 0;

    const bestDeal = productListings.length > 0
      ? [...productListings].sort((a, b) => {
          const sa = analysisMap.get(a.id)?.opportunity_score ?? 0;
          const sb = analysisMap.get(b.id)?.opportunity_score ?? 0;
          return sb - sa;
        })[0]
      : null;

    const bestDealPriceHistory = bestDeal ? (priceHistoryMap[bestDeal.id] ?? []) : [];

    return {
      product,
      category,
      stats: stat,
      relatedListings,
      priceHistory: bestDealPriceHistory,
      bestDeal,
      avgPrice,
      lowestPrice,
      highestPrice,
      listingCount: productListings.length,
      isLoading: false,
    };
  }, [slugOrId, product, categories, stats, listings, analyses, productListings, priceHistoryMap, productsQ.isLoading]);
}
