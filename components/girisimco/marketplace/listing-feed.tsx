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

  const total = items.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative">
      {items.map((item, idx) => {
        const isNotLastColLg = (idx + 1) % 4 !== 0 && idx !== total - 1;
        const isNotLastColMd = (idx + 1) % 3 !== 0 && idx !== total - 1;
        const isNotLastColSm = (idx + 1) % 2 !== 0 && idx !== total - 1;

        return (
          <div key={item.id} className="relative flex flex-col h-full">
            <ContentCard item={item} accent={accent} />

            {/* Masaüstü 4 Kolon Dikey Ayrım Çizgisi */}
            {isNotLastColLg && (
              <div className="hidden lg:block absolute -right-3 top-3 bottom-3 w-[1px] bg-slate-200/90 dark:bg-zinc-800 pointer-events-none" />
            )}

            {/* Orta Boy 3 Kolon Dikey Ayrım Çizgisi */}
            {isNotLastColMd && (
              <div className="hidden md:block lg:hidden absolute -right-3 top-3 bottom-3 w-[1px] bg-slate-200/90 dark:bg-zinc-800 pointer-events-none" />
            )}

            {/* Tablet 2 Kolon Dikey Ayrım Çizgisi */}
            {isNotLastColSm && (
              <div className="hidden sm:block md:hidden absolute -right-3 top-3 bottom-3 w-[1px] bg-slate-200/90 dark:bg-zinc-800 pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ListingFeed;
