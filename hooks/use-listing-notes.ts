'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '@/lib/services';
import { FAVORITES_QUERY_KEY, useFavorites } from '@/hooks/use-favorites';
import {
  parseFavoriteMetadata,
  serializeFavoriteMetadata,
  type ListingFavoriteMetadata,
  type ListingNote,
} from '@/lib/listing-favorite-metadata';
import type { FavoriteResponse } from '@/types';

export function useListingNotes(listingId: string) {
  const queryClient = useQueryClient();
  const { favorites, isFavorite, toggle } = useFavorites();

  const favorite = useMemo(
    () => favorites.find((f) => f.listing_id === listingId),
    [favorites, listingId],
  );

  const metadata = useMemo(
    () => parseFavoriteMetadata(favorite?.notes),
    [favorite?.notes],
  );

  const saveMutation = useMutation({
    mutationFn: async (next: ListingFavoriteMetadata) => {
      const payload = serializeFavoriteMetadata(next);

      if (favorite) {
        return favoriteService.update(favorite.id, { notes: payload });
      }

      return favoriteService.create({ listing_id: listingId, notes: payload });
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });
      const previous = queryClient.getQueryData<FavoriteResponse[]>(FAVORITES_QUERY_KEY);

      queryClient.setQueryData<FavoriteResponse[]>(FAVORITES_QUERY_KEY, (old = []) => {
        const existing = old.find((f) => f.listing_id === listingId);
        if (existing) {
          return old.map((f) =>
            f.listing_id === listingId
              ? { ...f, notes: serializeFavoriteMetadata(next), updated_at: new Date().toISOString() }
              : f,
          );
        }

        return [
          ...old,
          {
            id: `optimistic-${listingId}`,
            listing_id: listingId,
            notes: serializeFavoriteMetadata(next),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      });

      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  const persist = useCallback(
    (patch: Partial<ListingFavoriteMetadata>) => {
      const next: ListingFavoriteMetadata = {
        ...metadata,
        ...patch,
        version: 1,
      };
      saveMutation.mutate(next);
    },
    [metadata, saveMutation],
  );

  const addNote = useCallback(
    (text: string, color: string) => {
      const note: ListingNote = {
        id: `n${Date.now()}`,
        text,
        pinned: false,
        color,
        createdAt: new Date().toISOString(),
      };
      persist({ notes: [...metadata.notes, note] });
    },
    [metadata.notes, persist],
  );

  const togglePin = useCallback(
    (id: string) => {
      persist({
        notes: metadata.notes.map((note) =>
          note.id === id ? { ...note, pinned: !note.pinned } : note,
        ),
      });
    },
    [metadata.notes, persist],
  );

  const deleteNote = useCallback(
    (id: string) => {
      persist({ notes: metadata.notes.filter((note) => note.id !== id) });
    },
    [metadata.notes, persist],
  );

  const setPurchaseStatus = useCallback(
    (purchaseStatus: string) => {
      persist({ purchaseStatus });
    },
    [persist],
  );

  const setChecklistChecked = useCallback(
    (checklistChecked: number[]) => {
      persist({ checklistChecked });
    },
    [persist],
  );

  return {
    notes: metadata.notes,
    purchaseStatus: metadata.purchaseStatus,
    checklistChecked: new Set(metadata.checklistChecked),
    isFavorite: isFavorite(listingId),
    isSaving: saveMutation.isPending,
    addNote,
    togglePin,
    deleteNote,
    setPurchaseStatus,
    setChecklistChecked,
    toggleFavorite: () => toggle(listingId),
  };
}
