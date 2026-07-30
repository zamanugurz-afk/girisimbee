'use client';

import { Sparkles, TrendingDown, Star, ExternalLink } from 'lucide-react';
import type { GroupedProductDetailView, GroupedListingRow } from '@/lib/grouped-product-detail';
import { SectionCard } from '@/components/data-display/section-card';
import { ProviderBadge } from '@/components/data-display/badges';
import { Button } from '@/components/ui/button';
import { formatTry, formatPct } from '@/lib/utils';
import { openListingSource } from '@/lib/listing-source';

interface DetailSidebarProps {
  product: GroupedProductDetailView;
}

export function DetailSidebar({ product }: DetailSidebarProps) {
  const listingById = new Map(product.listings.map((row) => [row.listingId, row]));

  const bestDeal = product.bestDealListingId
    ? listingById.get(product.bestDealListingId)
    : null;
  const cheapest = product.cheapestListingId
    ? listingById.get(product.cheapestListingId)
    : null;
  const recommended = product.recommendedListingId
    ? listingById.get(product.recommendedListingId)
    : null;

  return (
    <aside className="space-y-4">
      <SidebarCard
        icon={TrendingDown}
        title="En iyi fırsat"
        listing={bestDeal}
        highlight={bestDeal ? `${bestDeal.dealLabel} · ${formatPct(bestDeal.dealPercentage)}` : undefined}
      />
      <SidebarCard
        icon={Sparkles}
        title="En ucuz ilan"
        listing={cheapest}
        highlight={cheapest ? formatTry(cheapest.price) : undefined}
      />
      <SidebarCard
        icon={Star}
        title="Önerilen ilan"
        listing={recommended}
        highlight={
          recommended ? `${recommended.trustLabel} · ${recommended.trustScore}/100` : undefined
        }
      />
    </aside>
  );
}

function SidebarCard({
  icon: Icon,
  title,
  listing,
  highlight,
}: {
  icon: typeof Star;
  title: string;
  listing: GroupedListingRow | null | undefined;
  highlight?: string;
}) {
  return (
    <SectionCard title={title} icon={Icon}>
      {!listing ? (
        <p className="text-sm text-muted-foreground">Uygun ilan bulunamadı.</p>
      ) : (
        <div className="space-y-3">
          <ProviderBadge providerId={listing.providerId} />
          <div>
            <p className="text-lg font-semibold text-foreground">{formatTry(listing.price)}</p>
            {highlight && <p className="mt-1 text-xs text-muted-foreground">{highlight}</p>}
          </div>
          <p className="text-sm text-muted-foreground">{listing.sellerName}</p>
          <p className="text-xs text-muted-foreground">{listing.location}</p>
          <Button
            className="w-full gap-1.5"
            onClick={() => openListingSource({ source_url: listing.sourceUrl })}
          >
            İlanı aç
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )}
    </SectionCard>
  );
}
