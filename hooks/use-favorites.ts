'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '@/lib/services';
import type { FavoriteResponse } from '@/types';

export const FAVORITES_QUERY_KEY = ['favorites'] as const;

async function fetchFavorites(): Promise<FavoriteResponse[]> {
  return favoriteService.getAll();
}

export function useFavorites() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: fetchFavorites,
    staleTime: 30_000,
  });

  const favoriteIds = useMemo(
    () => new Set((query.data ?? []).map((f) => f.listing_id)),
    [query.data],
  );

  const toggleMutation = useMutation({
    mutationFn: (listingId: string) => favoriteService.toggle(listingId),
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });
      const previous = queryClient.getQueryData<FavoriteResponse[]>(FAVORITES_QUERY_KEY);

      queryClient.setQueryData<FavoriteResponse[]>(FAVORITES_QUERY_KEY, (old = []) => {
        const exists = old.some((f) => f.listing_id === listingId);
        if (exists) {
          return old.filter((f) => f.listing_id !== listingId);
        }
        return [
          ...old,
          {
            id: `optimistic-${listingId}`,
            listing_id: listingId,
            notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      });

      return { previous };
    },
    onError: (_error, _listingId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (favoriteId: string) => favoriteService.delete(favoriteId),
    onMutate: async (favoriteId) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });
      const previous = queryClient.getQueryData<FavoriteResponse[]>(FAVORITES_QUERY_KEY);

      queryClient.setQueryData<FavoriteResponse[]>(FAVORITES_QUERY_KEY, (old = []) =>
        old.filter((f) => f.id !== favoriteId),
      );

      return { previous };
    },
    onError: (_error, _favoriteId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  return {
    favorites: query.data ?? [],
    favoriteIds,
    isLoading: query.isLoading,
    isToggling: toggleMutation.isPending,
    isRemoving: removeMutation.isPending,
    isFavorite: (listingId: string) => favoriteIds.has(listingId),
    toggle: (listingId: string) => toggleMutation.mutate(listingId),
    remove: (favoriteId: string) => removeMutation.mutate(favoriteId),
  };
}
