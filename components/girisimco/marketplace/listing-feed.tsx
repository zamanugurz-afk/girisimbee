'use client';

import type { ContentItem } from '@/features/categories/types/category.types';
import { ContentCard } from '@/components/girisimco/content-card';
import { FavoriteButton } from '@/components/girisimco/marketplace/favorite-button';
import {
  MarketplaceEmptyState,
  type MarketplaceEmptyVariant,
} from '@/components/girisimco/marketplace/marketplace-empty-state';
import type { ListingId } from '@/lib/domain/ids';
import { cn } from '@/lib/utils';

interface ListingFeedProps {
  items: ContentItem[];
  accent?: string;
  emptyVariant?: MarketplaceEmptyVariant;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyCta?: { label: string; href: string };
}

export function ListingFeed({
  items,
  accent,
  emptyVariant = 'listings',
  emptyMessage,
  emptyDescription,
  emptyCta,
}: ListingFeedProps) {
  if (items.length === 0) {
    return (
      <MarketplaceEmptyState
        variant={emptyVariant}
        title={emptyMessage}
        description={emptyDescription}
        cta={emptyCta}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 lg:gap-y-8 sm:divide-x divide-slate-200 dark:divide-zinc-800">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={cn(
            'relative h-full',
            idx % 4 === 0
              ? 'sm:pr-4 lg:pr-3 sm:pl-0'
              : idx % 4 === 3
              ? 'sm:pl-4 lg:pl-3 sm:pr-0'
              : 'sm:px-4 lg:px-3'
          )}
        >
          <ContentCard item={item} accent={accent} />
          {item.listingId && (
            <div className="absolute right-3 top-3 z-10">
              <FavoriteButton listingId={item.listingId as ListingId} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
