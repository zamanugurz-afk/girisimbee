'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountFavoriteCard } from '@/features/account/components/AccountFavoriteCard';
import { AccountFavoritesEmpty } from '@/features/account/components/AccountFavoritesEmpty';
import { AccountFavoritesFilter } from '@/features/account/components/AccountFavoritesFilter';
import {
  countFavoritesByTab,
  filterAccountFavorites,
} from '@/features/account/lib/filter-account-favorites';
import { ACCOUNT_FAVORITES_TABS } from '@/features/account/types/account-favorites.constants';
import type { AccountFavoritesPageLoadResult } from '@/features/account/types/account-favorites-page.types';
import type {
  AccountFavoriteCardData,
  AccountFavoritesFilterState,
  AccountFavoritesTab,
} from '@/features/account/types/account-favorites.types';
import { getFavoriteListingService } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import { cn } from '@/lib/utils';

const DEFAULT_FILTERS: AccountFavoritesFilterState = {
  query: '',
  dateRange: 'all',
  sort: 'newest',
};

const TAB_EMPTY_COPY: Record<
  AccountFavoritesTab,
  { title: string; description: string; ctaHref: string; ctaLabel: string }
> = {
  ilanlar: {
    title: 'Henüz favori listeniz boş.',
    description:
      'İlgilendiğiniz ilanları favorilerinize ekleyerek daha sonra kolayca ulaşabilirsiniz.',
    ctaHref: '/kesfet',
    ctaLabel: 'İlanları keşfet',
  },
  girisimler: {
    title: 'Henüz favori listeniz boş.',
    description:
      'İlgilendiğiniz girişim ilanlarını favorilerinize ekleyerek daha sonra kolayca ulaşabilirsiniz.',
    ctaHref: '/girisim-ortaklik',
    ctaLabel: 'Girişimleri keşfet',
  },
  sirketler: {
    title: 'Henüz favori listeniz boş.',
    description:
      'İlgilendiğiniz şirket ve franchise ilanlarını favorilerinize ekleyerek daha sonra kolayca ulaşabilirsiniz.',
    ctaHref: '/is',
    ctaLabel: 'Şirketleri keşfet',
  },
  yatirimcilar: {
    title: 'Henüz favori listeniz boş.',
    description:
      'İlgilendiğiniz yatırımcı ilanlarını favorilerinize ekleyerek daha sonra kolayca ulaşabilirsiniz.',
    ctaHref: '/investors',
    ctaLabel: 'Yatırımcıları keşfet',
  },
};

export function AccountFavorites({
  userId,
  initial,
}: {
  userId: string;
  initial: AccountFavoritesPageLoadResult;
}) {
  const [loadError] = useState<string | null>(
    initial.ok ? null : initial.error,
  );
  const [items, setItems] = useState<AccountFavoriteCardData[]>(
    initial.ok ? initial.data : [],
  );
  const [tab, setTab] = useState<AccountFavoritesTab>('ilanlar');
  const [filters, setFilters] = useState<AccountFavoritesFilterState>(DEFAULT_FILTERS);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => countFavoritesByTab(items), [items]);

  const visible = useMemo(
    () => filterAccountFavorites(items, tab, filters),
    [items, tab, filters],
  );

  const tabItems = useMemo(
    () => items.filter((item) => item.contentKind === tab),
    [items, tab],
  );

  async function removeIds(listingIds: string[]) {
    if (listingIds.length === 0 || busy) return;
    setBusy(true);
    try {
      const service = getFavoriteListingService();
      const uid = ids.user(userId);
      await Promise.all(
        listingIds.map((listingId) =>
          service.removeFavorite(uid, ids.listing(listingId)),
        ),
      );
      setItems((prev) => prev.filter((item) => !listingIds.includes(item.id)));
      toast.success(
        listingIds.length === 1
          ? 'Favorilerden kaldırıldı'
          : `${listingIds.length} favori kaldırıldı`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Favori kaldırılamadı.';
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  function handleShare(title: string, href: string) {
    const url =
      typeof window !== 'undefined' ? `${window.location.origin}${href}` : href;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      void navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(url).catch(() => undefined);
      toast.success('Bağlantı panoya kopyalandı');
    }
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-10 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Favoriler yüklenemedi
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-5 rounded-2xl"
          onClick={() => window.location.reload()}
        >
          Yeniden dene
        </Button>
      </div>
    );
  }

  const emptyCopy = TAB_EMPTY_COPY[tab];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {items.length === 0
            ? 'Henüz favori yok'
            : `${visible.length} / ${tabItems.length} favori gösteriliyor`}
        </p>
        {tabItems.length > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-2xl text-destructive hover:text-destructive"
            disabled={busy}
            onClick={() => void removeIds(tabItems.map((item) => item.id))}
          >
            Bu sekmeyi temizle
          </Button>
        ) : null}
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as AccountFavoritesTab);
          setFilters(DEFAULT_FILTERS);
        }}
      >
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted/40 p-1.5 dark:bg-white/[0.04]">
          {ACCOUNT_FAVORITES_TABS.map((item) => {
            const Icon = item.icon;
            const count = counts[item.id];
            return (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className={cn(
                  'gap-2 rounded-xl px-3 py-2.5 text-sm data-[state=active]:shadow-sm',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{item.label}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[11px] tabular-nums',
                    count > 0
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {ACCOUNT_FAVORITES_TABS.map((item) => (
          <TabsContent key={item.id} value={item.id} className="mt-6 space-y-5">
            {tabItems.length > 0 ? (
              <AccountFavoritesFilter value={filters} onChange={setFilters} />
            ) : null}

            {tabItems.length === 0 ? (
              <AccountFavoritesEmpty {...emptyCopy} />
            ) : visible.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 px-6 py-12 text-center text-sm text-muted-foreground dark:border-white/10">
                Bu filtrelerle eşleşen favori bulunamadı.
              </div>
            ) : (
              <div className="grid gap-4">
                {visible.map((favorite) => (
                  <AccountFavoriteCard
                    key={favorite.id}
                    item={favorite}
                    busy={busy}
                    onRemove={() => void removeIds([favorite.id])}
                    onShare={() =>
                      handleShare(favorite.listingTitle, favorite.listingHref)
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
