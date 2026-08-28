'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountShowcaseCard } from '@/features/account/components/AccountShowcaseCard';
import { AccountShowcaseEmpty } from '@/features/account/components/AccountShowcaseEmpty';
import { AccountShowcaseStats } from '@/features/account/components/AccountShowcaseStats';
import {
  OpportunityCard,
  OpportunityCardGrid,
} from '@/components/girisimco/ui/opportunity-card';
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

const BENEFIT_PACKAGES = [
  {
    id: 'standard',
    label: 'Standart İlan Paketi',
    description: 'Temel ilan yayınlama ve ekosistemle buluşma paketi.',
    Icon: Briefcase,
    color: '#10B981',
    benefits: [
      {
        title: '30 Günlük Kesintisiz Yayın',
        text: 'İlanınız 30 gün boyunca platformda aktif kalır.',
      },
      {
        title: 'Arama & Kategori Dizini',
        text: 'İlgili tüm sektör filtrelerinde listelenir.',
      },
      {
        title: 'Doğrudan İletişim & Başvuru',
        text: 'İlgilenen kullanıcılar doğrudan talep gönderebilir.',
      },
    ],
    href: '/ilan/olustur',
    ctaLabel: 'Yeni İlan Ver',
  },
  {
    id: 'urgent',
    label: 'Süper İlan Paketi',
    description: 'Aramalarda ve Keşfet sayfasında en üstte yer alın.',
    Icon: Zap,
    color: '#E11D48',
    benefits: [
      {
        title: 'En Üst Sıra Listelenme',
        text: 'Tüm aramalarda ve Keşfet sayfasında en üst sırada listelenir.',
      },
      {
        title: 'Özel "Süper İlan" Rozeti',
        text: 'Kırmızı flaş rozetiyle tüm dikkatleri anında üzerinize çekin.',
      },
      {
        title: 'Maksimum Dönüşüm & Hızlı Sonuç',
        text: 'İlanınıza anında daha fazla başvuru ve iletişim talebi alın.',
      },
    ],
    href: '/dashboard/ilanlarim',
    ctaLabel: 'Süper İlan Yap',
  },
] as const;

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
    <div className="space-y-10">
      {/* Front Benefit Package Cards */}
      <div>
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            Paket & Doping Seçenekleri
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            İlanlarınızın görünürlüğünü ve etkileşimini artırmak için sunulan paketler.
          </p>
        </div>

        <div className="mt-8">
          <OpportunityCardGrid columns={3}>
            {BENEFIT_PACKAGES.map((pkg) => (
              <OpportunityCard
                key={pkg.id}
                option={{
                  id: pkg.id,
                  label: pkg.label,
                  description: pkg.description,
                  benefits: pkg.benefits,
                  href: pkg.href,
                  ctaLabel: pkg.ctaLabel,
                }}
                visual={{
                  color: pkg.color,
                  Icon: pkg.Icon,
                }}
              />
            ))}
          </OpportunityCardGrid>
        </div>
      </div>

      {/* Active Packages & Placements Section */}
      <div className="space-y-6 pt-4 border-t border-slate-200/80 dark:border-zinc-800">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            Aktif Vitrin Paketleriniz
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Satın aldığınız veya aktif olan vitrin paketlerinizin süre ve performans takibi.
          </p>
        </div>

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
                <div className="rounded-2xl border border-dashed border-border/80 px-6 py-12 text-center text-sm text-muted-foreground dark:border-white/10">
                  Bu sekmede aktif vitrin paketi bulunamadı.
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {visible.length} paket listeleniyor
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
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
    </div>
  );
}
