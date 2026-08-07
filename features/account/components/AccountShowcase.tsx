'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountShowcaseCard } from '@/features/account/components/AccountShowcaseCard';
import { AccountShowcaseEmpty } from '@/features/account/components/AccountShowcaseEmpty';
import { AccountShowcaseStats } from '@/features/account/components/AccountShowcaseStats';
import {
  buildShowcaseStats,
  filterAccountShowcases,
  formatRemainingLabel,
} from '@/features/account/lib/map-placement-to-showcase-card';
import { ACCOUNT_SHOWCASE_TABS } from '@/features/account/types/account-showcase.constants';
import type { AccountShowcasePageLoadResult } from '@/features/account/types/account-showcase-page.types';
import type {
  AccountShowcaseCardData,
  AccountShowcaseStatsData,
  AccountShowcaseTab,
} from '@/features/account/types/account-showcase.types';
import { getListingPlacementService } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import { remainingDays } from '@/features/monetization/services/listing-placement.service';

export function AccountShowcase({
  initial,
}: {
  initial: AccountShowcasePageLoadResult;
}) {
  const [loadError] = useState<string | null>(
    initial.ok ? null : initial.error,
  );
  const [items, setItems] = useState<AccountShowcaseCardData[]>(
    initial.ok ? initial.data.items : [],
  );
  const [stats, setStats] = useState<AccountShowcaseStatsData>(
    initial.ok
      ? initial.data.stats
      : {
          activePackageCount: 0,
          totalViews: 0,
          totalFavorites: 0,
          totalClicks: 0,
        },
  );
  const [tab, setTab] = useState<AccountShowcaseTab>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = useMemo(
    () => filterAccountShowcases(items, tab),
    [items, tab],
  );

  function refreshStats(nextItems: AccountShowcaseCardData[]) {
    setStats(buildShowcaseStats(nextItems));
  }

  function patchCardFromPlacement(
    placementId: string,
    endsAt: string,
    status: AccountShowcaseCardData['status'],
  ) {
    setItems((prev) => {
      const next: AccountShowcaseCardData[] = prev.map((item) => {
        if (item.id !== placementId) return item;
        const days = remainingDays(endsAt);
        const nextStatus: AccountShowcaseCardData['status'] =
          status === 'expired'
            ? 'expired'
            : days > 0 && days <= 7
              ? 'expiring'
              : days > 0
                ? 'active'
                : 'expired';
        return {
          ...item,
          endsAt,
          remainingLabel: formatRemainingLabel(days),
          status: nextStatus,
        };
      });
      refreshStats(next);
      return next;
    });
  }

  async function handleExtend(id: string) {
    if (busyId) return;
    setBusyId(id);
    try {
      const updated = await getListingPlacementService().extendPlacement(
        ids.listingPlacement(id),
      );
      patchCardFromPlacement(id, updated.expiresAt, 'active');
      toast.success('Vitrin süresi uzatıldı');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Süre uzatılamadı.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(id: string) {
    if (busyId) return;
    setBusyId(id);
    try {
      await getListingPlacementService().cancelPlacement(ids.listingPlacement(id));
      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === id
            ? { ...item, status: 'expired' as const, remainingLabel: '0 gün' }
            : item,
        );
        refreshStats(next);
        return next;
      });
      toast.success('Vitrin paketi iptal edildi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Paket iptal edilemedi.');
    } finally {
      setBusyId(null);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-10 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Vitrin paketleri yüklenemedi
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
    <div className="space-y-8">
      <AccountShowcaseStats stats={stats} />

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as AccountShowcaseTab)}
      >
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/40 p-1">
          {ACCOUNT_SHOWCASE_TABS.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="rounded-lg px-3 py-2 text-sm"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ACCOUNT_SHOWCASE_TABS.map((item) => (
          <TabsContent key={item.id} value={item.id} className="mt-6 space-y-4">
            {items.length === 0 ? (
              <AccountShowcaseEmpty />
            ) : visible.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center text-sm text-muted-foreground dark:border-white/10">
                Bu sekmede vitrin paketi bulunamadı.
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {visible.length} paket gösteriliyor
                </p>
                <div className="space-y-4">
                  {visible.map((showcase) => (
                    <AccountShowcaseCard
                      key={showcase.id}
                      item={showcase}
                      busy={busyId === showcase.id}
                      onExtend={() => void handleExtend(showcase.id)}
                      onCancel={() => void handleCancel(showcase.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
