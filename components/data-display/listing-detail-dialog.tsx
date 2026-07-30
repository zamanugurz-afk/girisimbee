'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sparkles,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import type { Listing } from '@/types';
import { PRODUCT_MAP, PROVIDER_MAP } from '@/config/site';
import { buildListingInsight } from '@/lib/listing-insight';
import { formatTry, formatPct, timeAgo, initials, cn } from '@/lib/utils';
import {
  DealScoreBadge,
  RiskBadge,
  ConditionBadge,
  ProviderBadge,
  VerifiedTick,
} from '@/components/data-display/badges';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ListingSourceTextButton } from '@/components/data-display/listing-source-actions';

export function ListingDetailDialog({
  listing,
  open,
  onOpenChange,
}: {
  listing: Listing | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!listing) return null;
  const product = PRODUCT_MAP[listing.productModelId];
  const provider = PROVIDER_MAP[listing.providerId];
  const insight = buildListingInsight(listing);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <ProviderBadge providerId={listing.providerId} />
            <span className="text-xs text-muted-foreground">{product?.name}</span>
          </div>
          <DialogTitle className="pr-8 text-lg">{listing.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {formatTry(listing.priceTry)} · {listing.district}, {listing.city} ·{' '}
            {timeAgo(listing.postedAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          {/* AI verdict */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'rounded-xl border p-4',
              insight.shouldBuy
                ? 'border-success/30 bg-success-soft/40'
                : 'border-warning/30 bg-warning-soft/40',
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  insight.shouldBuy ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground',
                )}
              >
                {insight.shouldBuy ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <p className="text-sm font-semibold">
                    {insight.shouldBuy ? 'Yapay zeka almanızı öneriyor' : 'Yapay zeka beklemenizi öneriyor'}
                  </p>
                  <span className="ml-auto text-xs font-medium text-muted-foreground">
                    %{insight.confidence} güven
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Price analysis */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="İlan fiyatı" value={formatTry(listing.priceTry)} />
            <Stat
              label="Piyasaya göre"
              value={formatPct(listing.priceVsMarketPct)}
              tone={listing.priceVsMarketPct <= 0 ? 'success' : 'warning'}
            />
            <Stat label="Piyasa medyanı" value={formatTry(product?.refPriceTry ?? 0)} />
            <Stat
              label="Sahte riski"
              value={`%${insight.fakeProbability}`}
              tone={insight.fakeProbability > 30 ? 'danger' : 'success'}
            />
          </div>

          {/* Reasons */}
          <div className="mt-5">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-warning" />
              Bu kararın nedeni
            </p>
            <ul className="space-y-2">
              {insight.reasons.map((reason, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground"
                >
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {reason}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Seller trust */}
          <div className="mt-5 rounded-xl border border-border p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Satıcı güven analizi
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                {initials(listing.seller.displayName)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{listing.seller.displayName}</span>
                  <VerifiedTick verified={listing.seller.verified} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {listing.seller.memberSince} tarihinden beri üye ·{' '}
                  {listing.seller.totalSales} satış · {provider?.name}
                </p>
              </div>
              <RiskBadge level={listing.seller.riskLevel} />
            </div>
          </div>

          {/* Badges + offer */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <DealScoreBadge score={listing.dealScore} />
            <ConditionBadge grade={listing.condition} />
            {listing.negotiable && (
              <span className="rounded-full border border-primary/30 bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                Pazarlık edilebilir
              </span>
            )}
          </div>

          {insight.suggestedOfferTry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex items-center gap-2 rounded-lg bg-primary-soft px-3 py-2 text-sm"
            >
              <TrendingDown className="h-4 w-4 text-primary" />
              Önerilen teklif: <span className="font-semibold text-primary">{formatTry(insight.suggestedOfferTry)}</span>
            </motion.div>
          )}

          {insight.betterListings.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Bu model için {insight.betterListings.length} daha iyi ilan bulundu.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
          <ListingSourceTextButton
            listing={listing}
            label={`${provider?.name ?? 'Kaynak'} üzerinde gör`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            trailingIcon="none"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const toneClass = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  }[tone];
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-sm font-semibold', toneClass)}>{value}</p>
    </div>
  );
}
