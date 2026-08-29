'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Megaphone, Sparkles } from 'lucide-react';
import { ADS_ROUTES, MARKET_AD_PRICE_LABEL } from '@/features/ads/constants/ad-inquiry.constants';
import {
  MARKET_ADVERTISE_AVAILABLE_LABEL,
  MARKET_ADVERTISE_CTA_LABEL,
  MARKET_ADVERTISE_TITLE,
} from '@/features/admin/market/presentation/market-copy';
import { cn } from '@/lib/utils';

export function MarketAdvertiseBanner({ className }: { className?: string }) {
  return (
    <Link
      href={ADS_ROUTES.public}
      className={cn(
        'group mb-6 block rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white',
        'shadow-[0_2px_12px_-4px_rgba(245,158,11,0.1)] transition duration-300',
        'hover:border-amber-400 hover:shadow-[0_6px_20px_-4px_rgba(245,158,11,0.2)]',
        'dark:border-amber-800/40 dark:from-amber-950/30 dark:to-card',
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm">
            <Megaphone className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Fırsat ve İşbirliği
              </span>
            </div>
            <h2 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-lg mt-1">
              Markanız Burada Görünsün
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-muted-foreground">
              Seçili girişim fırsatları arasında yerinizi alın. Standart yayın{' '}
              <span className="font-bold text-amber-700 dark:text-amber-400">
                {MARKET_AD_PRICE_LABEL}
              </span>
              ; özel işbirlikleri için talep oluşturun.
            </p>
          </div>
        </div>

        <span className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all group-hover:scale-[1.02] sm:w-auto">
          Reklam Ver
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

/** Grid CTA — matches MarketAdCard proportions with 1-minute attention pulse. */
export function MarketAdvertiseCta({
  className,
  fold = false,
}: {
  className?: string;
  fold?: boolean;
}) {
  const [isBlinking, setIsBlinking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBlinking(false);
    }, 60000); // 1 dakika boyunca yanıp söner

    return () => clearTimeout(timer);
  }, []);

  if (fold) {
    return (
      <Link
        href={ADS_ROUTES.public}
        className={cn(
          'group flex h-[6rem] items-center gap-3 overflow-hidden rounded-2xl border border-dashed border-amber-300/80',
          'bg-amber-50/40 px-3.5 transition duration-200',
          'hover:border-amber-500 hover:bg-amber-50',
          'dark:border-amber-800/40 dark:bg-amber-950/20 dark:hover:bg-amber-950/30',
          isBlinking && 'animate-pulse ring-2 ring-amber-400/80',
          className,
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
            {MARKET_ADVERTISE_AVAILABLE_LABEL}
          </span>
          <span className="mt-0.5 block truncate font-display text-[13px] font-bold text-slate-900 dark:text-foreground">
            {MARKET_ADVERTISE_TITLE}
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
            {MARKET_ADVERTISE_CTA_LABEL}
            <ArrowRight
              className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={ADS_ROUTES.public}
      className={cn(
        'group relative flex h-full min-h-[15rem] flex-col overflow-hidden rounded-2xl',
        'border border-dashed border-amber-400 bg-white transition-all duration-300',
        'hover:border-amber-500 hover:shadow-md hover:bg-amber-50/20',
        'dark:border-amber-700/60 dark:bg-card dark:hover:border-amber-500',
        isBlinking && 'animate-pulse ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/25 border-amber-500',
        className,
      )}
    >
      <div className="relative flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-sm transition-transform duration-300 group-hover:scale-110">
          <Sparkles className="h-5 w-5 fill-slate-950" aria-hidden />
        </span>
        <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
          {MARKET_ADVERTISE_AVAILABLE_LABEL}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
          {MARKET_ADVERTISE_TITLE}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-muted-foreground">
          Girişimci ve yatırımcı kitlesine anında ulaşın. Yayın {MARKET_AD_PRICE_LABEL}.
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3.5 text-xs font-bold text-amber-700 dark:text-amber-400">
          {MARKET_ADVERTISE_CTA_LABEL}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
