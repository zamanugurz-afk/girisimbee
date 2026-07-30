'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getClientContainer } from '@/lib/persistence/container';
import type { ContentItem } from '@/features/categories/types/category.types';
import type { MarketplaceBrowseParams, MarketplaceFilterState } from '@/features/listings/types/marketplace.types';
import { DEFAULT_SORT, BROWSE_PAGE_SIZE } from '@/features/listings/config/marketplace.config';

interface UseMarketplaceBrowseOptions {
  initialCategorySlug?: string;
  initialQuery?: string;
  initialFilters?: Partial<MarketplaceFilterState>;
  /** Defer first fetch until browser idle — avoids competing with route transitions. */
  deferInitialLoad?: boolean;
}

type BrowseCacheEntry = {
  items: ContentItem[];
  total: number;
  hasMore: boolean;
  fetchedAt: number;
};

const browseCache = new Map<string, BrowseCacheEntry>();
const BROWSE_CACHE_TTL_MS = 30_000;
/** Tracks last successfully loaded filter key across hook instances (remounts). */
let lastLoadedFiltersKey: string | null = null;

function browseCacheKey(params: MarketplaceBrowseParams): string {
  return JSON.stringify(params);
}

function readBrowseCache(params: MarketplaceBrowseParams): BrowseCacheEntry | null {
  const key = browseCacheKey(params);
  const hit = browseCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.fetchedAt > BROWSE_CACHE_TTL_MS) {
    browseCache.delete(key);
    return null;
  }
  return hit;
}

function writeBrowseCache(params: MarketplaceBrowseParams, entry: Omit<BrowseCacheEntry, 'fetchedAt'>) {
  browseCache.set(browseCacheKey(params), { ...entry, fetchedAt: Date.now() });
}

function buildInitialFilters(options: UseMarketplaceBrowseOptions): MarketplaceFilterState {
  return {
    query: options.initialQuery,
    categorySlug: options.initialCategorySlug,
    sortBy: options.initialFilters?.sortBy ?? DEFAULT_SORT,
    city: options.initialFilters?.city,
    remotePolicy: options.initialFilters?.remotePolicy,
    isVerified: options.initialFilters?.isVerified,
  };
}

function buildParamsFromFilters(filters: MarketplaceFilterState, pageNum: number): MarketplaceBrowseParams {
  return {
    page: pageNum,
    limit: BROWSE_PAGE_SIZE,
    query: filters.query,
    categorySlug: filters.categorySlug,
    city: filters.city,
    remotePolicy: filters.remotePolicy,
    isVerified: filters.isVerified,
    sortBy: filters.sortBy,
  };
}

function initialBrowseSnapshot(filters: MarketplaceFilterState) {
  const cached = readBrowseCache(buildParamsFromFilters(filters, 1));
  return {
    items: cached?.items ?? [],
    total: cached?.total ?? 0,
    hasMore: cached?.hasMore ?? false,
    isLoading: !cached,
  };
}

export function useMarketplaceBrowse(options: UseMarketplaceBrowseOptions = {}) {
  const { deferInitialLoad = false } = options;

  const initialFilters = useMemo(() => buildInitialFilters(options), [
    options.initialCategorySlug,
    options.initialFilters?.city,
    options.initialFilters?.isVerified,
    options.initialFilters?.remotePolicy,
    options.initialFilters?.sortBy,
    options.initialQuery,
  ]);

  const initialSnapshot = useMemo(() => initialBrowseSnapshot(initialFilters), [initialFilters]);

  const [filters, setFilters] = useState<MarketplaceFilterState>(initialFilters);
  const [items, setItems] = useState<ContentItem[]>(initialSnapshot.items);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialSnapshot.total);
  const [hasMore, setHasMore] = useState(initialSnapshot.hasMore);
  const [isLoading, setIsLoading] = useState(initialSnapshot.isLoading);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const browseService = useMemo(() => getClientContainer().listingBrowseService, []);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const filtersKey = useMemo(() => browseCacheKey(buildParamsFromFilters(filters, 1)), [filters]);

  const buildParams = useCallback(
    (pageNum: number): MarketplaceBrowseParams => buildParamsFromFilters(filtersRef.current, pageNum),
    [],
  );

  const applyCachedPage = useCallback((params: MarketplaceBrowseParams) => {
    const cached = readBrowseCache(params);
    if (!cached) return false;

    setItems(cached.items);
    setTotal(cached.total);
    setHasMore(cached.hasMore);
    setPage(1);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
    lastLoadedFiltersKey = browseCacheKey(params);
    return true;
  }, []);

  const loadPage = useCallback(
    async (pageNum: number, append = false) => {
      const params = buildParams(pageNum);

      if (pageNum === 1 && !append && applyCachedPage(params)) {
        return;
      }

      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      try {
        const result = await browseService.browse(params);
        setItems((prev) => (append ? [...prev, ...result.data] : result.data));
        setTotal(result.total);
        setHasMore(result.hasMore);
        setPage(pageNum);

        if (pageNum === 1 && !append) {
          writeBrowseCache(params, {
            items: result.data,
            total: result.total,
            hasMore: result.hasMore,
          });
          lastLoadedFiltersKey = browseCacheKey(params);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'İlanlar yüklenemedi');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [applyCachedPage, browseService, buildParams],
  );

  const loadPageRef = useRef(loadPage);
  loadPageRef.current = loadPage;

  useEffect(() => {
    const params = buildParamsFromFilters(filters, 1);
    const key = browseCacheKey(params);

    if (key === lastLoadedFiltersKey && applyCachedPage(params)) {
      return;
    }

    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      setPage(1);
      void loadPageRef.current(1, false);
    };

    if (deferInitialLoad) {
      if (typeof window.requestIdleCallback === 'function') {
        const idleId = window.requestIdleCallback(run, { timeout: 500 });
        return () => {
          cancelled = true;
          window.cancelIdleCallback(idleId);
        };
      }

      const timeoutId = window.setTimeout(run, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(timeoutId);
      };
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [filtersKey, deferInitialLoad, applyCachedPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    loadPage(page + 1, true);
  }, [hasMore, isLoadingMore, isLoading, page, loadPage]);

  const updateFilters = useCallback((patch: Partial<MarketplaceFilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      if (browseCacheKey(buildParamsFromFilters(prev, 1)) === browseCacheKey(buildParamsFromFilters(next, 1))) {
        return prev;
      }
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters((prev) => {
      const next: MarketplaceFilterState = {
        query: options.initialQuery,
        categorySlug: options.initialCategorySlug,
        sortBy: DEFAULT_SORT,
      };
      if (browseCacheKey(buildParamsFromFilters(prev, 1)) === browseCacheKey(buildParamsFromFilters(next, 1))) {
        return prev;
      }
      return next;
    });
  }, [options.initialCategorySlug, options.initialQuery]);

  return {
    items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    filters,
    updateFilters,
    resetFilters,
    loadMore,
    refresh: () => loadPage(1, false),
  };
}
