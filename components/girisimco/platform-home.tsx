'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  Briefcase,
  CircleDollarSign,
  Handshake,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { PlatformHero } from '@/components/girisimco/hero/PlatformHero';
import { HomeListingsModule } from '@/components/girisimco/home/HomeListingsModule';
import { HomeMarketSection } from '@/components/girisimco/home/HomeMarketSection';
import {
  HOME_CATEGORIES,
  type HomeCategorySlug,
} from '@/components/girisimco/home/home-marketplace.data';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<HomeCategorySlug, LucideIcon> = {
  'yatirim-bul': CircleDollarSign,
  'ise-al': Briefcase,
  'ortak-bul': Handshake,
  franchise: Store,
  'dijital-ai': BrainCircuit,
};

const CATEGORY_CARD_STYLES: Record<
  HomeCategorySlug,
  { tint: string; border: string; glow: string }
> = {
  'yatirim-bul': {
    tint: 'from-[#60A5FA]/12 via-[#60A5FA]/4 to-transparent',
    border: 'border-[#60A5FA]/25 group-hover:border-[#60A5FA]/45',
    glow: 'group-hover:shadow-[0_8px_24px_-8px_#60A5FA40]',
  },
  'ise-al': {
    tint: 'from-[#22C55E]/12 via-[#22C55E]/4 to-transparent',
    border: 'border-[#22C55E]/25 group-hover:border-[#22C55E]/45',
    glow: 'group-hover:shadow-[0_8px_24px_-8px_#22C55E40]',
  },
  'ortak-bul': {
    tint: 'from-[#F59E0B]/12 via-[#F59E0B]/4 to-transparent',
    border: 'border-[#F59E0B]/25 group-hover:border-[#F59E0B]/45',
    glow: 'group-hover:shadow-[0_8px_24px_-8px_#F59E0B40]',
  },
  franchise: {
    tint: 'from-[#EC4899]/12 via-[#EC4899]/4 to-transparent',
    border: 'border-[#EC4899]/25 group-hover:border-[#EC4899]/45',
    glow: 'group-hover:shadow-[0_8px_24px_-8px_#EC489940]',
  },
  'dijital-ai': {
    tint: 'from-[#8B5CF6]/12 via-[#8B5CF6]/4 to-transparent',
    border: 'border-[#8B5CF6]/25 group-hover:border-[#8B5CF6]/45',
    glow: 'group-hover:shadow-[0_8px_24px_-8px_#8B5CF640]',
  },
};

function CategoryCard({ cat }: { cat: (typeof HOME_CATEGORIES)[number] }) {
  const Icon = CATEGORY_ICONS[cat.slug];
  const styles = CATEGORY_CARD_STYLES[cat.slug];
  const className = cn(
    'group relative flex h-full min-h-[8.75rem] w-full flex-col overflow-hidden rounded-2xl border p-3.5 text-left sm:min-h-[9.25rem] sm:p-4',
    'bg-card shadow-md transition-all duration-300 ease-smooth',
    'hover:scale-[1.02] hover:shadow-lg',
    styles.border,
    styles.glow,
  );

  return (
    <Link href={cat.href} className={className}>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b',
          styles.tint,
        )}
        aria-hidden
      />
      <span
        className="relative mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
        style={{
          backgroundColor: cat.color,
          boxShadow: `0 8px 24px -8px ${cat.color}66`,
        }}
        aria-hidden
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <span className="relative text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {cat.audience}
      </span>
      <span className="relative mt-0.5 font-display text-gc-base font-semibold text-foreground sm:text-gc-lg">
        {cat.label}
      </span>
      <span className="relative mt-1.5 line-clamp-2 flex-1 text-gc-xs leading-relaxed text-muted-foreground sm:text-gc-sm">
        {cat.hint}
      </span>
      <span
        className="relative mt-2 inline-flex items-center gap-1 text-gc-xs font-medium text-opacity-100 opacity-80 transition-all duration-300 group-hover:opacity-100 sm:text-gc-sm"
        style={{ color: cat.color }}
      >
        Keşfet
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function PlatformHome() {
  return (
    <div className="gc-header-offset">
      {/* First fold: hero + categories fit in one viewport */}
      <div className="flex min-h-[calc(100dvh-var(--gc-header-height))] flex-col">
        <PlatformHero />

        <section className="relative z-10 shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-[2px]">
          <div className="mx-auto max-w-7xl px-5 pb-5 pt-1 lg:px-8 lg:pb-6">
            <div className="mb-3 max-w-lg sm:mb-3.5">
              <h2 className="gc-page-heading text-gc-lg sm:text-gc-xl">Size uygun yolu seçin</h2>
              <p className="mt-1 text-gc-xs leading-relaxed text-muted-foreground sm:text-gc-sm">
                Beş farklı amaç, tek platform. Bir kategori seçerek ilgili ilanları keşfedin.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-3">
              {HOME_CATEGORIES.map((cat) => (
                <CategoryCard key={cat.slug} cat={cat} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <HomeMarketSection />

      <HomeListingsModule />
    </div>
  );
}
