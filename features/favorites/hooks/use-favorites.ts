'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getClientContainer } from '@/lib/persistence/container';
import type { ContentItem } from '@/features/categories/types/category.types';
import { useFavoritesContext } from '@/features/favorites/providers/favorites-provider';
import type { UserId } from '@/lib/domain/ids';
import { BROWSE_PAGE_SIZE, DEFAULT_SORT } from '@/features/listings/config/marketplace.config';
import type { ListingSortBy } from '@/features/listings/types/marketplace.types';
import { useAuth } from '@/features/authentication/hooks/use-auth';

/** Favorites list page hook — uses shared FavoritesProvider for toggle state. */
export function useFavoritesList() {
  const { user } = useAuth();
  const userId = user?.id as UserId | undefined;
  const { isAuthenticated } = useFavoritesContext();

  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listingBrowseServiceRef = useRef<ReturnType<
    typeof getClientContainer
  >['listingBrowseService'] | null>(null);
  const getListingBrowseService = useCallback(() => {
    if (!listingBrowseServiceRef.current) {
      listingBrowseServiceRef.current = getClientContainer().listingBrowseService;
    }
    return listingBrowseServiceRef.current;
  }, []);

  const loadFavorites = useCallback(
    async (pageNum: number, append = false, sortBy: ListingSortBy = DEFAULT_SORT) => {
      if (!userId) return;
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      try {
        const result = await getListingBrowseService().browseFavorites(userId, {
          page: pageNum,
          limit: BROWSE_PAGE_SIZE,
          sortBy,
        });
        setItems((prev) => (append ? [...prev, ...result.data] : result.data));
        setTotal(result.total);
        setHasMore(result.hasMore);
        setPage(pageNum);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Favoriler yüklenemedi');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [userId, getListingBrowseService],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    loadFavorites(page + 1, true);
  }, [hasMore, isLoadingMore, isLoading, page, loadFavorites]);

  useEffect(() => {
    if (isAuthenticated) loadFavorites(1);
  }, [isAuthenticated, loadFavorites]);

  return {
    isAuthenticated,
    items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refresh: () => loadFavorites(1),
  };
}

/** Re-export context hook for favorite buttons. */
export { useFavoritesContext as useFavorites } from '@/features/favorites/providers/favorites-provider';
