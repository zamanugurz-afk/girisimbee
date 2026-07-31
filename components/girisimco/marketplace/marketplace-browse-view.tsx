'use client';

import Link from 'next/link';
import { resolveCategorySlug, getCategoryRoutePath } from '@/features/listings/config/marketplace.config';
import { useMarketplaceBrowse } from '@/features/listings/hooks/use-marketplace-browse';
import { ListingFilters } from '@/components/girisimco/marketplace/listing-filters';
import { ListingFeedInfinite } from '@/components/girisimco/marketplace/listing-feed-infinite';
import { MarketplaceSearchBar } from '@/components/girisimco/marketplace/marketplace-search-bar';
import { Button } from '@/components/ui/button';

interface MarketplaceBrowsePageProps {
  categorySlug?: string;
  initialQuery?: string;
  title?: string;
  description?: string;
  accent?: string;
  hideCategoryFilter?: boolean;
}

export function MarketplaceBrowseView({
  categorySlug,
  initialQuery,
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
  });

  return (
    <div className="gc-header-offset">
      <div className="relative border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 gc-dot-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
          {categoryMeta && (
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: resolvedAccent }}
            >
              {categoryMeta.label}
            </p>
          )}
          <h1 className="gc-page-heading mt-1">
            {title ?? categoryMeta?.label ?? (initialQuery ? `"${initialQuery}" araması` : 'İlanları Keşfet')}
          </h1>
          {(description ?? categoryMeta?.description) && (
            <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
              {description ?? categoryMeta?.description}
            </p>
          )}
          <div className="mt-6 max-w-xl">
            <MarketplaceSearchBar defaultQuery={initialQuery ?? filters.query} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
        <ListingFilters
          filters={filters}
          onChange={updateFilters}
          hideCategory={hideCategoryFilter ?? Boolean(categorySlug)}
          className="mb-6"
        />

        {!isLoading && !error && (
          <p className="mb-4 text-xs text-muted-foreground">
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
            filters.query || filters.categorySlug || filters.city
              ? 'Bu filtrelere uygun ilan bulunmuyor.'
              : undefined
          }
        />

        {categorySlug && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border/80 pt-8 dark:border-white/10">
            <span className="text-xs text-muted-foreground">Diğer kategoriler:</span>
            {['yatirim-bul', 'yatirim-yap', 'is-bul', 'ise-al', 'ortak-bul']
              .filter((s) => s !== categorySlug)
              .map((slug) => {
                const meta = resolveCategorySlug(slug);
                if (!meta) return null;
                return (
                  <Link
                    key={slug}
                    href={getCategoryRoutePath(slug)}
                    className="rounded-full border border-border/80 px-3 py-1 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-primary/25 hover:bg-muted/50 hover:text-foreground"
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
