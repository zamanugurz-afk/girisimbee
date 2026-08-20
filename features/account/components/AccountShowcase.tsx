'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, CheckCircle2, Sparkles, Zap, ArrowRight } from 'lucide-react';
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

const BENEFIT_PACKAGES = [
  {
    id: 'standard',
    title: 'Standart İlan Paketi',
    subtitle: 'Temel ilan yayınlama ve ekosistemle buluşma paketi.',
    icon: Briefcase,
    color: '#10b981',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-500/20',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    features: [
      {
        title: '30 Günlük Kesintisiz Yayın',
        desc: 'İlanınız 30 gün boyunca platformda aktif kalır.',
      },
      {
        title: 'Arama & Kategori Dizini',
        desc: 'İlgili tüm sektör filtrelerinde listelenir.',
      },
      {
        title: 'Doğrudan İletişim & Başvuru',
        desc: 'İlgilenen kullanıcılar doğrudan talep gönderebilir.',
      },
    ],
    cta: { label: 'Yeni İlan Ver', href: '/ilan/olustur' },
  },
  {
    id: 'showcase',
    title: 'Vitrin İlanı (Öne Çıkan)',
    subtitle: 'Ana sayfa ve kategori vitrininde en üstte yer alın.',
    icon: Sparkles,
    color: '#d97706',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-500/20',
    buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    features: [
      {
        title: 'En Üst Sıra Listelenme',
        desc: 'Ana sayfa ve kategori en üstünde yer alır.',
      },
      {
        title: '5 Kata Kadar Fazla Görüntülenme',
        desc: 'Vitrin rozetiyle 5 kat daha fazla etkileşim alın.',
      },
      {
        title: 'Altın Vitrin Rozeti',
        desc: 'Özel çerçeve ve vitrin etiketiyle öne çıkar.',
      },
    ],
    cta: { label: 'İlanı Vitrine Taşı', href: '/dashboard/ilanlarim' },
  },
  {
    id: 'urgent',
    title: 'Acil Vitrin Dopingi',
    subtitle: 'Hızlı sonuç almak için kırmızı flaş acil dopingi.',
    icon: Zap,
    color: '#e11d48',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-700 dark:text-rose-400',
    borderColor: 'border-rose-500/20',
    buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white',
    features: [
      {
        title: 'Kırmızı Flaş "Acil" Rozeti',
        desc: 'Aramalarda ilk sırada kırmızı acil etiketiyle parlar.',
      },
      {
        title: 'Öncelikli Eşleşme Bildirimi',
        desc: 'İlgili yatırımcı ve adaylara anında iletilir.',
      },
      {
        title: 'Maksimum Dönüşüm Oranı',
        desc: 'Acil arayan kitleye doğrudan ulaşır.',
      },
    ],
    cta: { label: 'Acil Doping Uygula', href: '/dashboard/ilanlarim' },
  },
];

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {BENEFIT_PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <div>
                  <div className="flex items-center justify-center">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl ${pkg.bgColor} shadow-2xs`}
                    >
                      <Icon className="h-8 w-8" style={{ color: pkg.color }} />
                    </div>
                  </div>

                  <h3 className="mt-5 text-center font-display text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                    {pkg.title}
                  </h3>
                  <p className="mt-1.5 text-center text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                    {pkg.subtitle}
                  </p>

                  <div className="mt-6 space-y-4 border-t border-slate-100 dark:border-zinc-800 pt-5">
                    {pkg.features.map((feat) => (
                      <div key={feat.title} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 mt-0.5"
                          style={{ color: pkg.color }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {feat.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                            {feat.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <Button
                    asChild
                    className={`w-full h-10 rounded-xl font-bold text-xs gap-1.5 shadow-sm ${pkg.buttonColor}`}
                  >
                    <Link href={pkg.cta.href}>
                      <span>{pkg.cta.label}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
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
