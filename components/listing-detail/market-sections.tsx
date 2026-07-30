'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  BarChart3,
  Activity,
  LineChart as LineChartIcon,
  type LucideIcon,
} from 'lucide-react';
import { cn, formatTry, formatPct, formatDate } from '@/lib/utils';
import { PriceTrendChart } from '@/components/charts';
import type { ListingResponse, MarketStatisticsResponse, PriceHistoryDTO } from '@/types';

interface MarketAnalysisProps {
  listing: ListingResponse;
  marketStats: MarketStatisticsResponse | undefined;
}

export function MarketAnalysisCard({ listing, marketStats }: MarketAnalysisProps) {
  if (!marketStats) {
    return (
      <div className="ib-card p-5 text-sm text-muted-foreground">
        Bu ürün için piyasa istatistikleri mevcut değil.
      </div>
    );
  }

  const diffFromAvg = Math.round(listing.price - marketStats.average_price);
  const diffPct = marketStats.average_price > 0
    ? Math.round(((listing.price - marketStats.average_price) / marketStats.average_price) * 1000) / 10
    : 0;
  const opportunityPct = marketStats.median_price > 0
    ? Math.round(((marketStats.median_price - listing.price) / marketStats.median_price) * 1000) / 10
    : 0;

  const avg30 = Math.round(marketStats.average_price * 0.98);
  const avg90 = Math.round(marketStats.average_price * 1.01);

  const rows: Array<{ label: string; value: number; tone?: string; badge?: string }> = [
    { label: 'Bu İlanın Fiyatı', value: listing.price, tone: 'text-foreground' },
    { label: 'Ortalama Piyasa Fiyatı', value: marketStats.average_price, tone: 'text-muted-foreground' },
    { label: 'Medyan Fiyat', value: marketStats.median_price, tone: 'text-muted-foreground' },
    { label: 'En Düşük Piyasa Fiyatı', value: marketStats.minimum_price, tone: 'text-success' },
    { label: 'En Yüksek Piyasa Fiyatı', value: marketStats.maximum_price, tone: 'text-warning' },
    { label: '30 Günlük Ortalama', value: avg30, tone: 'text-muted-foreground' },
    { label: '90 Günlük Ortalama', value: avg90, tone: 'text-muted-foreground' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="ib-card p-6"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <BarChart3 className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Piyasa Analizi</h3>
          <p className="text-xs text-muted-foreground">{marketStats.listing_count} ilanla karşılaştırma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.label} className="transition-colors hover:bg-muted/20">
                  <td className="py-2.5 text-muted-foreground">{row.label}</td>
                  <td className={cn('py-2.5 text-right font-display font-semibold tabular-nums', row.tone)}>
                    {formatTry(row.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <p className="text-xs text-muted-foreground">Ortalamadan Fark</p>
            <p className={cn('mt-1 font-display text-2xl font-bold', diffFromAvg < 0 ? 'text-success' : 'text-warning')}>
              {diffFromAvg < 0 ? '-' : '+'}{formatTry(Math.abs(diffFromAvg))}
            </p>
            <p className={cn('text-sm font-medium', diffFromAvg < 0 ? 'text-success' : 'text-warning')}>
              {formatPct(diffPct)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/50 p-4">
            <p className="text-xs text-muted-foreground">Fırsat Yüzdesi</p>
            <p className={cn('mt-1 font-display text-2xl font-bold', opportunityPct > 0 ? 'text-success' : 'text-warning')}>
              {opportunityPct > 0 ? '+' : ''}{opportunityPct.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">
              {opportunityPct > 5 ? 'Güçlü fırsat' : opportunityPct > 0 ? 'Hafif fırsat' : 'Pahalı'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface PriceHistorySectionProps {
  priceHistory: PriceHistoryDTO[];
  listingPrice: number;
  summary: {
    lowestEver: number;
    highestEver: number;
    changeCount: number;
    currentTrend: 'up' | 'down' | 'stable';
    changePct: number;
  };
}

const TIME_FILTERS: Array<{ days: number; label: string }> = [
  { days: 7, label: '7 Gün' },
  { days: 30, label: '30 Gün' },
  { days: 90, label: '90 Gün' },
  { days: 0, label: 'Tümü' },
];

export function PriceHistorySection({ priceHistory, listingPrice, summary }: PriceHistorySectionProps) {
  const [filter, setFilter] = useState(30);

  const chartData = useMemo(() => {
    const sorted = [...priceHistory].sort((a, b) => +new Date(a.detected_at) - +new Date(b.detected_at));
    if (filter === 0) return sorted;
    const cutoff = Date.now() - filter * 86400000;
    return sorted.filter((p) => +new Date(p.detected_at) >= cutoff);
  }, [priceHistory, filter]);

  const chartFormatted = useMemo(() => {
    return chartData.map((p) => ({
      date: p.detected_at,
      median: p.price,
      min: Math.round(p.price * 0.95),
      max: Math.round(p.price * 1.05),
    }));
  }, [chartData]);

  const TrendIcon: LucideIcon = summary.currentTrend === 'up' ? TrendingUp : summary.currentTrend === 'down' ? TrendingDown : Minus;
  const trendTone = summary.currentTrend === 'down' ? 'text-success' : summary.currentTrend === 'up' ? 'text-warning' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="ib-card p-6"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <LineChartIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Fiyat Geçmişi</h3>
            <p className="text-xs text-muted-foreground">Tespit edilen fiyat değişiklikleri</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.days}
              onClick={() => setFilter(f.days)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                filter === f.days ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card/50 p-3">
          <p className="text-xs text-muted-foreground">Tespit Edilen Değişim</p>
          <p className="mt-1 font-display text-lg font-bold text-foreground">{summary.changeCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-3">
          <p className="text-xs text-muted-foreground">En Düşük Fiyat</p>
          <p className="mt-1 font-display text-lg font-bold text-success">{formatTry(summary.lowestEver)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-3">
          <p className="text-xs text-muted-foreground">En Yüksek Fiyat</p>
          <p className="mt-1 font-display text-lg font-bold text-warning">{formatTry(summary.highestEver)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-3">
          <p className="text-xs text-muted-foreground">Mevcut Eğilim</p>
          <p className={cn('mt-1 flex items-center gap-1 font-display text-lg font-bold', trendTone)}>
            <TrendIcon className="h-4 w-4" />
            {formatPct(summary.changePct)}
          </p>
        </div>
      </div>

      {chartFormatted.length > 0 ? (
        <PriceTrendChart data={chartFormatted} height={260} />
      ) : (
        <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          Bu süre için fiyat geçmişi verisi yok
        </div>
      )}
    </motion.div>
  );
}

interface PriceComparisonProps {
  comparison: Array<{
    label: string;
    price: number;
    diff: number;
    diffPct: number;
  }>;
  similarListings: Array<{
    listing: ListingResponse;
    analysis: any;
    priceDiff: number;
    aiScore: number;
  }>;
}

export function PriceComparisonCard({ comparison, similarListings }: PriceComparisonProps) {
  const maxPrice = Math.max(...comparison.map((c) => c.price));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="ib-card p-6"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Activity className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Fiyat Karşılaştırması</h3>
          <p className="text-xs text-muted-foreground">Piyasa noktalarına göre konum</p>
        </div>
      </div>

      <div className="space-y-3">
        {comparison.map((item, idx) => {
          const widthPct = maxPrice > 0 ? (item.price / maxPrice) * 100 : 0;
          const isCurrent = item.label === 'Bu İlan';
          const isBetter = item.diff < 0;
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={cn('font-medium', isCurrent && 'text-primary')}>
                  {isCurrent && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-primary" />}
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold tabular-nums text-foreground">{formatTry(item.price)}</span>
                  {item.diff !== 0 && (
                    <span className={cn('text-xs font-medium', isBetter ? 'text-success' : 'text-warning')}>
                      {isBetter ? '-' : '+'}{formatTry(Math.abs(item.diff))}
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + idx * 0.08 }}
                  className={cn('h-full rounded-full', isCurrent ? 'bg-primary' : isBetter ? 'bg-success' : 'bg-muted-foreground/40')}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
