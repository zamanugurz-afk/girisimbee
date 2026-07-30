'use client';

import { useRouter } from 'next/navigation';
import { Heart, Trash2, MapPin, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { SectionCard } from '@/components/data-display/section-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { CardGridSkeleton } from '@/components/feedback/skeletons';
import { ErrorState } from '@/components/feedback/error-state';
import { StaggerGroup, StaggerItem } from '@/components/feedback/motion';
import { useFavorites } from '@/hooks/use-favorites';
import { useQuery } from '@tanstack/react-query';
import { computeAIAnalyses, computeMarketStats, fetchActiveProducts, fetchListings } from '@/lib/queries';
import { OWNER_ROUTE } from '@/config/site';
import { formatTry, timeAgo, cn } from '@/lib/utils';
import {
  handleListingRowClick,
  ListingSourceIconButton,
} from '@/components/data-display/listing-source-actions';
import { toast } from 'sonner';
import type { ListingResponse } from '@/types';

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, isLoading, isRemoving, remove } = useFavorites();

  const listingsQ = useQuery({ queryKey: ['listings'], queryFn: fetchListings });
  const productsQ = useQuery({ queryKey: ['active-products'], queryFn: fetchActiveProducts });

  const listings = listingsQ.data ?? [];
  const products = productsQ.data ?? [];
  const stats = computeMarketStats(listings, products);
  const analyses = computeAIAnalyses(listings, stats, {});
  const analysisMap = new Map(analyses.map((a) => [a.listing_id, a]));

  const favListings = favorites
    .map((favorite) => {
      const listingFromJoin = favorite.listing as ListingResponse | null | undefined;
      const listing =
        listingFromJoin ??
        listings.find((l) => l.id === favorite.listing_id);
      if (!listing) return null;
      return { favorite, listing };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const removeFavorite = (favoriteId: string, listing: ListingResponse) => {
    remove(favoriteId);
    toast('Favorilerden çıkarıldı', { description: listing.product?.name });
  };

  const pageLoading = isLoading || listingsQ.isLoading;
  const pageError = listingsQ.isError;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Heart}
        title="Favoriler"
        description="Kaydettiğiniz ilanlar — fiyat değişiklikleri ve güncellemeleri buradan takip edin."
        crumbs={[{ label: 'Panel', href: OWNER_ROUTE }, { label: 'Favoriler' }]}
      />

      {pageError ? (
        <ErrorState onRetry={() => listingsQ.refetch()} />
      ) : pageLoading ? (
        <CardGridSkeleton count={4} />
      ) : favListings.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Henüz favori yok"
          description="Hızlı erişim için herhangi bir ilandaki kalbe dokunarak favorilere ekleyin."
          action={{ label: 'İlanlara göz at', onClick: () => router.push(`${OWNER_ROUTE}/listings`) }}
        />
      ) : (
        <SectionCard noPadding bodyClassName="p-0">
          <div className="divide-y divide-border">
            <StaggerGroup>
              {favListings.map(({ favorite, listing }) => {
                const ai = analysisMap.get(listing.id);
                return (
                  <StaggerItem key={favorite.id}>
                    <div
                      className="group flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
                      onClick={() => handleListingRowClick(listing)}
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                        {listing.image_urls[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={listing.image_urls[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Heart className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{listing.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{listing.product?.name}</p>
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {listing.district}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(listing.first_seen_at)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-display text-sm font-bold tabular-nums text-foreground">{formatTry(listing.price)}</p>
                        {ai && (
                          <p className={cn('text-[10px] font-semibold', ai.opportunity_score >= 80 ? 'text-success' : 'text-muted-foreground')}>
                            AI: {ai.opportunity_score}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <ListingSourceIconButton
                          listing={listing}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Kaynakta gör"
                        />
                        <button
                          disabled={isRemoving}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(favorite.id, listing);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-danger-soft hover:border-danger/30 hover:text-danger"
                          aria-label="Favorilerden çıkar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>
        </SectionCard>
      )}

      {favListings.length > 0 && (
        <p className="text-xs text-muted-foreground">{favListings.length} favori ilan</p>
      )}
    </div>
  );
}
