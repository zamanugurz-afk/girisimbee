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

type BrowseFetchResult = {
  items: ContentItem[];
  total: number;
  hasMore: boolean;
};

const browseCache = new Map<string, BrowseCacheEntry>();
const browseInflight = new Map<string, Promise<BrowseFetchResult>>();
const BROWSE_CACHE_TTL_MS = 300_000;
const BROWSE_FETCH_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function browseCacheKey(params: MarketplaceBrowseParams): string {
  return JSON.stringify(params);
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (error && typeof error === 'object') {
    const maybe = error as { message?: unknown; error?: unknown; details?: unknown };
    if (typeof maybe.message === 'string' && maybe.message.trim()) return maybe.message;
    if (typeof maybe.error === 'string' && maybe.error.trim()) return maybe.error;
    if (typeof maybe.details === 'string' && maybe.details.trim()) return maybe.details;
  }
  return fallback;
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

async function fetchFirstPageDeduped(
  browseService: ReturnType<typeof getClientContainer>['listingBrowseService'],
  params: MarketplaceBrowseParams,
): Promise<BrowseFetchResult> {
  const cached = readBrowseCache(params);
  if (cached) {
    return {
      items: cached.items,
      total: cached.total,
      hasMore: cached.hasMore,
    };
  }

  const key = browseCacheKey(params);
  const inflight = browseInflight.get(key);
  if (inflight) return inflight;

  const promise = withTimeout(
    browseService.browse(params),
    BROWSE_FETCH_TIMEOUT_MS,
    'İlanlar yüklenirken zaman aşımı. Tekrar deneyin.',
  )
    .then((result) => {
      const fetched: BrowseFetchResult = {
        items: result.data,
        total: result.total,
        hasMore: result.hasMore,
      };
      writeBrowseCache(params, fetched);
      return fetched;
    })
    .finally(() => {
      browseInflight.delete(key);
    });

  browseInflight.set(key, promise);
  return promise;
}

function buildInitialFilters(options: UseMarketplaceBrowseOptions): MarketplaceFilterState {
  return {
    query: options.initialQuery,
    categorySlug: options.initialCategorySlug,
    sortBy: options.initialFilters?.sortBy ?? DEFAULT_SORT,
    city: options.initialFilters?.city,
    jobFlow: options.initialFilters?.jobFlow,
    partnershipIntent: options.initialFilters?.partnershipIntent,
    isFeatured: options.initialFilters?.isFeatured,
    activeFeaturedOnly: options.initialFilters?.activeFeaturedOnly,
    isUrgent: options.initialFilters?.isUrgent,
    activeUrgentOnly: options.initialFilters?.activeUrgentOnly,
    publishedAfter: options.initialFilters?.publishedAfter,
    publishedBefore: options.initialFilters?.publishedBefore,
  };
}

function buildParamsFromFilters(filters: MarketplaceFilterState, pageNum: number): MarketplaceBrowseParams {
  return {
    page: pageNum,
    limit: BROWSE_PAGE_SIZE,
    query: filters.query,
    categorySlug: filters.categorySlug,
    city: filters.city,
    jobFlow: filters.jobFlow,
    partnershipIntent: filters.partnershipIntent,
    sortBy: filters.sortBy,
    isFeatured: filters.isFeatured,
    activeFeaturedOnly: filters.activeFeaturedOnly,
    isUrgent: filters.isUrgent,
    activeUrgentOnly: filters.activeUrgentOnly,
    publishedAfter: filters.publishedAfter,
    publishedBefore: filters.publishedBefore,
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
    options.initialFilters?.jobFlow,
    options.initialFilters?.partnershipIntent,
    options.initialFilters?.sortBy,
    options.initialFilters?.isFeatured,
    options.initialFilters?.activeFeaturedOnly,
    options.initialFilters?.isUrgent,
    options.initialFilters?.activeUrgentOnly,
    options.initialFilters?.publishedAfter,
    options.initialFilters?.publishedBefore,
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

  const browseServiceRef = useRef<ReturnType<typeof getClientContainer>['listingBrowseService'] | null>(null);
  const getBrowseService = useCallback(() => {
    if (!browseServiceRef.current) {
      browseServiceRef.current = getClientContainer().listingBrowseService;
    }
    return browseServiceRef.current;
  }, []);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  /** Bumped on every filter-key change so in-flight requests can be ignored. */
  const fetchGenerationRef = useRef(0);

  const filtersKey = useMemo(() => browseCacheKey(buildParamsFromFilters(filters, 1)), [filters]);

  const buildParams = useCallback(
    (pageNum: number): MarketplaceBrowseParams => buildParamsFromFilters(filtersRef.current, pageNum),
    [],
  );

  const currentListKey = useCallback(
    () => browseCacheKey(buildParamsFromFilters(filtersRef.current, 1)),
    [],
  );

  const isStaleGeneration = useCallback((generation: number) => {
    return generation !== fetchGenerationRef.current;
  }, []);

  const resetListState = useCallback(() => {
    setItems([]);
    setPage(1);
    setTotal(0);
    setHasMore(false);
    setError(null);
    setIsLoading(true);
    setIsLoadingMore(false);
  }, []);

  const prepareFirstPageFetch = useCallback(() => {
    setError(null);
    setIsLoadingMore(false);
    setIsLoading(true);
    setItems((prev) => (prev.length > 0 ? [] : prev));
    setTotal((prev) => (prev > 0 ? 0 : prev));
    setHasMore((prev) => (prev ? false : prev));
    setPage((prev) => (prev !== 1 ? 1 : prev));
  }, []);

  const applyCachedFirstPage = useCallback((params: MarketplaceBrowseParams) => {
    const cached = readBrowseCache(params);
    if (!cached) return false;

    setItems(cached.items);
    setTotal(cached.total);
    setHasMore(cached.hasMore);
    setPage(1);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
    return true;
  }, []);

  const loadPage = useCallback(
    async (pageNum: number, append = false, generation?: number) => {
      const params = buildParams(pageNum);
      const listKeyAtStart = browseCacheKey(buildParamsFromFilters(filtersRef.current, 1));

      if (generation !== undefined && isStaleGeneration(generation)) {
        return;
      }

      if (pageNum === 1 && !append) {
        // Skip cache for filter-triggered fetches (generation set) to avoid stale results.
        if (generation === undefined && applyCachedFirstPage(params)) {
          return;
        }
      }

      if (pageNum === 1 && !append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const browseService = getBrowseService();
        const result =
          pageNum === 1 && !append
            ? await fetchFirstPageDeduped(browseService, params).then((fetched) => ({
                data: fetched.items,
                total: fetched.total,
                hasMore: fetched.hasMore,
              }))
            : await withTimeout(
                browseService.browse(params),
                BROWSE_FETCH_TIMEOUT_MS,
                'İlanlar yüklenirken zaman aşımı. Tekrar deneyin.',
              );

        if (generation !== undefined && isStaleGeneration(generation)) {
          return;
        }
        if (append && currentListKey() !== listKeyAtStart) {
          return;
        }

        setItems((prev) => (append ? [...prev, ...result.data] : result.data));
        setTotal(result.total);
        setHasMore(result.hasMore);
        setPage(pageNum);
      } catch (e) {
        if (generation !== undefined && isStaleGeneration(generation)) {
          return;
        }
        if (!append) {
          setItems([]);
          setTotal(0);
          setHasMore(false);
        }
        setError(toErrorMessage(e, 'İlanlar yüklenemedi'));
      } finally {
        if (generation === undefined || !isStaleGeneration(generation)) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [applyCachedFirstPage, getBrowseService, buildParams, currentListKey, isStaleGeneration],
  );

  const loadPageRef = useRef(loadPage);
  loadPageRef.current = loadPage;

  useEffect(() => {
    fetchGenerationRef.current += 1;
    const generation = fetchGenerationRef.current;

    const params = buildParamsFromFilters(filtersRef.current, 1);
    if (applyCachedFirstPage(params)) {
      return;
    }

    prepareFirstPageFetch();

    let cancelled = false;

    const run = () => {
      if (cancelled || isStaleGeneration(generation)) return;
      void loadPageRef.current(1, false, generation);
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
  }, [filtersKey, deferInitialLoad, prepareFirstPageFetch, isStaleGeneration, applyCachedFirstPage]);

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

  const refresh = useCallback(() => {
    const params = buildParamsFromFilters(filtersRef.current, 1);
    browseCache.delete(browseCacheKey(params));
    fetchGenerationRef.current += 1;
    const generation = fetchGenerationRef.current;
    resetListState();
    void loadPage(1, false, generation);
  }, [loadPage, resetListState]);

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
    refresh,
  };
}
