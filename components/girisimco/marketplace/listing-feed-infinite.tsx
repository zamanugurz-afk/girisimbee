'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { ListingFeed } from '@/components/girisimco/marketplace/listing-feed';
import { ListingFeedSkeleton } from '@/components/girisimco/ui/listing-card-skeleton';
import type { MarketplaceEmptyVariant } from '@/components/girisimco/marketplace/marketplace-empty-state';
import type { ContentItem } from '@/features/categories/types/category.types';

interface ListingFeedInfiniteProps {
  items: ContentItem[];
  accent?: string;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  emptyVariant?: MarketplaceEmptyVariant;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyCta?: { label: string; href: string };
}

export function ListingFeedInfinite({
  items,
  accent,
  hasMore,
  isLoading,
  isLoadingMore,
  onLoadMore,
  emptyVariant,
  emptyMessage,
  emptyDescription,
  emptyCta,
}: ListingFeedInfiniteProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (isLoading) {
    return <ListingFeedSkeleton count={6} />;
  }

  return (
    <div>
      <ListingFeed
        items={items}
        accent={accent}
        emptyVariant={emptyVariant}
        emptyMessage={emptyMessage}
        emptyDescription={emptyDescription}
        emptyCta={emptyCta}
      />
      <div ref={sentinelRef} className="h-4" aria-hidden />
      {isLoadingMore && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary/60" />
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">Tüm ilanlar yüklendi</p>
      )}
    </div>
  );
}
