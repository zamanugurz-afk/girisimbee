'use client';

import type { ContentItem } from '@/features/categories/types/category.types';
import { ContentCard } from '@/components/girisimco/content-card';
import {
  MarketplaceEmptyState,
  type MarketplaceEmptyVariant,
} from '@/components/girisimco/marketplace/marketplace-empty-state';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item) => (
        <div key={item.id} className="relative h-full">
          <ContentCard item={item} accent={accent} />
        </div>
      ))}
    </div>
  );
}
