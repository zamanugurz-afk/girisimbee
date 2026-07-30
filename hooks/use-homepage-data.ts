'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchListings,
  fetchProviders,
  countListingsInWindow,
  filterListingsByWindow,
  filterMarketplaceListings,
} from '@/lib/queries';
import { groupListingsByProduct } from '@/lib/engines/product-matching-engine';
import { attachDealScoresToGroups } from '@/lib/engines/deal-score-engine';
import { buildGroupedProductViews, type GroupedProductView } from '@/lib/grouped-product-view';
import { useHomeFilters, type HomeFiltersState } from '@/lib/stores/home-filters';
import type { ListingResponse } from '@/types';

export interface HomepageSummary {
  todayListings: number;
  last3DaysListings: number;
  last30DaysListings: number;
  averageMarketDiscount: number;
}

function applyHomeFilters(
  listings: ListingResponse[],
  filters: HomeFiltersState,
): ListingResponse[] {
  return listings.filter((listing) => {
    if (filters.source && listing.provider?.slug !== filters.source) return false;
    if (filters.platform && listing.platform !== filters.platform) return false;
    if (filters.brand && listing.brand !== filters.brand) return false;
    if (filters.product && listing.product_family !== filters.product) return false;
    if (filters.model && listing.model !== filters.model) return false;
    if (filters.city && listing.city !== filters.city) return false;
    if (filters.district && listing.district !== filters.district) return false;
    if (filters.condition) {
      const condition = listing.item_condition ?? listing.condition;
      if (condition !== filters.condition) return false;
    }
    if (filters.minPrice != null && listing.price < filters.minPrice) return false;
    if (filters.maxPrice != null && listing.price > filters.maxPrice) return false;
    return true;
  });
}

function averageMarketDiscount(groups: GroupedProductView[]): number {
  const discounts = groups
    .map((group) => group.dealScore?.deal_percentage)
    .filter((value): value is number => value != null && value < 0)
    .map((value) => Math.abs(value));

  if (discounts.length === 0) return 0;
  return Math.round((discounts.reduce((sum, value) => sum + value, 0) / discounts.length) * 10) / 10;
}

function buildGroupedViews(
  allListings: ListingResponse[],
  scopedListings?: ListingResponse[],
): GroupedProductView[] {
  const eligible = filterMarketplaceListings(allListings);
  const marketContextGroups = groupListingsByProduct(eligible);
  const target = scopedListings ? filterMarketplaceListings(scopedListings) : eligible;
  let groups = groupListingsByProduct(target);
  groups = attachDealScoresToGroups(groups, marketContextGroups);
  return buildGroupedProductViews(groups, allListings);
}

export function useHomepageData() {
  const filters = useHomeFilters();

  const query = useQuery({
    queryKey: [
      'homepage-marketplace',
      filters.platform,
      filters.brand,
      filters.product,
      filters.model,
      filters.city,
      filters.district,
      filters.source,
      filters.minPrice,
      filters.maxPrice,
      filters.condition,
    ],
    queryFn: async () => {
      const [listings, providers] = await Promise.all([fetchListings(), fetchProviders()]);
      const active = filterMarketplaceListings(listings);
      const filtered = applyHomeFilters(active, filters);

      const summary: HomepageSummary = {
        todayListings: countListingsInWindow(filtered, 'today'),
        last3DaysListings: countListingsInWindow(filtered, 'last3Days'),
        last30DaysListings: filtered.length,
        averageMarketDiscount: averageMarketDiscount(buildGroupedViews(filtered)),
      };

      const todayListings = filterListingsByWindow(filtered, 'today');
      const bestDeals = [...buildGroupedViews(filtered, todayListings.length > 0 ? todayListings : filtered)]
        .sort((a, b) => {
          const aDeal = a.dealScore?.deal_percentage ?? 0;
          const bDeal = b.dealScore?.deal_percentage ?? 0;
          if (aDeal !== bDeal) return aDeal - bDeal;
          return a.lowestPrice - b.lowestPrice;
        })
        .slice(0, 25);

      const filterOptions = {
        platforms: [...new Set(active.map((l) => l.platform).filter(Boolean))] as string[],
        brands: [...new Set(active.map((l) => l.brand).filter(Boolean))] as string[],
        products: [...new Set(active.map((l) => l.product_family).filter(Boolean))] as string[],
        models: [...new Set(active.map((l) => l.model).filter(Boolean))] as string[],
        cities: [...new Set(active.map((l) => l.city).filter(Boolean))].sort(),
        districts: [...new Set(active.map((l) => l.district).filter(Boolean))].sort(),
        sources: providers.map((p) => ({ slug: p.slug, name: p.name })),
        conditions: [...new Set(
          active.map((l) => l.item_condition ?? l.condition).filter(Boolean),
        )] as string[],
      };

      return { summary, bestDeals, filterOptions, providers };
    },
    staleTime: 60_000,
  });

  return useMemo(
    () => ({
      summary: query.data?.summary,
      bestDeals: query.data?.bestDeals ?? [],
      filterOptions: query.data?.filterOptions,
      providers: query.data?.providers ?? [],
      isLoading: query.isLoading,
      isError: query.isError,
      refetch: query.refetch,
    }),
    [query.data, query.isError, query.isLoading, query.refetch],
  );
}
