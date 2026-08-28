'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
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
  AccountListingStatus,
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
  const [listings, setListings] = useState<AccountListingCardData[]>(
    initial.ok ? initial.data : [],
  );
  const [tab, setTab] = useState<AccountListingsTab>('all');
  const [filters, setFilters] = useState<AccountListingsFilterState>(DEFAULT_FILTERS);

  const visible = useMemo(
    () => filterAccountListings(listings, tab, filters),
    [listings, tab, filters],
  );

  const handleStatusChange = (id: string, newStatus: AccountListingStatus) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)),
    );
  };

  const handleDelete = (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePromote = (id: string) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isShowcase: true } : item)),
    );
  };

  if (loadError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-10 text-center">
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as AccountListingsTab)}
          className="w-full sm:w-auto"
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
        </Tabs>

        <Button asChild className="rounded-xl font-medium gap-1.5 shrink-0 self-start sm:self-auto">
          <Link href="/ilan/olustur">
            <Plus className="h-4 w-4" />
            <span>Yeni İlan Ver</span>
          </Link>
        </Button>
      </div>

      <AccountListingFilters value={filters} onChange={setFilters} />

      {listings.length === 0 ? (
        <AccountListingsEmpty />
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 px-6 py-12 text-center text-sm text-muted-foreground dark:border-zinc-800">
          Bu filtrelerle eşleşen ilan bulunamadı.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>{visible.length} ilan listeleniyor</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
            {visible.map((listing) => (
              <AccountListingCard
                key={listing.id}
                listing={listing}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onPromote={handlePromote}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
