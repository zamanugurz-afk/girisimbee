'use client';

import { useCallback, useEffect, useState } from 'react';
import type { HeroStatsCounts } from '@/features/home/types/hero-stats.types';

export type { HeroStatKey, HeroStatsCounts } from '@/features/home/types/hero-stats.types';

const EMPTY_COUNTS: HeroStatsCounts = {
  total: 0,
  entrepreneurs: 0,
  investors: 0,
  jobs: 0,
  partners: 0,
  franchise: 0,
};

const REFRESH_INTERVAL_MS = 120_000;

export function formatHeroStatCount(value: number): string {
  return value.toLocaleString('tr-TR');
}

export function useHeroStats() {
  const [counts, setCounts] = useState<HeroStatsCounts>(EMPTY_COUNTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/marketplace/hero-stats', {
        method: 'GET',
        // Allow short browser cache — endpoint is already head-only counts.
        next: undefined,
      });
      const body = (await res.json()) as { data?: HeroStatsCounts; error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? 'İstatistikler yüklenemedi');
      }
      setCounts(body.data ?? EMPTY_COUNTS);
    } catch (e) {
      if (!silent) setCounts(EMPTY_COUNTS);
      setError(e instanceof Error ? e.message : 'İstatistikler yüklenemedi');
      console.error('[use-hero-stats]', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const intervalId = window.setInterval(() => {
      void load(true);
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [load]);

  const refresh = useCallback(() => {
    void load();
  }, [load]);

  return { counts, isLoading, error, refresh };
}
