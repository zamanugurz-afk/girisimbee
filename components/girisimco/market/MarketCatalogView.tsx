'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store } from 'lucide-react';
import { BrandWordmark } from '@/components/girisimco/brand-wordmark';
import { ScrollReveal } from '@/components/girisimco/ui/scroll-reveal';
import { MarketAdCard } from '@/components/girisimco/home/HomeMarketSection';
import {
  MarketAdvertiseBanner,
  MarketAdvertiseCta,
} from '@/features/ads';
import { ADS_ROUTES } from '@/features/ads/constants/ad-inquiry.constants';
import type { MarketItem } from '@/features/admin/market/types/market.types';
import { Button } from '@/components/ui/button';

export function MarketCatalogView() {
  const [items, setItems] = useState<MarketItem[]>([]);
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
        if (!cancelled) setItems(json.data?.items ?? []);
      } catch {
        if (!cancelled) {
          setItems([]);
          setError('MARKET ilanları yüklenemedi.');
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
    <div className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
        <ScrollReveal>
          <div className="mb-6 max-w-2xl">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Store className="h-3.5 w-3.5" aria-hidden />
              <><BrandWordmark /> MARKET</>
            </p>
            <h1 className="gc-page-heading mt-1.5 text-gc-xl sm:text-gc-2xl">
              Güncel fırsat ve işbirlikleri
            </h1>
            <p className="mt-2 text-gc-sm leading-relaxed text-muted-foreground sm:text-gc-base">
              Yalnızca MARKET üzerinden yayınlanan seçili reklam ve iş birliği fırsatları.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={40}>
          <MarketAdvertiseBanner />
        </ScrollReveal>

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Yükleniyor…</p>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border/80 bg-card/50 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">
                Henüz yayınlanmış MARKET ilanı yok
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Kartınızı 5.000 TL ile hemen yayınlayabilir veya özel işbirliği talebi bırakabilirsiniz.
              </p>
            </div>
            <Button asChild className="rounded-xl">
              <Link href={ADS_ROUTES.public}>Reklam &amp; işbirliği</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <ScrollReveal key={item.id} delay={Math.min(index * 30, 120)}>
                <MarketAdCard item={item} />
              </ScrollReveal>
            ))}
            <ScrollReveal delay={Math.min(Math.max(items.length, 1) * 30, 150)}>
              <MarketAdvertiseCta />
            </ScrollReveal>
          </div>
        )}
      </div>
    </div>
  );
}
