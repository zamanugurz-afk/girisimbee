'use client';

import { Sparkles, Flame, Calendar, TrendingUp, type LucideIcon } from 'lucide-react';
import type { ContentItem } from '@/features/categories/types/category.types';
import { ContentCard } from '@/components/girisimco/content-card';
import { HomeSectionHeader } from '@/components/girisimco/home/home-section-header';
import { ListingCardSkeleton } from '@/components/girisimco/ui/listing-card-skeleton';
import type { HomeListingSectionConfig } from '@/features/home/config/home-sections.config';
import type { HomeListingSectionState } from '@/features/home/types/home-section.types';
import { cn } from '@/lib/utils';

interface HomeListingSectionRowProps {
  config: HomeListingSectionConfig;
  state: HomeListingSectionState;
}

const DESKTOP_LIMIT = 4;

const SECTION_VARIANT_MAP: Record<
  string,
  { icon: LucideIcon; variant: 'emerald' | 'rose' | 'sky' | 'purple' }
> = {
  featured: {
    icon: Sparkles,
    variant: 'emerald',
  },
  urgent: {
    icon: Flame,
    variant: 'rose',
  },
  today: {
    icon: Calendar,
    variant: 'sky',
  },
  most_viewed: {
    icon: TrendingUp,
    variant: 'purple',
  },
};

export function HomeListingSectionRow({
  config,
  state,
}: HomeListingSectionRowProps) {
  const visibleItems = state.items.slice(0, DESKTOP_LIMIT);
  const showLoading = state.isLoading;
  const sectionMeta = SECTION_VARIANT_MAP[config.id];

  return (
    <section className="space-y-5" aria-labelledby={`home-section-${config.id}`}>
      <div>
        <HomeSectionHeader
          headingId={`home-section-${config.id}`}
          title={config.title}
          description={config.description}
          href={config.viewAllHref}
          ctaLabel="Tümünü Gör"
          icon={sectionMeta?.icon}
          variant={sectionMeta?.variant ?? 'default'}
        />
      </div>

      {showLoading ? (
        <>
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 lg:hidden">
            {Array.from({ length: DESKTOP_LIMIT }).map((_, index) => (
              <div key={index} className="w-[18rem] shrink-0">
                <ListingCardSkeleton />
              </div>
            ))}
          </div>
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {Array.from({ length: DESKTOP_LIMIT }).map((_, idx) => (
              <div key={idx} className="relative h-full">
                <ListingCardSkeleton />
              </div>
            ))}
          </div>
        </>
      ) : state.error ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 backdrop-blur-sm px-5 py-8 text-sm text-zinc-500">
          {state.error}
        </p>
      ) : visibleItems.length === 0 ? (
        <p className="flex min-h-[14rem] items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-white/70 backdrop-blur-sm px-5 py-8 text-sm text-zinc-500">
          {config.emptyMessage}
        </p>
      ) : (
        <>
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 snap-x snap-mandatory ib-scrollbar-none sm:hidden">
            {visibleItems.map((item) => (
              <HomeSectionCard key={item.id} item={item} layout="scroll" />
            ))}
          </div>
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {visibleItems.map((item) => (
              <div key={item.id} className="relative h-full min-w-0">
                <HomeSectionCard item={item} layout="grid" />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function HomeSectionCard({
  item,
  layout,
}: {
  item: ContentItem;
  layout: 'scroll' | 'grid';
}) {
  return (
    <div
      className={cn(
        'relative h-full',
        layout === 'scroll' && 'w-[18rem] shrink-0 snap-start',
        layout === 'grid' && 'min-w-0',
      )}
    >
      <ContentCard item={item} />
    </div>
  );
}
