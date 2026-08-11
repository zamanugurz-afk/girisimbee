'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Store } from 'lucide-react';
import { MarketAdvertiseCta } from '@/features/ads';
import {
  getMockHomeMarketAds,
  MARKET_HOME_PREVIEW_COUNT,
  type MarketItem,
} from '@/features/admin/market';
import { cn } from '@/lib/utils';

/** Homepage MARKET — light, editorial sponsored strip. */
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
      className={cn(
        'relative z-[1] bg-transparent dark:bg-transparent',
        fold && 'shrink-0',
      )}
      aria-labelledby="home-market-heading"
    >
      <div
        className={cn(
          'mx-auto w-full max-w-[1280px] px-5 lg:px-8',
          fold ? 'py-3' : 'py-10 lg:py-12',
        )}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border border-[#E8EAF0] bg-white/90',
            'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-18px_rgba(15,23,42,0.18)]',
            fold ? 'mb-2.5' : 'mb-5',
            'dark:border-border dark:bg-card',
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'radial-gradient(ellipse 70% 120% at 0% 0%, #0B122014, transparent 55%)',
            }}
            aria-hidden
          />
          <div
            className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-[#0B1220]"
            aria-hidden
          />

          <div className="relative flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
            <div className="min-w-0 pl-2 sm:pl-2.5">
              <h2
                id="home-market-heading"
                className="inline-flex min-w-0 items-center gap-2.5 font-display text-xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-2xl"
              >
                <Store className="h-5 w-5 shrink-0" aria-hidden />
                Girişimbee MARKET
              </h2>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#64748B]">
                Seçili fırsat ve işbirlikleri
              </p>
            </div>

            <Link
              href="/market"
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-[#E6E8EE] bg-white/95',
                'px-3.5 py-2 text-[13px] font-semibold text-[#0B1220]',
                'shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all',
                'hover:border-[#0B1220]/20 hover:bg-white hover:shadow-[0_4px_12px_-6px_rgba(15,23,42,0.2)]',
                'sm:self-auto dark:border-border dark:bg-card dark:text-foreground',
              )}
            >
              Tüm fırsatlar
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div
          className={cn(
            'grid gap-2.5',
            fold ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4',
          )}
        >
          {items.map((item) => (
            <MarketAdCard key={item.id} item={item} fold={fold} />
          ))}
          <MarketAdvertiseCta fold={fold} />
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
          'group flex h-[6rem] gap-3 overflow-hidden rounded-2xl border border-[#E6E8EE] bg-white p-2.5',
          'transition duration-200',
          'hover:border-[#0B1220]/20 hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]',
          'dark:border-border dark:bg-card',
        )}
      >
        <div className="relative h-full w-[4.75rem] shrink-0 overflow-hidden rounded-xl bg-[#EEF0F4]">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="76px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#94A3B8]">
              <Store className="h-4 w-4" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pr-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
            Reklam
          </span>
          <h3 className="line-clamp-1 font-display text-[13px] font-semibold leading-snug text-[#0B1220] dark:text-foreground">
            {item.title}
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] transition-colors group-hover:text-[#0B1220]">
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
        'group flex h-full min-h-[15rem] flex-col overflow-hidden rounded-2xl border border-[#E6E8EE] bg-white',
        'shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200',
        'hover:border-[#D0D4DE] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]',
        'dark:border-border dark:bg-card',
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#F1F3F7]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#94A3B8]">
            <Store className="h-6 w-6" aria-hidden />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
          Reklam
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-[#0B1220] dark:text-foreground">
          {item.title}
        </h3>
        {item.description ? (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#64748B]">
            {item.description}
          </p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-[#0B1220] transition-colors group-hover:text-primary dark:text-foreground">
          {item.ctaLabel}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
