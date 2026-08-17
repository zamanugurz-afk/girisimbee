'use client';

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
        'group mb-6 block rounded-2xl border border-[#E6E8EE] bg-white',
        'shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-200',
        'hover:border-[#D0D4DE] hover:shadow-[0_6px_18px_rgba(15,23,42,0.05)]',
        'dark:border-border dark:bg-card',
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B1220] text-white">
            <Megaphone className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold tracking-tight text-[#0B1220] dark:text-foreground sm:text-lg">
              Markanız burada görünsün
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748B]">
              Seçili fırsatlar arasında yerinizi alın. Standart yayın{' '}
              <span className="font-medium text-[#0B1220] dark:text-foreground">
                {MARKET_AD_PRICE_LABEL}
              </span>
              ; özel işbirlikleri için talep oluşturun.
            </p>
          </div>
        </div>

        <span className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0B1220] px-4 py-2.5 text-sm font-semibold text-white transition-opacity group-hover:opacity-90 sm:w-auto">
          Reklam ver
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

/** Grid CTA — matches MarketAdCard proportions. */
export function MarketAdvertiseCta({
  className,
  fold = false,
}: {
  className?: string;
  fold?: boolean;
}) {
  if (fold) {
    return (
      <Link
        href={ADS_ROUTES.public}
        className={cn(
          'group flex h-[6rem] items-center gap-3 overflow-hidden rounded-2xl border border-dashed border-[#C7CBD6]',
          'bg-white px-3.5 transition duration-200',
          'hover:border-[#0B1220]/30 hover:bg-[#FAFBFC]',
          'dark:border-border dark:bg-card',
          className,
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B1220] text-white">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
            {MARKET_ADVERTISE_AVAILABLE_LABEL}
          </span>
          <span className="mt-1 block truncate font-display text-[13px] font-semibold text-[#0B1220] dark:text-foreground">
            {MARKET_ADVERTISE_TITLE}
          </span>
          <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B1220]">
            {MARKET_ADVERTISE_CTA_LABEL}
            <ArrowRight
              className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
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
        'border border-dashed border-[#C7CBD6] bg-white',
        'transition-colors duration-200 hover:border-[#94A3B8] hover:bg-[#FAFBFC]',
        'dark:border-border dark:bg-card',
        className,
      )}
    >
      <div className="relative flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 bg-[#F7F8FA]">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1220] text-white">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
          {MARKET_ADVERTISE_AVAILABLE_LABEL}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[15px] font-semibold text-[#0B1220] dark:text-foreground">
          {MARKET_ADVERTISE_TITLE}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#64748B]">
          Girişimci ve yatırımcı kitlesine ulaşın. Yayın {MARKET_AD_PRICE_LABEL}.
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-[#0B1220]">
          {MARKET_ADVERTISE_CTA_LABEL}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
