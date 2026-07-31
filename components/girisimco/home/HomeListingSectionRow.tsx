'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ContentItem } from '@/features/categories/types/category.types';
import { ContentCard } from '@/components/girisimco/content-card';
import { FavoriteButton } from '@/components/girisimco/marketplace/favorite-button';
import { ListingCardSkeleton } from '@/components/girisimco/ui/listing-card-skeleton';
import type { HomeListingSectionConfig } from '@/features/home/config/home-sections.config';
import type { HomeListingSectionState } from '@/features/home/types/home-section.types';
import type { ListingId } from '@/lib/domain/ids';
import { cn } from '@/lib/utils';

interface HomeListingSectionRowProps {
  config: HomeListingSectionConfig;
  state: HomeListingSectionState;
}

export function HomeListingSectionRow({ config, state }: HomeListingSectionRowProps) {
  return (
    <section className="space-y-4" aria-labelledby={`home-section-${config.id}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              config.badgeClassName,
            )}
          >
            {config.badge}
          </span>
          <div>
            <h2 id={`home-section-${config.id}`} className="gc-section-title">
              {config.title}
            </h2>
            <p className="mt-1 max-w-2xl text-gc-sm leading-relaxed text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>
        <Link
          href={config.viewAllHref}
          className="inline-flex shrink-0 items-center gap-1 text-gc-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Tümünü gör
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {state.isLoading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-[17.5rem] shrink-0">
              <ListingCardSkeleton />
            </div>
          ))}
        </div>
      ) : state.error ? (
        <p className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-gc-sm text-muted-foreground">
          {state.error}
        </p>
      ) : state.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-gc-sm text-muted-foreground">
          Bu bölümde henüz ilan bulunmuyor.
        </p>
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 snap-x snap-mandatory ib-scrollbar-none">
          {state.items.map((item) => (
            <HomeSectionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function HomeSectionCard({ item }: { item: ContentItem }) {
  return (
    <div className="relative w-[17.5rem] shrink-0 snap-start">
      <ContentCard item={item} />
      {item.listingId && (
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton listingId={item.listingId as ListingId} />
        </div>
      )}
    </div>
  );
}
