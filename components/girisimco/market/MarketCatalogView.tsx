'use client';

import { useMemo } from 'react';
import { Store } from 'lucide-react';
import { ScrollReveal } from '@/components/girisimco/ui/scroll-reveal';
import { MarketAdCard } from '@/components/girisimco/home/HomeMarketSection';
import { getMockPublishedMarketItems } from '@/features/admin/market/mock/market.mock';

export function MarketCatalogView() {
  const items = useMemo(() => getMockPublishedMarketItems(), []);

  return (
    <div className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
        <ScrollReveal>
          <div className="mb-8 max-w-2xl">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Store className="h-3.5 w-3.5" aria-hidden />
              Girişimco MARKET
            </p>
            <h1 className="gc-page-heading mt-1.5 text-gc-xl sm:text-gc-2xl">
              Güncel fırsat ve işbirlikleri
            </h1>
            <p className="mt-2 text-gc-sm leading-relaxed text-muted-foreground sm:text-gc-base">
              Yalnızca MARKET üzerinden yayınlanan seçili reklam ve iş birliği fırsatları.
            </p>
          </div>
        </ScrollReveal>

        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/80 bg-card px-5 py-12 text-center text-sm text-muted-foreground">
            Şu an yayınlanmış MARKET fırsatı bulunmuyor.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <ScrollReveal key={item.id} delay={Math.min(index * 30, 120)}>
                <MarketAdCard item={item} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
