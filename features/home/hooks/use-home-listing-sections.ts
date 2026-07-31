'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getClientContainer } from '@/lib/persistence/container';
import type { ContentItem } from '@/features/categories/types/category.types';
import {
  HOME_LISTING_SECTIONS,
  type HomeListingSectionId,
} from '@/features/home/config/home-sections.config';
import type {
  HomeListingSectionState,
  HomeListingSectionsResult,
} from '@/features/home/types/home-section.types';

function emptySection(id: HomeListingSectionId): HomeListingSectionState {
  return { id, items: [], total: 0, isLoading: true, error: null };
}

export function useHomeListingSections(): HomeListingSectionsResult {
  const browseService = useMemo(() => getClientContainer().listingBrowseService, []);
  const [sections, setSections] = useState<HomeListingSectionState[]>(() =>
    HOME_LISTING_SECTIONS.map((section) => emptySection(section.id)),
  );
  const [reloadToken, setReloadToken] = useState(0);

  const loadSections = useCallback(async () => {
    setSections(HOME_LISTING_SECTIONS.map((section) => emptySection(section.id)));

    const results = await Promise.allSettled(
      HOME_LISTING_SECTIONS.map(async (section) => {
        const result = await browseService.browse(section.resolveBrowseParams());
        return {
          id: section.id,
          items: result.data,
          total: result.total,
          isLoading: false,
          error: null,
        } satisfies HomeListingSectionState;
      }),
    );

    setSections(
      results.map((result, index) => {
        const id = HOME_LISTING_SECTIONS[index].id;
        if (result.status === 'fulfilled') return result.value;
        return {
          id,
          items: [] as ContentItem[],
          total: 0,
          isLoading: false,
          error: result.reason instanceof Error ? result.reason.message : 'Yüklenemedi',
        };
      }),
    );
  }, [browseService]);

  useEffect(() => {
    void loadSections();
  }, [loadSections, reloadToken]);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const isLoading = sections.some((section) => section.isLoading);

  return { sections, isLoading, refresh };
}
