'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchEngine } from '@/lib/engines/search-engine';
import { useSearchStore } from '@/lib/stores/data-stores';
import {
  fetchListings,
  fetchActiveProducts,
  fetchSellers,
  fetchProviders,
} from '@/lib/queries';
import { OWNER_ROUTE } from '@/config/site';
import type { SearchEntityType, SearchResult } from '@/types';

const searchEngine = new SearchEngine();

export const SEARCH_GROUP_LABELS: Record<SearchEntityType, string> = {
  listing: 'İlanlar',
  product: 'Ürünler',
  seller: 'Satıcılar',
  district: 'İlçeler',
  provider: 'Kaynaklar',
};

export const SEARCH_GROUP_ORDER: SearchEntityType[] = [
  'listing',
  'product',
  'seller',
  'district',
  'provider',
];

export function useSearch() {
  const { query, setQuery, setResults, setLoading } = useSearchStore();

  const listingsQ = useQuery({ queryKey: ['listings'], queryFn: fetchListings });
  const productsQ = useQuery({ queryKey: ['active-products'], queryFn: fetchActiveProducts });
  const sellersQ = useQuery({ queryKey: ['sellers'], queryFn: fetchSellers });
  const providersQ = useQuery({ queryKey: ['providers'], queryFn: fetchProviders });

  const dataReady =
    listingsQ.isSuccess &&
    productsQ.isSuccess &&
    sellersQ.isSuccess &&
    providersQ.isSuccess;

  const isLoading =
    listingsQ.isLoading ||
    productsQ.isLoading ||
    sellersQ.isLoading ||
    providersQ.isLoading;

  const searchResponse = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed || !dataReady) return null;

    return searchEngine.search(
      trimmed,
      {
        listings: listingsQ.data ?? [],
        products: productsQ.data ?? [],
        sellers: sellersQ.data ?? [],
        providers: providersQ.data ?? [],
      },
      OWNER_ROUTE,
    );
  }, [query, dataReady, listingsQ.data, productsQ.data, sellersQ.data, providersQ.data]);

  const grouped = useMemo(() => {
    if (!searchResponse) {
      return {} as Record<SearchEntityType, SearchResult[]>;
    }
    return searchEngine.groupByType(searchResponse.results);
  }, [searchResponse]);

  useEffect(() => {
    setResults(searchResponse);
    setLoading(isLoading && query.trim().length > 0);
  }, [searchResponse, isLoading, query, setResults, setLoading]);

  const reset = useCallback(() => {
    setQuery('');
    setResults(null);
    setLoading(false);
  }, [setQuery, setResults, setLoading]);

  return {
    query,
    setQuery,
    results: searchResponse,
    grouped,
    listings: listingsQ.data ?? [],
    isLoading,
    isSearching: query.trim().length > 0,
    reset,
  };
}
