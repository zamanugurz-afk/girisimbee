'use client';

import { motion } from 'framer-motion';
import {
  Star,
  ArrowRight,
  Trophy,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { cn, formatTry, formatPct } from '@/lib/utils';
import {
  handleListingRowClick,
  ListingSourceIconButton,
  ListingSourceTextButton,
} from '@/components/data-display/listing-source-actions';
import type { ListingResponse, AIAnalysisResponse } from '@/types';

interface SimilarListingsProps {
  similarListings: Array<{
    listing: ListingResponse;
    analysis: AIAnalysisResponse | undefined;
    priceDiff: number;
    aiScore: number;
  }>;
  currentPrice: number;
  currentScore: number;
  onListingClick?: (listing: ListingResponse) => void;
}

export function SimilarListingsTable({ similarListings, currentPrice, currentScore, onListingClick }: SimilarListingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="ib-card overflow-hidden"
    >
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Trophy className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Benzer İlanlar</h3>
          <p className="text-xs text-muted-foreground">Aynı ürün — karşılaştırma tablosu</p>
        </div>
      </div>

      {similarListings.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">
          Karşılaştırılacak benzer ilan bulunamadı
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Görsel</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Kaynak</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Fiyat</th>
                <th className="hidden px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground sm:table-cell">İlçe</th>
                <th className="hidden px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground md:table-cell">Satıcı</th>
                <th className="hidden px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground md:table-cell">AI</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Fark</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Aç</th>
              </tr>
            </thead>
            <tbody>
              {similarListings.map((item, idx) => {
                const { listing, analysis, priceDiff, aiScore } = item;
                const provider = listing.provider;
                const seller = listing.seller;
                const isBetter = priceDiff < 0 && aiScore >= currentScore - 5;
                return (
                  <motion.tr
                    key={listing.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    onClick={() => handleListingRowClick(listing)}
                    className={cn(
                      'border-b border-border/50 transition-colors hover:bg-muted/30',
                      onListingClick && 'cursor-pointer',
                      isBetter && 'bg-success-soft/10',
                    )}
                  >
                    <td className="px-3 py-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-muted/40">
                        {listing.image_urls[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={listing.image_urls[0]} alt={listing.title} className="h-full w-full object-cover" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium text-foreground">{provider?.name ?? '—'}</span>
                    </td>
                    <td className="px-3 py-3 text-right font-display font-bold tabular-nums text-foreground">
                      {formatTry(listing.price)}
                    </td>
                    <td className="hidden px-3 py-3 text-xs text-muted-foreground sm:table-cell">
                      {listing.district}
                    </td>
                    <td className="hidden px-3 py-3 text-xs text-muted-foreground md:table-cell">
                      <div className="flex items-center gap-1">
                        <span>{seller?.display_name ?? '—'}</span>
                        {seller && (seller.phone_verified || seller.email_verified) && (
                          <ShieldCheck className="h-3 w-3 text-success" />
                        )}
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 text-right md:table-cell">
                      <span className={cn(
                        'font-bold tabular-nums',
                        aiScore >= 80 ? 'text-success' : aiScore >= 55 ? 'text-primary' : 'text-muted-foreground',
                      )}>
                        {aiScore}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={cn(
                        'text-xs font-bold tabular-nums',
                        priceDiff < 0 ? 'text-success' : priceDiff > 0 ? 'text-warning' : 'text-muted-foreground',
                      )}>
                        {priceDiff < 0 ? '-' : '+'}{formatTry(Math.abs(priceDiff))}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <ListingSourceIconButton
                        listing={listing}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
                        aria-label="Kaynağı aç"
                      />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

interface BetterAlternativesProps {
  betterAlternatives: Array<{
    listing: ListingResponse;
    analysis: AIAnalysisResponse | undefined;
    priceDiff: number;
    aiScore: number;
  }>;
  productName: string;
  currentPrice: number;
  onListingClick?: (listing: ListingResponse) => void;
}

export function BetterAlternativesSection({ betterAlternatives, productName, currentPrice, onListingClick }: BetterAlternativesProps) {
  if (betterAlternatives.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="ib-card flex items-center gap-3 border-l-4 border-l-success p-4"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-soft text-success">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Daha iyi alternatif bulunamadı</p>
          <p className="text-xs text-muted-foreground">Bu ilan şu an bu ürün için en iyi seçeneklerden biri</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-soft text-warning">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Daha İyi Alternatifler</h3>
          <p className="text-xs text-muted-foreground">AI daha avantajlı ilanlar tespit etti</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {betterAlternatives.map((alt, idx) => {
          const { listing, analysis, priceDiff, aiScore } = alt;
          const savingPct = currentPrice > 0 ? Math.round((Math.abs(priceDiff) / currentPrice) * 1000) / 10 : 0;
          return (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              onClick={() => handleListingRowClick(listing)}
              className={cn(
                'ib-card ib-card-hover border-l-4 border-l-success p-4',
                onListingClick && 'cursor-pointer',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-success" />
                  <span className="text-xs font-bold uppercase tracking-wide text-success">Daha İyi</span>
                </div>
                <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success">
                  -{savingPct}%
                </span>
              </div>

              <p className="mt-2 truncate text-sm font-bold text-foreground">{listing.title}</p>
              <p className="text-xs text-muted-foreground">{listing.provider?.name} · {listing.district}</p>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="font-display text-lg font-bold text-foreground">{formatTry(listing.price)}</p>
                  <p className="text-xs font-medium text-success">
                    {formatTry(Math.abs(priceDiff))} daha ucuz
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold text-foreground">{aiScore}</p>
                  <p className="text-[10px] text-muted-foreground">AI puanı</p>
                </div>
              </div>

              <ListingSourceTextButton
                listing={listing}
                label="İlanı aç"
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                trailingIcon="arrow"
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
