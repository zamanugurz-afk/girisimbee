'use client';

import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Clock,
  Handshake,
  XCircle,
  Brain,
  Sparkles,
  Gem,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { cn, formatTry } from '@/lib/utils';
import type { AIAnalysisResponse, ListingResponse, MarketStatisticsResponse, Recommendation } from '@/types';

const REC_CONFIG: Record<Recommendation, {
  icon: LucideIcon;
  label: string;
  tone: string;
  bg: string;
  border: string;
  glow: string;
}> = {
  buy: {
    icon: ShoppingCart,
    label: 'HEMEN AL',
    tone: 'text-success',
    bg: 'bg-success',
    border: 'border-success/40',
    glow: 'from-success/15',
  },
  'good-deal': {
    icon: Gem,
    label: 'İYİ FIRSAT',
    tone: 'text-success',
    bg: 'bg-success',
    border: 'border-success/30',
    glow: 'from-success/10',
  },
  negotiate: {
    icon: Handshake,
    label: 'PAZARLIK ET',
    tone: 'text-primary',
    bg: 'bg-primary',
    border: 'border-primary/40',
    glow: 'from-primary/15',
  },
  wait: {
    icon: Clock,
    label: 'BEKLE',
    tone: 'text-warning',
    bg: 'bg-warning',
    border: 'border-warning/40',
    glow: 'from-warning/15',
  },
  avoid: {
    icon: XCircle,
    label: 'KAÇIN',
    tone: 'text-danger',
    bg: 'bg-danger',
    border: 'border-danger/40',
    glow: 'from-danger/15',
  },
};

interface AIDecisionCardProps {
  analysis: AIAnalysisResponse;
  listing: ListingResponse;
  marketStats: MarketStatisticsResponse | undefined;
}

export function AIDecisionCard({ analysis, listing, marketStats }: AIDecisionCardProps) {
  const config = REC_CONFIG[analysis.recommendation];
  const Icon = config.icon;

  const discountPct = marketStats
    ? Math.round(((marketStats.median_price - listing.price) / marketStats.median_price) * 1000) / 10
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'ib-card relative overflow-hidden border-2 p-6',
        config.border,
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br to-transparent', config.glow)} />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-2xl text-primary-foreground shadow-lg',
              config.bg,
            )}
          >
            <Icon className="h-9 w-9" />
          </motion.div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                <Sparkles className="h-2.5 w-2.5" />
                Yapay Zeka Kararı
              </span>
            </div>
            <h2 className={cn('font-display text-3xl font-bold tracking-tight', config.tone)}>
              {config.label}
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {analysis.explanation}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card/50 p-4 lg:min-w-[180px]">
          <p className="text-xs font-semibold text-muted-foreground">AI Güveni</p>
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
              <motion.circle
                cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                className={config.tone}
                initial={{ strokeDasharray: '0 214' }}
                animate={{ strokeDasharray: `${(analysis.confidence / 100) * 214} 214` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              />
            </svg>
            <span className={cn('font-display text-xl font-bold', config.tone)}>
              {analysis.confidence}%
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Güven</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 w-4 rounded-full',
                    i < Math.round(analysis.confidence / 20) ? config.bg : 'bg-muted',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {discountPct < 0 && (
        <div className="relative mt-4 flex items-center gap-2 rounded-lg bg-success-soft px-4 py-2.5 text-sm font-medium text-success">
          <Sparkles className="h-4 w-4" />
          Bu ilan piyasa medyanından {formatTry(Math.abs(marketStats!.median_price - listing.price))} (%{Math.abs(discountPct).toFixed(1)}) daha ucuz
        </div>
      )}
    </motion.div>
  );
}

interface ScoreRadialProps {
  analysis: AIAnalysisResponse;
}

const SCORE_ITEMS: Array<{
  key: keyof AIAnalysisResponse;
  label: string;
  icon: LucideIcon;
  tone: string;
  invert?: boolean;
}> = [
  { key: 'opportunity_score', label: 'Fırsat', icon: Sparkles, tone: 'text-primary' },
  { key: 'overall_score', label: 'Genel AI', icon: Brain, tone: 'text-primary' },
  { key: 'seller_score', label: 'Satıcı Güveni', icon: Brain, tone: 'text-success' },
  { key: 'price_score', label: 'Fiyat Skoru', icon: Sparkles, tone: 'text-accent' },
  { key: 'image_score', label: 'Görsel Kalitesi', icon: Sparkles, tone: 'text-accent' },
  { key: 'description_score', label: 'Açıklama Kalitesi', icon: Brain, tone: 'text-warning' },
  { key: 'negotiation_score', label: 'Pazarlık Potansiyeli', icon: Handshake, tone: 'text-primary' },
  { key: 'risk_score', label: 'Risk Skoru', icon: ShieldCheck, tone: 'text-success' },
  { key: 'fake_probability', label: 'Sahtekarlık Riski', icon: XCircle, tone: 'text-danger', invert: true },
];

export function ScoreRadial({ analysis }: ScoreRadialProps) {
  const mainScore = analysis.overall_score ?? analysis.opportunity_score;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="ib-card p-6"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Brain className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">AI Fırsat Puanı</h3>
          <p className="text-xs text-muted-foreground">8 boyutta detaylı analiz</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Main radial score */}
        <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 176 176">
            <circle cx="88" cy="88" r="76" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/20" />
            <motion.circle
              cx="88" cy="88" r="76" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
              className="text-primary"
              initial={{ strokeDasharray: '0 478' }}
              animate={{ strokeDasharray: `${(mainScore / 100) * 478} 478` }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="font-display text-4xl font-bold text-primary">
              {mainScore}
            </span>
            <span className="text-xs font-medium text-muted-foreground">/ 100</span>
            {analysis.confidence_label && (
              <span className={cn('mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold', confidenceBadgeTone(analysis.confidence_label))}>
                {confidenceLabelTR(analysis.confidence_label)}
              </span>
            )}
          </div>
        </div>

        {/* Score breakdown */}
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
          {SCORE_ITEMS.map((item, idx) => {
            const raw = (analysis[item.key] as number) ?? 0;
            const value = item.invert ? 100 - raw : raw;
            const Icon = item.icon;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.06 }}
                className="rounded-xl border border-border bg-card/50 p-3"
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <Icon className={cn('h-3.5 w-3.5', item.tone)} />
                  <span className="text-[11px] font-medium text-muted-foreground">{item.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold text-foreground">{raw}</span>
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + idx * 0.06 }}
                      className={cn('h-full rounded-full', item.invert ? 'bg-danger' : 'bg-primary')}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {analysis.ai_summary && (
        <div className="mt-5 rounded-xl border border-border bg-primary-soft/10 p-4">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI Özeti
          </p>
          <p className="text-sm leading-relaxed text-foreground">{analysis.ai_summary}</p>
        </div>
      )}

      {analysis.reasons && analysis.reasons.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Karar Gerekçeleri</p>
          <ul className="space-y-1.5">
            {analysis.reasons.slice(0, 4).map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

function confidenceLabelTR(label: string): string {
  const map: Record<string, string> = {
    'very-high': 'Çok Yüksek',
    high: 'Yüksek',
    medium: 'Orta',
    low: 'Düşük',
  };
  return map[label] ?? 'Orta';
}

function confidenceBadgeTone(label: string): string {
  if (label === 'very-high') return 'bg-success-soft text-success';
  if (label === 'high') return 'bg-primary-soft text-primary';
  if (label === 'medium') return 'bg-warning-soft text-warning';
  return 'bg-danger-soft text-danger';
}
