'use client';

import { BarChart3 } from 'lucide-react';
import type { GroupedProductDetailView } from '@/lib/grouped-product-detail';
import { SectionCard } from '@/components/data-display/section-card';
import { formatTry } from '@/lib/utils';

interface MarketSummaryProps {
  product: GroupedProductDetailView;
}

export function MarketSummary({ product }: MarketSummaryProps) {
  return (
    <SectionCard title="Piyasa özeti" description="Bu ürün grubundaki fiyat dağılımı" icon={BarChart3}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryMetric label="Ortalama fiyat" value={formatTry(product.averagePrice)} />
        <SummaryMetric label="Medyan fiyat" value={formatTry(product.medianPrice)} />
        <SummaryMetric label="Fiyat farkı" value={formatTry(product.priceDifference)} />
        <SummaryMetric label="İlan sayısı" value={String(product.listingCount)} />
      </div>
    </SectionCard>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
