'use client';

import { useMemo, useState } from 'react';
import { LineChart as LineChartIcon, AlertTriangle, Sparkles } from 'lucide-react';
import type { GroupedProductDetailView } from '@/lib/grouped-product-detail';
import type { GroupedPriceHistoryPeriod } from '@/types';
import { useGroupedProductPriceHistory } from '@/lib/queries';
import { SectionCard } from '@/components/data-display/section-card';
import { PriceTrendChart } from '@/components/charts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/feedback/spinner';

const PERIODS: { value: GroupedPriceHistoryPeriod; label: string }[] = [
  { value: '7d', label: '7 gün' },
  { value: '30d', label: '30 gün' },
  { value: '90d', label: '90 gün' },
];

interface GroupedPriceHistorySectionProps {
  groupId: string;
}

export function GroupedPriceHistorySection({ groupId }: GroupedPriceHistorySectionProps) {
  const [period, setPeriod] = useState<GroupedPriceHistoryPeriod>('30d');
  const { data, isLoading } = useGroupedProductPriceHistory(groupId, period);

  const chartData = useMemo(
    () =>
      (data ?? []).map((row) => ({
        date: row.snapshot_date,
        median: row.average_price,
        min: row.lowest_price,
        max: row.highest_price,
      })),
    [data],
  );

  return (
    <SectionCard
      title="Fiyat geçmişi"
      description="Günlük piyasa ortalaması ve fiyat aralığı"
      icon={LineChartIcon}
    >
      <Tabs value={period} onValueChange={(value) => setPeriod(value as GroupedPriceHistoryPeriod)}>
        <TabsList className="mb-4">
          {PERIODS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size={24} />
        </div>
      ) : chartData.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Bu dönem için fiyat geçmişi henüz oluşmadı.
        </p>
      ) : (
        <PriceTrendChart data={chartData} height={280} />
      )}
    </SectionCard>
  );
}

interface GroupedProductIntelligenceProps {
  product: GroupedProductDetailView;
}

export function GroupedProductIntelligence({ product }: GroupedProductIntelligenceProps) {
  const distribution = useMemo(() => {
    const prices = product.listings.map((row) => row.price).sort((a, b) => a - b);
    if (prices.length === 0) return [];

    const min = prices[0]!;
    const max = prices[prices.length - 1]!;
    const span = Math.max(max - min, 1);
    const bucketCount = Math.min(5, prices.length);
    const buckets = Array.from({ length: bucketCount }, (_, index) => ({
      name: `${index + 1}`,
      value: 0,
    }));

    for (const price of prices) {
      const ratio = (price - min) / span;
      const index = Math.min(bucketCount - 1, Math.floor(ratio * bucketCount));
      buckets[index]!.value += 1;
    }

    return buckets.map((bucket, index) => ({
      name: index === 0 ? 'Düşük' : index === bucketCount - 1 ? 'Yüksek' : `Orta ${index}`,
      value: bucket.value,
    }));
  }, [product.listings]);

  const dealPct = product.dealScore?.deal_percentage ?? 0;
  const aiSummary =
    dealPct <= -10
      ? `${product.name} piyasasının altında fiyatlanmış aktif ilanlar var. Güven puanı ${product.trustScore}/100 seviyesinde.`
      : dealPct >= 5
        ? `${product.name} için fiyatlar piyasa ortalamasının üzerinde. Karşılaştırmalı alışveriş önerilir.`
        : `${product.name} fiyatları piyasa ortalamasına yakın seyrediyor. Güven puanı ${product.trustScore}/100.`;

  const riskLevel =
    product.trustScore >= 70 ? 'Düşük' : product.trustScore >= 45 ? 'Orta' : 'Yüksek';

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SectionCard title="AI özeti" icon={Sparkles}>
        <p className="text-sm leading-relaxed text-foreground">{aiSummary}</p>
      </SectionCard>

      <SectionCard title="Risk analizi" icon={AlertTriangle}>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <dt className="text-muted-foreground">Güven seviyesi</dt>
            <dd className="font-semibold text-foreground">{product.trustLabel}</dd>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <dt className="text-muted-foreground">Risk</dt>
            <dd className="font-semibold text-foreground">{riskLevel}</dd>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <dt className="text-muted-foreground">Aktif ilan</dt>
            <dd className="font-semibold text-foreground">{product.listingCount}</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard
        title="Fiyat dağılımı"
        description="Aktif ilanların fiyat aralığı"
        icon={LineChartIcon}
        className="lg:col-span-2"
      >
        {distribution.length === 0 ? (
          <p className="text-sm text-muted-foreground">Dağılım için yeterli ilan yok.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {distribution.map((bucket) => (
              <div key={bucket.name} className="rounded-xl border border-border bg-background/60 p-3 text-center">
                <p className="text-xs text-muted-foreground">{bucket.name}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{bucket.value}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
