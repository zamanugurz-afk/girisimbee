'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store } from 'lucide-react';
import { MarketAdCard } from '@/components/girisimco/home/HomeMarketSection';
import {
  MarketAdvertiseBanner,
  MarketAdvertiseCta,
} from '@/features/ads';
import { ADS_ROUTES } from '@/features/ads/constants/ad-inquiry.constants';
import type { MarketItem } from '@/features/admin/market/types/market.types';
import { getMockPublishedMarketItems } from '@/features/admin/market';
import { Button } from '@/components/ui/button';

export function MarketCatalogView() {
  const [items, setItems] = useState<MarketItem[]>(() => getMockPublishedMarketItems());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/market');
        if (!res.ok) throw new Error('load failed');
        const json = (await res.json()) as { data?: { items?: MarketItem[] } };
        const live = json.data?.items ?? [];
        if (!cancelled) setItems(live.length > 0 ? live : getMockPublishedMarketItems());
      } catch {
        if (!cancelled) {
          setItems(getMockPublishedMarketItems());
          setError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="gc-header-offset border-b border-[#EEF0F4] bg-[#FAFBFC] dark:border-border dark:bg-background">
      <div className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8 lg:py-10">
        <div className="mb-8 max-w-2xl">
          <p className="inline-flex items-center gap-1.5 font-display text-[13px] font-bold tracking-tight text-[#0B1220] dark:text-foreground">
            <Store className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Girişimbee MARKET
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-3xl">
            Güncel fırsat ve işbirlikleri
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
            Yalnızca MARKET üzerinden yayınlanan seçili reklam ve iş birliği fırsatları.
          </p>
        </div>

        <MarketAdvertiseBanner />

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="min-h-[14rem] animate-pulse rounded-2xl border border-[#E6E8EE] bg-white dark:border-border dark:bg-card"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-[#E6E8EE] bg-white px-5 py-10 sm:flex-row sm:items-center sm:justify-between dark:border-border dark:bg-card">
            <div>
              <h2 className="font-display text-base font-semibold text-[#0B1220] dark:text-foreground">
                Henüz yayınlanmış MARKET ilanı yok
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Kartınızı 5.000 TL ile hemen yayınlayabilir veya özel işbirliği talebi bırakabilirsiniz.
              </p>
            </div>
            <Button asChild className="rounded-lg">
              <Link href={ADS_ROUTES.public}>Reklam &amp; işbirliği</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <MarketAdCard key={item.id} item={item} />
            ))}
            <MarketAdvertiseCta />
          </div>
        )}
      </div>
    </div>
  );
}
