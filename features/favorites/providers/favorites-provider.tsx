'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getClientContainer } from '@/lib/persistence/container';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import type { ListingId, UserId } from '@/lib/domain/ids';

interface FavoritesContextValue {
  isAuthenticated: boolean;
  isFavorited: (listingId: ListingId) => boolean;
  toggleFavorite: (listingId: ListingId) => Promise<boolean>;
  refreshFavoriteIds: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id as UserId | undefined;
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const { favoriteService, listingBrowseService } = useMemo(
    () => getClientContainer(),
    [],
  );

  const refreshFavoriteIds = useCallback(async () => {
    if (!userId) {
      setFavoriteIds(new Set());
      return;
    }
    try {
      const ids = await listingBrowseService.getListingIdsForFavorites(userId);
      setFavoriteIds(new Set([...ids]));
    } catch {
      setFavoriteIds(new Set());
    }
  }, [userId, listingBrowseService]);

  useEffect(() => {
    if (!userId) {
      setFavoriteIds(new Set());
      return;
    }

    let cancelled = false;
    const run = () => {
      if (!cancelled) void refreshFavoriteIds();
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(run, { timeout: 1500 });
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
  }, [userId, refreshFavoriteIds]);

  const isFavorited = useCallback(
    (listingId: ListingId) => favoriteIds.has(listingId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (listingId: ListingId) => {
      if (!userId) return false;

      const isFav = favoriteIds.has(listingId);
      if (isFav) {
        await favoriteService.remove(userId, listingId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      } else {
        await favoriteService.add({ userId, listingId });
        setFavoriteIds((prev) => new Set(prev).add(listingId));
      }
      return !isFav;
    },
    [userId, favoriteIds, favoriteService],
  );

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(userId),
      isFavorited,
      toggleFavorite,
      refreshFavoriteIds,
    }),
    [userId, isFavorited, toggleFavorite, refreshFavoriteIds],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavoritesContext(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavoritesContext must be used within FavoritesProvider');
  }
  return ctx;
}
