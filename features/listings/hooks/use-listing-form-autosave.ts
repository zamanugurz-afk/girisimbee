'use client';

import { useEffect, useRef } from 'react';
import type { ListingFormValues } from '@/features/listings/form/category-listing-form';

const AUTOSAVE_INTERVAL_MS = 30_000;

interface UseListingFormAutosaveOptions {
  storageKey: string;
  values: ListingFormValues;
  enabled?: boolean;
  onSaved?: (savedAt: Date) => void;
}

interface StoredDraft extends ListingFormValues {
  savedAt: number;
}

export function useListingFormAutosave({
  storageKey,
  values,
  enabled = true,
  onSaved,
}: UseListingFormAutosaveOptions) {
  const valuesRef = useRef(values);
  const initialSerialized = useRef<string | null>(null);

  valuesRef.current = values;

  useEffect(() => {
    if (!enabled || !storageKey) return;

    const serialized = JSON.stringify(values);
    if (initialSerialized.current === null) {
      initialSerialized.current = serialized;
    }

    const interval = setInterval(() => {
      const current = valuesRef.current;
      const payload: StoredDraft = {
        ...current,
        savedAt: Date.now(),
      };

      try {
        localStorage.setItem(storageKey, JSON.stringify(payload));
        onSaved?.(new Date(payload.savedAt));
      } catch {
        // Ignore quota or private mode errors silently.
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, storageKey, onSaved]);

  return {
    clearDraft: () => {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    },
    restoreDraft: (): ListingFormValues | null => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredDraft;
        const { savedAt: _savedAt, ...rest } = parsed;
        return rest;
      } catch {
        return null;
      }
    },
  };
}

export function buildListingDraftStorageKey(
  categoryId: string,
  listingTypeId: string,
  listingId?: string,
): string {
  if (listingId) return `Girisimbee-listing-draft:edit:${listingId}`;
  return `Girisimbee-listing-draft:create:${categoryId}:${listingTypeId}`;
}
