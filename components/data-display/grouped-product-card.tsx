'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import type { GroupedProductView } from '@/lib/grouped-product-view';
import { PRODUCT_MAP } from '@/config/site';
import { groupedProductUrl } from '@/lib/nav';
import { cn, formatTry } from '@/lib/utils';
import { ProviderBadge } from '@/components/data-display/badges';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { openListingSource } from '@/lib/listing-source';

interface GroupedProductCardProps {
  group: GroupedProductView;
  delay?: number;
}

export function GroupedProductCard({ group, delay = 0 }: GroupedProductCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const product = group.productModelId ? PRODUCT_MAP[group.productModelId] : null;
  const showCompare = group.marketplaceCount > 1;
  const detailUrl = groupedProductUrl(group.id);

  const openOffer = (sourceUrl: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!sourceUrl) return;
    openListingSource({ source_url: sourceUrl });
  };

  const openDetail = () => {
    router.push(detailUrl);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -4 }}
      className="ib-card ib-card-hover group relative flex cursor-pointer flex-col overflow-hidden p-4"
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetail();
        }
      }}
      role="link"
      tabIndex={0}
    >
      <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-muted/70 to-muted/30">
        {!imgError && group.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={group.imageUrl}
            alt={group.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-muted-foreground shadow-soft ring-1 ring-border">
              <Sparkles className="h-7 w-7" />
            </div>
          </div>
        )}

        {group.offers[0] && (
          <div className="absolute left-2 top-2 flex gap-1.5">
            <ProviderBadge providerId={group.offers[0].providerId} className="backdrop-blur-sm" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{group.name}</h3>
        {product && (
          <p className="mt-0.5 text-xs text-muted-foreground">{product.brand}</p>
        )}

        <div className="mt-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            En düşük fiyat
          </p>
          <p className="font-display text-xl font-semibold tracking-tight text-foreground">
            {formatTry(group.lowestPrice)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {group.marketplaceCount} pazaryerinde bulundu
          </p>
        </div>

        {showCompare && (
          <Collapsible
            open={compareOpen}
            onOpenChange={setCompareOpen}
            className="mt-4"
            onClick={(event) => event.stopPropagation()}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted">
              <span>Fiyatları karşılaştır</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform duration-200',
                  compareOpen && 'rotate-180',
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1.5">
              {group.offers.map((offer) => (
                <button
                  key={`${group.id}-${offer.providerId}`}
                  type="button"
                  onClick={(event) => openOffer(offer.sourceUrl, event)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:bg-muted"
                >
                  <ProviderBadge providerId={offer.providerId} />
                  <span className="text-sm font-semibold text-foreground">
                    {formatTry(offer.price)}
                  </span>
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {!showCompare && group.offers[0] && (
          <button
            type="button"
            onClick={(event) => openOffer(group.offers[0]!.sourceUrl, event)}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            Kaynakta gör
          </button>
        )}
      </div>
    </motion.article>
  );
}
