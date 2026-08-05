'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Store } from 'lucide-react';
import { ScrollReveal } from '@/components/girisimco/ui/scroll-reveal';
import type { MarketItem } from '@/features/admin/market/types/market.types';
import { ADS_ROUTES } from '@/features/ads/constants/ad-inquiry.constants';
import { cn } from '@/lib/utils';

/**
 * Ana sayfa MARKET bölümü görünümü.
 * Beğenilmezse `'classic'` yaparak önceki haline dönülür.
 * - `'framed'` → marka + kitle vurgusu, yüzey ayrımı, CTA butonu (aktif)
 * - `'classic'` → önceki sade header + text link
 */
export const HOME_MARKET_SECTION_LAYOUT: 'framed' | 'classic' = 'framed';

const HOME_MARKET_LIMIT = 6;

export function HomeMarketSection() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/market');
        if (!res.ok) throw new Error('load failed');
        const json = (await res.json()) as { data?: { items?: MarketItem[] } };
        const live = json.data?.items ?? [];
        if (!cancelled) setItems(live.slice(0, HOME_MARKET_LIMIT));
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
          <p className="text-sm text-muted-foreground">MARKET yükleniyor…</p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return <HomeMarketEmptyState />;
  }

  if (HOME_MARKET_SECTION_LAYOUT === 'classic') {
    return <HomeMarketSectionClassic items={items} />;
  }

  return <HomeMarketSectionFramed items={items} />;
}

function HomeMarketEmptyState() {
  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
        <ScrollReveal>
          <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border/80 bg-card/60 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                <Store className="h-3.5 w-3.5" aria-hidden />
                Girişimco MARKET
              </p>
              <h2 className="gc-page-heading mt-1.5 text-gc-lg">Henüz yayınlanmış fırsat yok</h2>
              <p className="mt-1.5 text-gc-sm text-muted-foreground">
                MARKET’te yer almak veya özel işbirliği için reklam formunu kullanabilirsiniz.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/market"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
              >
                MARKET’e bak
              </Link>
              <Link
                href={ADS_ROUTES.public}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Reklam ver
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function MarketAdsGrid({ items }: { items: MarketItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <ScrollReveal key={item.id} delay={Math.min(index * 30, 90)}>
          <MarketAdCard item={item} />
        </ScrollReveal>
      ))}
    </div>
  );
}

/** Önceki görünüm — geri dönüş için korunuyor. */
function HomeMarketSectionClassic({ items }: { items: MarketItem[] }) {
  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
        <ScrollReveal>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                <Store className="h-3.5 w-3.5" aria-hidden />
                Girişimco MARKET
              </p>
              <h2 className="gc-page-heading mt-1.5 text-gc-lg sm:text-gc-xl">
                Öne çıkan fırsatlar
              </h2>
              <p className="mt-1.5 text-gc-sm leading-relaxed text-muted-foreground sm:text-gc-base">
                Girişim ekosistemindeki seçili iş birliği ve büyüme fırsatlarını keşfedin.
              </p>
            </div>
            <Link
              href="/market"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Tüm güncel fırsat ve işbirlikleri
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </ScrollReveal>

        <MarketAdsGrid items={items} />
      </div>
    </section>
  );
}

/** Aktif görünüm — marka, kitle, yüzey ve CTA güçlendirilmiş. */
function HomeMarketSectionFramed({ items }: { items: MarketItem[] }) {
  return (
    <section className="relative border-b border-border/60">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-background to-muted/40"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary/70 sm:w-1.5" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <ScrollReveal>
          <div className="mb-6 flex flex-col gap-5 lg:mb-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 font-display text-gc-base font-semibold tracking-tight text-primary sm:text-gc-lg">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9">
                  <Store className="h-4 w-4" aria-hidden />
                </span>
                Girişimco MARKET
              </p>
              <h2 className="gc-page-heading mt-3 text-gc-lg sm:text-gc-xl">
                Öne çıkan fırsatlar
              </h2>
              <p className="mt-1.5 text-gc-sm leading-relaxed text-muted-foreground sm:text-gc-base">
                İşverenler, şirketler ve profesyoneller için seçili iş birliği ve büyüme fırsatları.
              </p>
            </div>

            <Link
              href="/market"
              className={cn(
                'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/25',
                'bg-background/80 px-4 py-2.5 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm',
                'transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md',
              )}
            >
              Tüm güncel fırsat ve işbirlikleri
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </ScrollReveal>

        <MarketAdsGrid items={items} />
      </div>
    </section>
  );
}

export function MarketAdCard({ item }: { item: MarketItem }) {
  /** Card always opens MARKET ad detail — not category browse (/invest, /kesfet, …). */
  const detailHref = `/market/${item.id}`;

  const content = (
    <>
      <div className="relative mb-3 aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Store className="h-8 w-8 opacity-40" aria-hidden />
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary shadow-sm backdrop-blur-sm">
          Reklam
        </span>
      </div>
      <h3 className="font-display text-gc-base font-semibold text-foreground sm:text-gc-lg">
        {item.title}
      </h3>
      {item.description ? (
        <p className="mt-1.5 line-clamp-2 text-gc-xs leading-relaxed text-muted-foreground sm:text-gc-sm">
          {item.description}
        </p>
      ) : null}
      <span className="mt-3 inline-flex items-center gap-1 text-gc-xs font-medium text-primary sm:text-gc-sm">
        {item.ctaLabel}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </span>
    </>
  );

  const className = cn(
    'group flex h-full flex-col rounded-2xl border border-border/80 bg-card p-3 shadow-md',
    'transition-all duration-300 hover:scale-[1.02] hover:border-primary/25 hover:shadow-lg',
    'dark:border-white/10 sm:p-3.5',
  );

  return (
    <Link href={detailHref} className={className}>
      {content}
    </Link>
  );
}
