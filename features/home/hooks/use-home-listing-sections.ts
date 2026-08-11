'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  HOME_LISTING_SECTIONS,
  type HomeListingSectionId,
} from '@/features/home/config/home-sections.config';
import type {
  HomeListingSectionState,
  HomeListingSectionsResult,
} from '@/features/home/types/home-section.types';
import type { ContentItem } from '@/features/categories/types/category.types';

function emptySection(id: HomeListingSectionId): HomeListingSectionState {
  return { id, items: [], total: 0, isLoading: true, error: null };
}

type ApiSection = {
  id: HomeListingSectionId;
  items: ContentItem[];
  total: number;
  error: string | null;
};

/**
 * Homepage listing sections — fetched from a single server API.
 * Avoids spinning up the full client persistence graph on first paint.
 */
export function useHomeListingSections(): HomeListingSectionsResult {
  const [sections, setSections] = useState<HomeListingSectionState[]>(() =>
    HOME_LISTING_SECTIONS.map((section) => emptySection(section.id)),
  );
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);

    async function load() {
      setSections(HOME_LISTING_SECTIONS.map((section) => emptySection(section.id)));

      try {
        const res = await fetch('/api/marketplace/home-sections', {
          method: 'GET',
          signal: controller.signal,
        });
        const body = (await res.json()) as {
          data?: { sections?: ApiSection[] };
          error?: string;
        };

        if (cancelled) return;

        if (!res.ok) {
          throw new Error(body.error ?? 'Bölümler yüklenemedi');
        }

        const byId = new Map((body.data?.sections ?? []).map((section) => [section.id, section]));

        setSections(
          HOME_LISTING_SECTIONS.map((config) => {
            const row = byId.get(config.id);
            if (!row) {
              return {
                id: config.id,
                items: [],
                total: 0,
                isLoading: false,
                error: 'Yüklenemedi',
              };
            }
            return {
              id: row.id,
              items: row.items ?? [],
              total: row.total ?? 0,
              isLoading: false,
              error: row.error,
            };
          }),
        );
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.name === 'AbortError'
              ? 'İstek zaman aşımına uğradı'
              : err.message
            : 'Yüklenemedi';
        setSections(
          HOME_LISTING_SECTIONS.map((config) => ({
            id: config.id,
            items: [],
            total: 0,
            isLoading: false,
            error: message,
          })),
        );
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void load();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [reloadToken]);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const isLoading = sections.some((section) => section.isLoading);

  return { sections, isLoading, refresh };
}
