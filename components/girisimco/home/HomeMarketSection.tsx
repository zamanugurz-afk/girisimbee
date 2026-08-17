'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Store } from 'lucide-react';
import { HomeSectionHeader } from '@/components/girisimco/home/home-section-header';
import {
  getMockHomeMarketAds,
  MARKET_HOME_PREVIEW_COUNT,
  type MarketItem,
} from '@/features/admin/market';
import { toPublicMarketItem } from '@/features/admin/market/lib/public-market-item';
import {
  MARKET_HOME_CTA_HREF,
  MARKET_HOME_CTA_LABEL,
  MARKET_HOME_SUBTITLE,
} from '@/features/admin/market/presentation/market-copy';
import { cn } from '@/lib/utils';

/** Homepage MARKET — light, editorial strip without intrusive advertisement banners. */
export function HomeMarketSection({ fold = false }: { fold?: boolean }) {
  const [items, setItems] = useState<MarketItem[]>(() => getMockHomeMarketAds());

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);

    async function load() {
      try {
        const res = await fetch('/api/market', { signal: controller.signal });
        if (!res.ok) return;
        const json = (await res.json()) as { data?: { items?: MarketItem[] } };
        const live = (json.data?.items ?? [])
          .filter((item) => item.status === 'published' && !item.deletedAt)
          .map(toPublicMarketItem)
          .slice(0, MARKET_HOME_PREVIEW_COUNT);
        if (!cancelled && live.length > 0) {
          setItems(live);
        }
      } catch {
        /* keep seed mocks */
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
  }, []);

  return (
    <section
      id="firsatlar"
      className={cn(
        'relative z-[1] min-w-0 overflow-x-hidden bg-transparent dark:bg-transparent',
        fold && 'shrink-0',
      )}
      aria-labelledby="home-opportunities-heading"
    >
      <div
        className={cn(
          'mx-auto w-full max-w-[1280px] px-5 lg:px-8',
          fold ? 'py-3' : 'py-8 lg:py-10',
        )}
      >
        <div className={cn(fold ? 'mb-2' : 'mb-5')}>
          <HomeSectionHeader
            headingId="home-opportunities-heading"
            title="Girişimbee Market"
            description={MARKET_HOME_SUBTITLE}
            href={MARKET_HOME_CTA_HREF}
            ctaLabel={MARKET_HOME_CTA_LABEL}
            icon={Store}
            variant="amber"
          />
        </div>

        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-5 lg:gap-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800',
          )}
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={cn(
                'relative h-full',
                idx === 0
                  ? 'sm:pr-4 lg:pr-3 sm:pl-0'
                  : idx === 3
                  ? 'sm:pl-4 lg:pl-3 sm:pr-0'
                  : 'sm:px-4 lg:px-3'
              )}
            >
              <MarketAdCard item={item} fold={fold} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MarketAdCard({
  item,
  fold = false,
}: {
  item: MarketItem;
  fold?: boolean;
}) {
  const detailHref = `/market/${item.id}`;

  if (fold) {
    return (
      <Link
        href={detailHref}
        className={cn(
          'group flex h-[5.5rem] gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-2.5',
          'backdrop-blur-md transition duration-200 shadow-sm',
          'hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-md',
          'dark:border-zinc-800 dark:bg-zinc-900/85',
        )}
      >
        <div className="relative h-full w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="72px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              <Store className="h-4 w-4" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pr-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400">
            Market
          </span>
          <h3 className="line-clamp-1 font-display text-[13px] font-semibold leading-snug text-foreground">
            {item.title}
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-primary">
            {item.ctaLabel}
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={detailHref}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85',
        'backdrop-blur-md shadow-sm transition-all duration-300',
        'hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-md dark:hover:border-zinc-700',
        'dark:border-zinc-800 dark:bg-zinc-900/85',
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            <Store className="h-6 w-6" aria-hidden />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 shadow-sm backdrop-blur-md dark:bg-zinc-900/90 dark:text-amber-400 border border-white/50 dark:border-zinc-800">
          Fırsat
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">
          {item.title}
        </h3>
        {item.description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {item.description}
          </p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors group-hover:text-amber-600">
          {item.ctaLabel}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
