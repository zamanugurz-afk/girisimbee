'use client';

import { useHomepageData } from '@/hooks/use-homepage-data';
import { HomepageSummaryCards } from '@/components/homepage/homepage-summary-cards';
import { HomepageFilters } from '@/components/homepage/homepage-filters';
import { HomepageBestDealsTable } from '@/components/homepage/homepage-best-deals-table';
import { ErrorState } from '@/components/feedback/error-state';

export default function HomePage() {
  const { summary, bestDeals, filterOptions, isLoading, isError, refetch } = useHomepageData();

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ErrorState title="Ana sayfa yüklenemedi" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          İkinci El Pazar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Son 30 gündeki aktif ilanlar · gruplu ürün karşılaştırması
        </p>
      </div>

      <HomepageSummaryCards summary={summary} isLoading={isLoading} />
      <HomepageFilters options={filterOptions} />
      <HomepageBestDealsTable groups={bestDeals} isLoading={isLoading} />
    </div>
  );
}
