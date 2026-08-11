'use client';

import Link from 'next/link';
import { resolveCategorySlug, getCategoryRoutePath } from '@/features/listings/config/marketplace.config';
import { useMarketplaceBrowse } from '@/features/listings/hooks/use-marketplace-browse';
import type { MarketplaceFilterState } from '@/features/listings/types/marketplace.types';
import { ListingFilters } from '@/components/girisimco/marketplace/listing-filters';
import { ListingFeedInfinite } from '@/components/girisimco/marketplace/listing-feed-infinite';
import { MarketplaceSearchBar } from '@/components/girisimco/marketplace/marketplace-search-bar';
import { Button } from '@/components/ui/button';

interface MarketplaceBrowsePageProps {
  categorySlug?: string;
  initialQuery?: string;
  initialFilters?: Partial<MarketplaceFilterState>;
  title?: string;
  description?: string;
  accent?: string;
  hideCategoryFilter?: boolean;
}

export function MarketplaceBrowseView({
  categorySlug,
  initialQuery,
  initialFilters,
  title,
  description,
  accent,
  hideCategoryFilter,
}: MarketplaceBrowsePageProps) {
  const categoryMeta = categorySlug ? resolveCategorySlug(categorySlug) : null;
  const resolvedAccent = accent ?? categoryMeta?.accent;

  const {
    items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    filters,
    updateFilters,
    loadMore,
    refresh,
  } = useMarketplaceBrowse({
    initialCategorySlug: categorySlug,
    initialQuery,
    initialFilters,
  });

  return (
    <div className="gc-header-offset bg-[#FAFBFC] dark:bg-background">
      <div className="relative border-b border-[#EEF0F4] bg-white dark:border-border dark:bg-background">
        <div className="relative mx-auto max-w-[1280px] px-5 py-8 lg:px-8 lg:py-10">
          {categoryMeta && (
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: resolvedAccent }}
            >
              {categoryMeta.label}
            </p>
          )}
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-3xl">
            {title ?? categoryMeta?.label ?? (initialQuery ? `"${initialQuery}" araması` : 'İlanları Keşfet')}
          </h1>
          {(description ?? categoryMeta?.description) && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
              {description ?? categoryMeta?.description}
            </p>
          )}
          <div className="mt-6 max-w-xl">
            <MarketplaceSearchBar defaultQuery={initialQuery ?? filters.query} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 py-6 lg:px-8 lg:py-8">
        <ListingFilters
          filters={filters}
          onChange={updateFilters}
          hideCategory={hideCategoryFilter ?? Boolean(categorySlug)}
          className="mb-5"
        />

        {!isLoading && !error && (
          <p className="mb-4 text-[12px] tabular-nums text-[#64748B]">
            {total.toLocaleString('tr-TR')} ilan
          </p>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-3 rounded-lg" onClick={refresh}>
              Tekrar Dene
            </Button>
          </div>
        )}

        <ListingFeedInfinite
          items={items}
          accent={resolvedAccent}
          hasMore={hasMore}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
          emptyMessage={
            filters.query ||
            filters.categorySlug ||
            filters.city ||
            filters.isFeatured ||
            filters.isUrgent ||
            filters.publishedAfter
              ? 'Bu filtrelere uygun ilan bulunmuyor.'
              : undefined
          }
        />

        {categorySlug && (
          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-[#EEF0F4] pt-8 dark:border-border">
            <span className="text-[12px] text-[#64748B]">Diğer kategoriler:</span>
            {['yatirim-bul', 'ortak-bul', 'bayilik-al', 'ise-al', 'dijital-ai']
              .filter((s) => s !== categorySlug)
              .map((slug) => {
                const meta = resolveCategorySlug(slug);
                if (!meta) return null;
                return (
                  <Link
                    key={slug}
                    href={getCategoryRoutePath(slug)}
                    className="rounded-md border border-[#E6E8EE] bg-white px-2.5 py-1 text-[12px] font-medium text-[#475569] transition-colors hover:border-[#C7CBD6] hover:text-[#0B1220] dark:border-border dark:bg-card"
                  >
                    {meta.label}
                  </Link>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
