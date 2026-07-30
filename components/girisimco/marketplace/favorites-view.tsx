'use client';

import { useFavoritesList } from '@/features/favorites/hooks/use-favorites';
import { ListingFeedInfinite } from '@/components/girisimco/marketplace/listing-feed-infinite';
import { MarketplaceEmptyState } from '@/components/girisimco/marketplace/marketplace-empty-state';
import { Button } from '@/components/ui/button';
import { loginUrl } from '@/features/authentication/constants/routes';

export function FavoritesView() {
  const {
    isAuthenticated,
    items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refresh,
  } = useFavoritesList();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 pt-28 text-center">
        <MarketplaceEmptyState
          variant="favorites"
          title="Favorilerinizi görmek için giriş yapın."
          description="Giriş yaptıktan sonra kaydettiğiniz ilanlar burada listelenecek."
          cta={{ label: 'Giriş Yap', href: loginUrl('/favoriler') }}
        />
      </div>
    );
  }

  return (
    <div className="pt-14">
      <div className="border-b border-border/80">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Favorilerim
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Kaydettiğiniz ilanlar</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {!isLoading && !error && total > 0 && (
          <p className="mb-4 text-xs text-muted-foreground">{total} ilan</p>
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
          hasMore={hasMore}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
          emptyVariant="favorites"
        />
      </div>
    </div>
  );
}
