'use client';

import { motion } from 'framer-motion';
import {
  Heart,
  MapPin,
  Star,
  Clock,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import type { Listing } from '@/types';
import { PRODUCT_MAP } from '@/config/site';
import { cn, formatTry, formatPct, timeAgo, initials } from '@/lib/utils';
import { useFavorites } from '@/hooks/use-favorites';
import { openListingSource } from '@/lib/listing-source';
import { ListingSourceTextButton } from '@/components/data-display/listing-source-actions';
import {
  DealScoreBadge,
  RiskBadge,
  ConditionBadge,
  ProviderBadge,
  VerifiedTick,
} from '@/components/data-display/badges';
import { toast } from 'sonner';
import { useState } from 'react';

interface ListingCardProps {
  listing: Listing;
  delay?: number;
}

export function ListingCard({ listing, delay = 0 }: ListingCardProps) {
  const product = PRODUCT_MAP[listing.productModelId];
  const { isFavorite, toggle } = useFavorites();
  const isFav = isFavorite(listing.id);
  const [imgError, setImgError] = useState(false);

  const positive = listing.priceVsMarketPct <= 0;

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(listing.id);
    toast(isFav ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi', {
      description: product?.name,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -4 }}
      onClick={() => openListingSource(listing)}
      className={cn(
        'ib-card ib-card-hover group relative flex cursor-pointer flex-col overflow-hidden p-4',
        listing.flagged && 'border-danger/40',
      )}
    >
      <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-muted/70 to-muted/30">
        {!imgError && listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.title}
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

        <div className="absolute left-2 top-2 flex gap-1.5">
          <ProviderBadge providerId={listing.providerId} className="backdrop-blur-sm" />
        </div>

        <button
          onClick={toggleFav}
          aria-label={isFav ? 'Favorilerden çıkar' : 'Favoriye ekle'}
          className={cn(
            'absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200',
            isFav
              ? 'bg-danger text-danger-foreground shadow-soft'
              : 'bg-background/80 text-foreground hover:bg-background',
          )}
        >
          <Heart className={cn('h-4 w-4', isFav && 'fill-current')} />
        </button>

        {listing.flagged && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-danger/90 px-2 py-0.5 text-[10px] font-semibold text-danger-foreground backdrop-blur-sm">
            <AlertTriangle className="h-2.5 w-2.5" />
            İşaretli
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
            {listing.title}
          </h3>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{product?.name}</p>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="font-display text-xl font-semibold tracking-tight text-foreground">
              {formatTry(listing.priceTry)}
            </p>
            <p
              className={cn(
                'mt-0.5 flex items-center gap-1 text-xs font-medium',
                positive ? 'text-success' : 'text-warning',
              )}
            >
              {positive ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {formatPct(listing.priceVsMarketPct)} piyasa karşıtı
            </p>
          </div>
          <DealScoreBadge score={listing.dealScore} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <ConditionBadge grade={listing.condition} />
          {listing.seller.riskLevel !== 'low' && (
            <RiskBadge level={listing.seller.riskLevel} />
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-[10px] font-semibold text-primary">
              {initials(listing.seller.displayName)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="truncate text-xs font-medium text-foreground">
                  {listing.seller.displayName}
                </span>
                {listing.seller.verified && <VerifiedTick verified />}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                {listing.seller.rating.toFixed(1)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo(listing.postedAt)}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {listing.district}, {listing.city}
        </div>
      </div>

      <ListingSourceTextButton
        listing={listing}
        label="Kaynakta gör"
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background py-2 text-xs font-medium text-foreground opacity-0 transition-opacity duration-200 hover:bg-muted group-hover:opacity-100"
        trailingIcon="external"
      />
    </motion.article>
  );
}
