'use client';

import { useState } from 'react';
import { Sparkles, Clock, Package, TrendingDown, TrendingUp, BarChart3, ShieldCheck } from 'lucide-react';
import type { GroupedProductDetailView } from '@/lib/grouped-product-detail';
import { formatTry, formatPct, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const DEAL_TONE: Record<string, string> = {
  'Excellent Deal': 'border-success/30 bg-success-soft text-success',
  'Good Deal': 'border-primary/30 bg-primary-soft text-primary',
  'Fair Price': 'border-border bg-secondary text-muted-foreground',
  Expensive: 'border-warning/30 bg-warning-soft text-warning',
  Overpriced: 'border-danger/30 bg-danger-soft text-danger',
};

interface GroupedProductHeaderProps {
  product: GroupedProductDetailView;
}

export function GroupedProductHeader({ product }: GroupedProductHeaderProps) {
  const [imgError, setImgError] = useState(false);
  const dealLabel = product.dealScore?.label_display ?? 'Fair Price';

  return (
    <section className="ib-card overflow-hidden">
      <div className="grid gap-6 p-5 lg:grid-cols-[280px_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-muted/70 to-muted/30">
          {!imgError && product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Sparkles className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.productFamilyLabel}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn('font-medium', DEAL_TONE[dealLabel])}>
                {dealLabel}
                {product.dealScore?.deal_percentage != null && (
                  <span className="ml-1">{formatPct(product.dealScore.deal_percentage)}</span>
                )}
              </Badge>
              <Badge variant="outline" className="gap-1 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                {product.trustLabel} · {product.trustScore}/100
              </Badge>
              <Badge variant="outline">{product.marketplaceCount} pazaryeri</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <Metric icon={TrendingDown} label="En düşük" value={formatTry(product.lowestPrice)} tone="success" />
            <Metric icon={BarChart3} label="Ortalama" value={formatTry(product.averagePrice)} />
            <Metric icon={BarChart3} label="Medyan" value={formatTry(product.medianPrice)} />
            <Metric icon={TrendingUp} label="En yüksek" value={formatTry(product.highestPrice)} tone="warning" />
            <Metric icon={Package} label="İlan sayısı" value={String(product.listingCount)} />
            <Metric icon={Clock} label="Son güncelleme" value={timeAgo(product.lastUpdated)} compact />
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
  compact,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  tone?: 'success' | 'warning';
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p
        className={cn(
          'mt-1 font-semibold text-foreground',
          compact ? 'text-xs leading-snug' : 'text-sm',
          tone === 'success' && 'text-success',
          tone === 'warning' && 'text-warning',
        )}
      >
        {value}
      </p>
    </div>
  );
}
