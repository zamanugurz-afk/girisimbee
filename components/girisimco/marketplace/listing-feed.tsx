'use client';

import type { ContentItem } from '@/features/categories/types/category.types';
import { ContentCard } from '@/components/girisimco/content-card';
import { FavoriteButton } from '@/components/girisimco/marketplace/favorite-button';
import {
  MarketplaceEmptyState,
  type MarketplaceEmptyVariant,
} from '@/components/girisimco/marketplace/marketplace-empty-state';
import type { ListingId } from '@/lib/domain/ids';

interface ListingFeedProps {
  items: ContentItem[];
  accent?: string;
  emptyVariant?: MarketplaceEmptyVariant;
  emptyMessage?: string;
}

export function ListingFeed({
  items,
  accent,
  emptyVariant = 'listings',
  emptyMessage,
}: ListingFeedProps) {
  if (items.length === 0) {
    return (
      <MarketplaceEmptyState
        variant={emptyVariant}
        title={emptyMessage}
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="relative h-full">
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
