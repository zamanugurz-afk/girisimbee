'use client';

import { Sparkles, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/page-header';
import { ListingCard } from '@/components/data-display/listing-card';
import { CardGridSkeleton } from '@/components/feedback/skeletons';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { StaggerGroup, StaggerItem } from '@/components/feedback/motion';
import { Button } from '@/components/ui/button';
import { useListingsQuery } from '@/lib/queries';
import { OWNER_ROUTE } from '@/config/site';
import type { Listing } from '@/types';

export default function DealsPage() {
  const qc = useQueryClient();

  const { data: listings, isLoading, isError, refetch } = useListingsQuery();

  const deals = listings
    ? listings
        .filter((l: Listing) => l.dealScore === 'excellent' || l.dealScore === 'good')
        .sort((a: Listing, b: Listing) => a.priceVsMarketPct - b.priceVsMarketPct)
    : [];

  const handleRefresh = () => {
    refetch();
    qc.invalidateQueries({ queryKey: ['listings'] });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Sparkles}
        title="Fırsat Akışı"
        description="Yapay zeka sıralamasıyla alım fırsatları — her ilanın piyasanın ne kadar altında olduğuna göre sıralı."
        crumbs={[{ label: 'Panel', href: OWNER_ROUTE }, { label: 'Fırsat Akışı' }]}
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Yenile
          </Button>
        }
      />

      {isError ? (
        <ErrorState onRetry={handleRefresh} />
      ) : isLoading ? (
        <CardGridSkeleton count={6} />
      ) : deals.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Şu an fırsat yok"
          description="Yeni ilanlar tarandığında fırsatlar burada görünecek. Kısa süre sonra tekrar kontrol edin."
          action={{ label: 'Yenile', onClick: handleRefresh }}
        />
      ) : (
        <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {deals.map((listing: Listing) => (
            <StaggerItem key={listing.id}>
              <ListingCard listing={listing} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
