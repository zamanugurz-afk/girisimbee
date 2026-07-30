'use client';

import { useState } from 'react';
import { Search, Heart } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ListingsFilters } from '@/components/data-display/listings-filters';
import { GroupedProductCard } from '@/components/data-display/grouped-product-card';
import { CardGridSkeleton } from '@/components/feedback/skeletons';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { StaggerGroup, StaggerItem } from '@/components/feedback/motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFilteredGroupedProducts, useListingsQuery } from '@/lib/queries';
import { useFavorites } from '@/hooks/use-favorites';
import { OWNER_ROUTE } from '@/config/site';

export default function ListingsPage() {
  const [tab, setTab] = useState<'all' | 'favorites'>('all');

  const { isError, refetch } = useListingsQuery();
  const { data: groupedProducts, isLoading } = useFilteredGroupedProducts();
  const groups = groupedProducts ?? [];
  const { favoriteIds } = useFavorites();

  const shown =
    tab === 'favorites'
      ? groups.filter((group) => group.listingIds.some((id) => favoriteIds.has(id)))
      : groups;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Search}
        title="Tüm İlanlar"
        description="İstanbul'daki tüm kaynaklardan toplanan her ilanı tarayın ve filtreleyin."
        crumbs={[{ label: 'Panel', href: OWNER_ROUTE }, { label: 'İlanlar' }]}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | 'favorites')}>
        <TabsList>
          <TabsTrigger value="all">
            <Search className="mr-1.5 h-3.5 w-3.5" />
            Tüm ilanlar
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="mr-1.5 h-3.5 w-3.5" />
            Favoriler
            {favoriteIds.size > 0 && (
              <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">
                {favoriteIds.size}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ListingsFilters resultCount={shown.length} />

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <CardGridSkeleton count={8} />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={tab === 'favorites' ? Heart : Search}
          title={tab === 'favorites' ? 'Henüz favori yok' : 'Filtrelerinize uyan ürün yok'}
          description={
            tab === 'favorites'
              ? 'Favorilediğiniz ilanlar gruplu ürün kartlarında burada görünür.'
              : 'Daha fazla sonuç görmek için filtrelerinizi ayarlayın veya temizleyin.'
          }
        />
      ) : (
        <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((group) => (
            <StaggerItem key={group.id}>
              <GroupedProductCard group={group} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
