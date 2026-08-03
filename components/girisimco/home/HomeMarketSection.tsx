'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Store } from 'lucide-react';
import { ScrollReveal } from '@/components/girisimco/ui/scroll-reveal';
import { getMockHomeMarketAds } from '@/features/admin/market/mock/market.mock';
import type { MarketItem } from '@/features/admin/market/types/market.types';
import { cn } from '@/lib/utils';

export function HomeMarketSection() {
  const items = useMemo(() => getMockHomeMarketAds(), []);

  if (items.length === 0) return null;

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
              Tüm güncel ilanları gör
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <ScrollReveal key={item.id} delay={Math.min(index * 30, 90)}>
              <MarketAdCard item={item} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MarketAdCard({ item }: { item: MarketItem }) {
  const content = (
    <>
      <div className="relative mb-3 aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
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

  if (item.linkUrl) {
    const external = /^https?:\/\//i.test(item.linkUrl);
    if (external) {
      return (
        <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className={className}>
          {content}
        </a>
      );
    }
    return (
      <Link href={item.linkUrl} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
