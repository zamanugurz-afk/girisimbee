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

function writeDraft(storageKey: string, values: ListingFormValues): number | null {
  const payload: StoredDraft = {
    ...values,
    savedAt: Date.now(),
  };
  try {
    localStorage.setItem(storageKey, JSON.stringify(payload));
    return payload.savedAt;
  } catch {
    return null;
  }
}

export function useListingFormAutosave({
  storageKey,
  values,
  enabled = true,
  onSaved,
}: UseListingFormAutosaveOptions) {
  const valuesRef = useRef(values);
  const lastWrittenRef = useRef<string | null>(null);

  valuesRef.current = values;

  useEffect(() => {
    if (!enabled || !storageKey) return;

    const interval = setInterval(() => {
      const current = valuesRef.current;
      const serialized = JSON.stringify(current);
      if (serialized === lastWrittenRef.current) return;

      const savedAt = writeDraft(storageKey, current);
      if (savedAt == null) return;
      lastWrittenRef.current = serialized;
      onSaved?.(new Date(savedAt));
    }, AUTOSAVE_INTERVAL_MS);

    const onBeforeUnload = () => {
      const current = valuesRef.current;
      const serialized = JSON.stringify(current);
      if (serialized === lastWrittenRef.current) return;
      const savedAt = writeDraft(storageKey, current);
      if (savedAt != null) lastWrittenRef.current = serialized;
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [enabled, storageKey, onSaved]);

  return {
    clearDraft: () => {
      try {
        localStorage.removeItem(storageKey);
        lastWrittenRef.current = null;
      } catch {
        // ignore
      }
    },
    peekDraftMeta: (): { savedAt: number } | null => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredDraft;
        if (!parsed?.savedAt) return null;
        return { savedAt: parsed.savedAt };
      } catch {
        return null;
      }
    },
    restoreDraft: (): ListingFormValues | null => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredDraft;
        const { savedAt: _savedAt, ...rest } = parsed;
        lastWrittenRef.current = JSON.stringify(rest);
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

export function formatDraftAge(savedAt: number): string {
  const minutes = Math.max(1, Math.round((Date.now() - savedAt) / 60_000));
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} sa önce`;
  const days = Math.round(hours / 24);
  return `${days} gün önce`;
}
