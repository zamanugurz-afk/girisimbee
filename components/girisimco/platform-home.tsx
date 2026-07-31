'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Handshake,
  Rocket,
  Store,
  TrendingUp,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListingFeed } from '@/components/girisimco/marketplace/listing-feed';
import { ListingFeedSkeleton } from '@/components/girisimco/ui/listing-card-skeleton';
import { ScrollReveal } from '@/components/girisimco/ui/scroll-reveal';
import { PlatformHero } from '@/components/girisimco/hero/PlatformHero';
import { HomeListingsModule } from '@/components/girisimco/home/HomeListingsModule';
import { FranchiseFlowDialog } from '@/components/girisimco/home/franchise-flow-dialog';
import { useMarketplaceBrowse } from '@/features/listings/hooks/use-marketplace-browse';
import {
  HOME_CATEGORIES,
  type HomeCategorySlug,
} from '@/components/girisimco/home/home-marketplace.data';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<HomeCategorySlug, LucideIcon> = {
  'yatirim-bul': Rocket,
  'yatirim-yap': TrendingUp,
  'is-bul': Briefcase,
  'ise-al': UserPlus,
  'ortak-bul': Handshake,
  franchise: Store,
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
  'yatirim-yap': {
    tint: 'from-[#6C63FF]/12 via-[#6C63FF]/4 to-transparent',
    border: 'border-[#6C63FF]/25 group-hover:border-[#6C63FF]/45',
    glow: 'group-hover:shadow-[0_8px_24px_-8px_#6C63FF40]',
  },
  'is-bul': {
    tint: 'from-[#5B5CF6]/12 via-[#5B5CF6]/4 to-transparent',
    border: 'border-[#5B5CF6]/25 group-hover:border-[#5B5CF6]/45',
    glow: 'group-hover:shadow-[0_8px_24px_-8px_#5B5CF640]',
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
};

function CategoryCard({
  cat,
  onFranchiseClick,
}: {
  cat: (typeof HOME_CATEGORIES)[number];
  onFranchiseClick?: () => void;
}) {
  const Icon = CATEGORY_ICONS[cat.slug];
  const styles = CATEGORY_CARD_STYLES[cat.slug];
  const className = cn(
    'group relative flex h-full min-h-[7.25rem] w-full flex-col overflow-hidden rounded-2xl border p-2.5 text-left sm:min-h-[7.75rem] sm:p-3.5',
    'bg-card shadow-md transition-all duration-300 ease-smooth',
    'hover:scale-[1.02] hover:shadow-lg',
    styles.border,
    styles.glow,
  );
  const content = (
    <>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b',
          styles.tint,
        )}
        aria-hidden
      />
      <span
        className="relative mb-1.5 inline-flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10"
        style={{
          backgroundColor: cat.color,
          boxShadow: `0 8px 24px -8px ${cat.color}66`,
        }}
        aria-hidden
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <span className="relative text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-gc-xs">
        {cat.audience}
      </span>
      <span className="relative mt-0.5 font-display text-gc-base font-semibold text-foreground sm:text-gc-lg">
        {cat.label}
      </span>
      <span className="relative mt-1.5 flex-1 text-gc-xs leading-relaxed text-muted-foreground sm:text-gc-sm">
        {cat.hint}
      </span>
      <span
        className="relative mt-2 inline-flex items-center gap-1 text-gc-xs font-medium opacity-0 transition-all duration-300 group-hover:opacity-100 sm:text-gc-sm"
        style={{ color: cat.color }}
      >
        Keşfet
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </>
  );

  if (cat.slug === 'franchise') {
    return (
      <button type="button" onClick={onFranchiseClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={cat.href} className={className}>
      {content}
    </Link>
  );
}

function ListingsSectionHeader({ total }: { total: number }) {
  return (
    <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="gc-section-title">Güncel ilanlar</h2>
        <p className="mt-1 text-gc-sm text-muted-foreground">
          Platformdaki son yayınlanan fırsatlar
        </p>
      </div>
      <div className="flex items-center gap-3">
        {total > 0 && (
          <span className="text-gc-xs text-muted-foreground">
            {total.toLocaleString('tr-TR')} ilan
          </span>
        )}
        <Link
          href="/kesfet"
          className="inline-flex items-center gap-1 text-gc-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Tümünü gör
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function PlatformHome() {
  const { items, total, isLoading } = useMarketplaceBrowse();
  const [franchiseDialogOpen, setFranchiseDialogOpen] = useState(false);

  return (
    <div className="gc-header-offset">
      <PlatformHero />

      {/* ── Intent gateway: category cards ── */}
      <section className="-mt-7 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 pb-8 lg:px-8 lg:pb-10">
          <ScrollReveal>
            <div className="mb-4 max-w-lg">
              <h2 className="gc-page-heading text-gc-lg sm:text-gc-xl">Size uygun yolu seçin</h2>
              <p className="mt-1.5 text-gc-sm leading-relaxed text-muted-foreground sm:text-gc-base">
                Altı farklı amaç, tek platform. Bir kategori seçerek ilgili ilanları keşfedin.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {HOME_CATEGORIES.map((cat, index) => (
              <ScrollReveal key={cat.slug} delay={Math.min(index * 30, 90)}>
                <CategoryCard
                  cat={cat}
                  onFranchiseClick={() => setFranchiseDialogOpen(true)}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <FranchiseFlowDialog open={franchiseDialogOpen} onOpenChange={setFranchiseDialogOpen} />

      <HomeListingsModule />

      {/* ── Live listings ── */}
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
        <ScrollReveal as="section">
          <ListingsSectionHeader total={total} />
          {isLoading ? (
            <ListingFeedSkeleton count={4} />
          ) : (
            <ListingFeed items={items.slice(0, 8)} />
          )}
          {!isLoading && items.length > 0 && (
            <div className="mt-8 text-center">
              <Button asChild variant="outline">
                <Link href="/kesfet">
                  Daha fazla ilan gör
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </ScrollReveal>
      </div>
    </div>
  );
}
