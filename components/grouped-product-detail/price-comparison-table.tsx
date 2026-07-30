'use client';

import { ExternalLink } from 'lucide-react';
import type { GroupedProductDetailView } from '@/lib/grouped-product-detail';
import { SectionCard } from '@/components/data-display/section-card';
import { ProviderBadge } from '@/components/data-display/badges';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTry, formatPct, formatDate, cn } from '@/lib/utils';
import { openListingSource } from '@/lib/listing-source';

const DEAL_TONE: Record<string, string> = {
  'Excellent Deal': 'border-success/30 bg-success-soft text-success',
  'Good Deal': 'border-primary/30 bg-primary-soft text-primary',
  'Fair Price': 'border-border bg-secondary text-muted-foreground',
  Expensive: 'border-warning/30 bg-warning-soft text-warning',
  Overpriced: 'border-danger/30 bg-danger-soft text-danger',
};

interface PriceComparisonTableProps {
  listings: GroupedProductDetailView['listings'];
}

export function PriceComparisonTable({ listings }: PriceComparisonTableProps) {
  return (
    <SectionCard
      title="Fiyat karşılaştırması"
      description="Tüm pazaryerlerindeki ilanlar, en düşük fiyata göre sıralı"
      noPadding
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Pazaryeri</th>
              <th className="px-5 py-3 font-medium">Fiyat</th>
              <th className="px-5 py-3 font-medium">Konum</th>
              <th className="px-5 py-3 font-medium">Satıcı</th>
              <th className="px-5 py-3 font-medium">Fırsat puanı</th>
              <th className="px-5 py-3 font-medium">Güven puanı</th>
              <th className="px-5 py-3 font-medium">İlan tarihi</th>
              <th className="px-5 py-3 font-medium">İlan</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((row) => (
              <tr
                key={row.listingId}
                className={cn(
                  'border-b border-border/70 transition-colors hover:bg-muted/30',
                  row.isCheapest && 'bg-success-soft/40',
                )}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <ProviderBadge providerId={row.providerId} />
                    {row.isCheapest && (
                      <Badge variant="outline" className="border-success/30 bg-success-soft text-success">
                        En ucuz
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-foreground">{formatTry(row.price)}</td>
                <td className="px-5 py-4 text-muted-foreground">{row.location || '—'}</td>
                <td className="px-5 py-4 text-foreground">{row.sellerName}</td>
                <td className="px-5 py-4">
                  <Badge variant="outline" className={cn('font-medium', DEAL_TONE[row.dealLabel])}>
                    {row.dealLabel}
                    <span className="ml-1">{formatPct(row.dealPercentage)}</span>
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <span className="font-medium text-foreground">{row.trustScore}/100</span>
                  <span className="ml-2 text-xs text-muted-foreground">{row.trustLabel}</span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{formatDate(row.listingDate)}</td>
                <td className="px-5 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={() => openListingSource({ source_url: row.sourceUrl })}
                  >
                    Aç
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
