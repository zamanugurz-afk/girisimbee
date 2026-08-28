'use client';

import { useCallback, useEffect, useState } from 'react';
import type { HeroStatsCounts } from '@/features/home/types/hero-stats.types';

export type { HeroStatKey, HeroStatsCounts } from '@/features/home/types/hero-stats.types';

const EMPTY_COUNTS: HeroStatsCounts = {
  total: 0,
  jobs: 0,
  partners: 0,
  franchise: 0,
  services: 0,
  opportunities: 0,
  solutions: 0,
};

const REFRESH_INTERVAL_MS = 120_000;

export function formatHeroStatCount(value?: number | null): string {
  if (typeof value !== 'number' || isNaN(value)) return '0';
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
        next: undefined,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error ?? 'İstatistikler yüklenemedi');
      }
      const rawData = body?.data ?? body ?? {};
      setCounts({
        total: typeof rawData.total === 'number' ? rawData.total : 0,
        jobs: typeof rawData.jobs === 'number' ? rawData.jobs : 0,
        partners: typeof rawData.partners === 'number' ? rawData.partners : 0,
        franchise: typeof rawData.franchise === 'number' ? rawData.franchise : 0,
        services: typeof rawData.services === 'number' ? rawData.services : 0,
        opportunities: typeof rawData.opportunities === 'number' ? rawData.opportunities : 0,
        solutions: typeof rawData.solutions === 'number' ? rawData.solutions : 0,
      });
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
