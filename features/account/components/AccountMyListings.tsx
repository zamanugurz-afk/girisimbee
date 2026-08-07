'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountListingCard } from '@/features/account/components/AccountListingCard';
import { AccountListingFilters } from '@/features/account/components/AccountListingFilters';
import { AccountListingsEmpty } from '@/features/account/components/AccountListingsEmpty';
import { filterAccountListings } from '@/features/account/lib/filter-account-listings';
import { ACCOUNT_LISTINGS_TABS } from '@/features/account/types/account-listings.constants';
import type { AccountListingsPageLoadResult } from '@/features/account/types/account-listings-page.types';
import type {
  AccountListingCardData,
  AccountListingsFilterState,
  AccountListingsTab,
} from '@/features/account/types/account-listings.types';

const DEFAULT_FILTERS: AccountListingsFilterState = {
  query: '',
  category: 'Tümü',
  dateRange: 'all',
  sort: 'newest',
};

export function AccountMyListings({
  initial,
}: {
  initial: AccountListingsPageLoadResult;
}) {
  const [loadError] = useState<string | null>(
    initial.ok ? null : initial.error,
  );
  const [listings] = useState<AccountListingCardData[]>(
    initial.ok ? initial.data : [],
  );
  const [tab, setTab] = useState<AccountListingsTab>('all');
  const [filters, setFilters] = useState<AccountListingsFilterState>(DEFAULT_FILTERS);

  const visible = useMemo(
    () => filterAccountListings(listings, tab, filters),
    [listings, tab, filters],
  );

  if (loadError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-10 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">
          İlanlar yüklenemedi
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-5 rounded-lg"
          onClick={() => window.location.reload()}
        >
          Yeniden dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as AccountListingsTab)}
      >
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/40 p-1">
          {ACCOUNT_LISTINGS_TABS.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="rounded-lg px-3 py-2 text-sm"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ACCOUNT_LISTINGS_TABS.map((item) => (
          <TabsContent key={item.id} value={item.id} className="mt-6 space-y-6">
            <AccountListingFilters value={filters} onChange={setFilters} />

            {listings.length === 0 ? (
              <AccountListingsEmpty />
            ) : visible.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center text-sm text-muted-foreground dark:border-white/10">
                Bu filtrelerle eşleşen ilan bulunamadı.
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {visible.length} ilan gösteriliyor
                </p>
                <div className="space-y-4">
                  {visible.map((listing) => (
                    <AccountListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
