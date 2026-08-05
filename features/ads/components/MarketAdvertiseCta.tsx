'use client';

import Link from 'next/link';
import { ArrowRight, Megaphone, Radio, Sparkles } from 'lucide-react';
import { ADS_ROUTES, MARKET_AD_PRICE_LABEL } from '@/features/ads/constants/ad-inquiry.constants';
import { cn } from '@/lib/utils';

/**
 * MARKET sayfası üst bandı — reklam vermeyi hemen görünür kılar.
 * Site primary paleti + mevcut card dili korunur.
 */
export function MarketAdvertiseBanner({ className }: { className?: string }) {
  return (
    <Link
      href={ADS_ROUTES.public}
      className={cn(
        'group relative mb-8 block overflow-hidden rounded-2xl',
        'border border-primary/25 bg-card shadow-md',
        'transition-all duration-300 hover:border-primary/40 hover:shadow-lg',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/[0.12] via-primary/[0.04] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl transition-transform duration-500 group-hover:scale-110"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary sm:w-1.5"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6 lg:px-8 lg:py-7">
        <div className="flex min-w-0 items-start gap-4">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm sm:h-14 sm:w-14">
            <Megaphone className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background ring-2 ring-primary/30">
              <Radio className="h-2.5 w-2.5 text-primary animate-pulse" aria-hidden />
            </span>
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              Sponsorlu alan · MARKET
            </p>
            <h2 className="mt-1 font-display text-gc-lg font-semibold tracking-tight text-foreground sm:text-gc-xl">
              Markanız burada görünsün
            </h2>
            <p className="mt-1.5 max-w-xl text-gc-sm leading-relaxed text-muted-foreground">
              Seçili fırsatlar arasında yerinizi alın. Standart yayın{' '}
              <span className="font-medium text-foreground">{MARKET_AD_PRICE_LABEL}</span>
              ; özel işbirlikleri için talep oluşturun.
            </p>
          </div>
        </div>

        <span
          className={cn(
            'inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl',
            'bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm',
            'transition-transform duration-200 group-hover:translate-x-0.5 sm:self-center',
          )}
        >
          Reklam ver
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

/**
 * Grid içi “yeriniz boş” kartı — diğer reklam kartlarıyla aynı oranda, daha belirgin CTA.
 */
export function MarketAdvertiseCta({ className }: { className?: string }) {
  return (
    <Link
      href={ADS_ROUTES.public}
      className={cn(
        'group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl',
        'border-2 border-dashed border-primary/40 bg-card p-3 shadow-md',
        'transition-all duration-300 hover:scale-[1.02] hover:border-primary/60 hover:shadow-lg',
        'dark:border-primary/30 sm:p-3.5',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.14),_transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--primary) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.08) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
        }}
        aria-hidden
      />

      <div className="relative mb-3 flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-primary/[0.07] ring-1 ring-inset ring-primary/15">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition-transform duration-300 group-hover:scale-105">
          <Sparkles className="h-6 w-6" aria-hidden />
        </span>
        <span className="rounded-full bg-background/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary shadow-sm">
          Bu alan müsait
        </span>
      </div>

      <h3 className="relative font-display text-gc-base font-semibold text-foreground sm:text-gc-lg">
        Buraya reklam verin
      </h3>
      <p className="relative mt-1.5 line-clamp-2 text-gc-xs leading-relaxed text-muted-foreground sm:text-gc-sm">
        Girişimci ve yatırımcı kitlesine doğrudan ulaşın. Yayın ücreti {MARKET_AD_PRICE_LABEL}.
      </p>
      <span
        className={cn(
          'relative mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl',
          'bg-primary/10 px-3 py-2 text-gc-xs font-semibold text-primary',
          'transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:text-gc-sm',
        )}
      >
        Hemen başla
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
