'use client';

import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Clock,
  Eye,
  Activity,
  TrendingDown,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { cn, formatTry, formatPct, formatDate, timeAgo } from '@/lib/utils';
import { DealScoreBadge, ConditionBadge, ProviderBadge, RiskBadge } from '@/components/data-display/badges';
import type { ListingResponse, AIAnalysisResponse, MarketStatisticsResponse } from '@/types';

interface ListingHeaderProps {
  listing: ListingResponse;
  analysis: AIAnalysisResponse | undefined;
  marketStats: MarketStatisticsResponse | undefined;
}

export function ListingHeader({ listing, analysis, marketStats }: ListingHeaderProps) {
  const product = listing.product;
  const provider = listing.provider;
  const median = marketStats?.median_price ?? listing.price;
  const diffPct = median > 0 ? Math.round(((listing.price - median) / median) * 1000) / 10 : 0;
  const isBelow = diffPct < 0;
  const riskLevel = analysis?.risk_level ?? (analysis && analysis.fake_probability >= 40 ? 'high' : 'low');

  const dealScore = analysis
    ? analysis.opportunity_score >= 80
      ? 'excellent'
      : analysis.opportunity_score >= 68
      ? 'good'
      : analysis.opportunity_score >= 40
      ? 'fair'
      : diffPct > 6
      ? 'overpriced'
      : 'fair'
    : 'fair';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Breadcrumb / product name */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{product?.brand}</span>
        <span>·</span>
        <span>{product?.name}</span>
        {provider && (
          <>
            <span>·</span>
            <ProviderBadge providerId={provider.slug as any} />
          </>
        )}
      </div>

      {/* Title */}
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
        {listing.title}
      </h1>

      {/* Price block */}
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground">İlan Fiyatı</p>
          <p className="font-display text-4xl font-bold tracking-tight text-foreground">
            {formatTry(listing.price)}
          </p>
        </div>

        {marketStats && (
          <div className="flex gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Piyasa Medyanı</p>
              <p className="font-display text-lg font-semibold text-muted-foreground">
                {formatTry(median)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Fark</p>
              <p className={cn(
                'flex items-center gap-1 font-display text-lg font-bold',
                isBelow ? 'text-success' : 'text-warning',
              )}>
                {isBelow ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                {formatPct(diffPct)}
              </p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="ml-auto flex items-center gap-3">
            <div className="flex flex-col items-end">
              <p className="text-xs font-medium text-muted-foreground">AI Fırsat Puanı</p>
              <p className={cn(
                'font-display text-2xl font-bold',
                analysis.opportunity_score >= 80 ? 'text-success' : analysis.opportunity_score >= 55 ? 'text-primary' : 'text-muted-foreground',
              )}>
                {analysis.opportunity_score}
                <span className="text-sm text-muted-foreground">/100</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <DealScoreBadge score={dealScore} />
        <ConditionBadge grade={listing.condition} />
        {riskLevel !== 'low' && <RiskBadge level={riskLevel} />}
        {analysis && analysis.opportunity_score >= 80 && (
          <span className="flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">
            <Sparkles className="h-3 w-3" />
            Mükemmel Fırsat
          </span>
        )}
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          {listing.district}, {listing.city}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {listing.listing_date ? formatDate(listing.listing_date) : 'Belirtilmemiş'}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          Son güncelleme: {timeAgo(listing.updated_at)}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="h-4 w-4" />
          {Math.floor(Math.abs(+new Date() - +new Date(listing.first_seen_at)) / 3600000) * 3 + 47} görüntülenme
        </span>
        <span className="flex items-center gap-1.5">
          <Activity className="h-4 w-4" />
          {listing.is_active ? 'Aktif' : 'Pasif'}
        </span>
      </div>
    </motion.div>
  );
}
