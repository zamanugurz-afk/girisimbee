'use client';

import { useState } from 'react';
import { BarChart3, Activity, TrendingDown, Percent } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { SectionCard } from '@/components/data-display/section-card';
import { StatCard } from '@/components/data-display/stat-card';
import { PriceTrendChart, BarSeriesChart, DonutChart } from '@/components/charts';
import { ChartSkeleton, StatCardSkeleton } from '@/components/feedback/skeletons';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/feedback/motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePriceHistoryQuery, useMarketStatsQuery } from '@/lib/queries';
import { PRODUCT_MODELS, PROVIDERS, CATEGORIES } from '@/config/site';
import { formatTry, formatPct } from '@/lib/utils';
import { OWNER_ROUTE } from '@/config/site';
import type { MarketStats } from '@/types';

export default function AnalyticsPage() {
  const [productId, setProductId] = useState('pm-ps5');
  const { data: history, isLoading: histLoading } = usePriceHistoryQuery(productId);
  const { data: stats } = useMarketStatsQuery();

  const product = PRODUCT_MODELS.find((p) => p.id === productId);
  const stat = stats?.find((s) => s.productModelId === productId);

  const categoryData = CATEGORIES.map((c) => {
    const items = stats?.filter((s) => PRODUCT_MODELS.find((p) => p.id === s.productModelId)?.categoryId === c.id) ?? [];
    return {
      name: c.name.split(' ')[0],
      value: items.reduce((a, s) => a + s.sampleCount, 0),
    };
  });

  const topDeals = (stats ?? [])
    .map((s) => ({
      name: PRODUCT_MODELS.find((p) => p.id === s.productModelId)?.name ?? '',
      value: Math.round(((s.medianPriceTry - s.minPriceTry) / s.medianPriceTry) * 100),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Analitik"
        description="Takip edilen ürünlerde fiyat eğilimleri, piyasa dağılımı ve fırsat derinliği."
        crumbs={[{ label: 'Panel', href: OWNER_ROUTE }, { label: 'Analitik' }]}
      />

      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatCard
            label="Takip edilen model"
            value={PRODUCT_MODELS.length}
            hint={`${CATEGORIES.length} kategori`}
            icon={Activity}
            tone="primary"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Ort. yayılma"
            value={stats ? `${Math.round(stats.reduce((a, s) => a + ((s.maxPriceTry - s.minPriceTry) / s.medianPriceTry) * 100, 0) / stats.length)}%` : '—'}
            hint="Min-maks fiyat aralığı"
            icon={Percent}
            tone="warning"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Toplam örnek"
            value={stats ? stats.reduce((a, s) => a + s.sampleCount, 0) : 0}
            hint="Tüm kaynaklarda"
            icon={TrendingDown}
            tone="success"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Aktif kaynak"
            value={PROVIDERS.length}
            hint="Hepsi İstanbul'da senkronize"
            icon={Activity}
            tone="primary"
          />
        </StaggerItem>
      </StaggerGroup>

      <FadeIn delay={0.1}>
        <SectionCard
          title="Fiyat geçmişi"
          description="30 günlük medyan, min/maks bantlarıyla"
          icon={Activity}
          actions={
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="h-8 w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_MODELS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        >
          {histLoading ? (
            <ChartSkeleton />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-4">
                <Metric label="Medyan" value={formatTry(stat?.medianPriceTry ?? 0)} tone="primary" />
                <Metric label="En düşük" value={formatTry(stat?.minPriceTry ?? 0)} tone="success" />
                <Metric label="En yüksek" value={formatTry(stat?.maxPriceTry ?? 0)} tone="warning" />
                <Metric
                  label="30g eğilim"
                  value={formatPct(stat?.trendPct30d ?? 0)}
                  tone={stat && stat.trendPct30d > 0 ? 'warning' : 'success'}
                />
              </div>
              {history && <PriceTrendChart data={history} height={300} />}
            </>
          )}
        </SectionCard>
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.15}>
          <SectionCard title="Modele göre fırsat derinliği" description="Medyan ile en düşük fiyat arasındaki indirim" icon={TrendingDown}>
            <BarSeriesChart data={topDeals} color="success" height={280} valueFormatter={(v) => `${v}%`} />
          </SectionCard>
        </FadeIn>

        <FadeIn delay={0.2}>
          <SectionCard title="Kategoriye göre ilanlar" description="Kategori başına örnek hacmi" icon={Activity}>
            <DonutChart data={categoryData} height={280} />
          </SectionCard>
        </FadeIn>
      </div>

      <FadeIn delay={0.25}>
        <SectionCard title="Piyasa ısı haritası" description="Takip edilen her model için medyan fiyat" icon={BarChart3} noPadding bodyClassName="p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {stats?.map((s, i) => {
              const p = PRODUCT_MODELS.find((m) => m.id === s.productModelId)!;
              const ratio = (s.medianPriceTry - s.minPriceTry) / s.medianPriceTry;
              return (
                <FadeIn key={s.productModelId} delay={i * 0.03}>
                  <div className="rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/30">
                    <p className="truncate text-xs font-medium text-foreground">{p.name}</p>
                    <p className="mt-1.5 font-display text-lg font-semibold">{formatTry(s.medianPriceTry)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px]">
                        {s.sampleCount} ilan
                      </Badge>
                      <span className="text-[11px] font-medium text-success">
                        -{Math.round(ratio * 100)}%
                      </span>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </SectionCard>
      </FadeIn>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning';
}) {
  const cls = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
  }[tone];
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-display text-lg font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
