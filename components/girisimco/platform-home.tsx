'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Handshake,
  Rocket,
  Sparkles,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { PlatformHero } from '@/components/girisimco/hero/PlatformHero';
import {
  HomeFeaturedSection,
  HomeListingsProvider,
  HomeRestSections,
} from '@/components/girisimco/home/HomeListingsModule';
import { HomeMarketSection } from '@/components/girisimco/home/HomeMarketSection';
import {
  HOME_CATEGORIES,
  type HomeCategorySlug,
} from '@/components/girisimco/home/home-marketplace.data';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<HomeCategorySlug, LucideIcon> = {
  'yatirim-bul': Rocket,
  'ise-al': Briefcase,
  'ortak-bul': Handshake,
  franchise: Store,
  'dijital-ai': Sparkles,
};

/**
 * Gateway grid — auto-tracks visible card count.
 * Was `lg:grid-cols-5` when Dijital & AI was in HOME_GATEWAY_VISIBLE_SLUGS.
 */
function homeGatewayGridClass(count: number): string {
  if (count >= 5) return 'grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4';
  if (count === 4) return 'grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4';
  if (count === 3) return 'grid grid-cols-1 gap-3.5 sm:grid-cols-3 lg:grid-cols-3 lg:gap-4';
  return 'grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-2 lg:gap-4';
}

/** Intent gateway — larger destination cards under the hero. */
function HomeCategoryShortcuts() {
  const cardCount = HOME_CATEGORIES.length;
  /** Slightly taller cards when fewer columns fill the row. Was 11.5rem at 5 cols. */
  const cardMinH = cardCount <= 4 ? 'min-h-[12.75rem]' : 'min-h-[11.5rem]';

  return (
    <section
      className="relative shrink-0 bg-transparent dark:bg-transparent"
      aria-labelledby="home-category-heading"
    >
      <div className="mx-auto max-w-[1280px] px-5 pb-5 pt-2 lg:px-8 lg:pb-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="home-category-heading"
              className="font-display text-lg font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-xl"
            >
              Ne arıyorsunuz?
            </h2>
            <p className="mt-1 text-[13px] text-[#64748B] sm:text-sm">
              Bir kategori seçin — ilgili ilanlara anında geçin.
            </p>
          </div>
          <Link
            href="/kesfet"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#0B1220] transition-opacity hover:opacity-70 dark:text-foreground"
          >
            Tüm ilanlar
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <nav aria-label="İlan kategorileri">
          <ul className={homeGatewayGridClass(cardCount)}>
            {HOME_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug];
              const cardClass = cn(
                'group flex h-full w-full flex-col rounded-2xl border border-[#E6E8EE] bg-white text-left',
                cardMinH,
                'p-5 transition duration-200',
                'hover:border-[#0B1220]/25 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1220]/20',
                'dark:border-border dark:bg-card dark:hover:bg-card',
              );
              const cardInner = (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden
                    >
                      <Icon className="h-6 w-6" strokeWidth={2} />
                    </span>
                    <ArrowRight
                      className="mt-1.5 h-5 w-5 shrink-0 text-[#CBD5E1] transition duration-200 group-hover:translate-x-0.5 group-hover:text-[#0B1220]"
                      aria-hidden
                    />
                  </div>
                  <span className="mt-4 block font-display text-base font-bold leading-snug text-[#0B1220] dark:text-foreground sm:text-[17px]">
                    {cat.label}
                  </span>
                  <span className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
                    {cat.hint}
                  </span>
                </>
              );
              return (
                <li key={cat.slug} className="min-w-0">
                  <Link href={cat.href} className={cardClass}>
                    {cardInner}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/** First viewport: Hero + Categories. Below: MARKET then listings. */
export function PlatformHome() {
  return (
    <HomeListingsProvider>
      <div className="gc-header-offset bg-[#FAFBFC] dark:bg-background">
        <div className="flex h-[calc(100dvh-var(--gc-header-height))] max-h-[calc(100dvh-var(--gc-header-height))] flex-col overflow-hidden">
          <PlatformHero className="min-h-0 flex-1" />
          <HomeCategoryShortcuts />
        </div>
        <div>
          <HomeMarketSection />
          <HomeFeaturedSection />
          <HomeRestSections />
        </div>
      </div>
    </HomeListingsProvider>
  );
}
