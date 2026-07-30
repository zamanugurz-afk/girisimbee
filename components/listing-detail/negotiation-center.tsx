'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Handshake,
  MessageSquare,
  Copy,
  TrendingDown,
  Wallet,
  Truck,
  Package,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { cn, formatTry } from '@/lib/utils';
import { toast } from 'sonner';

interface NegotiationCenterProps {
  negotiation: {
    suggestedOffer: number;
    maxRecommendedOffer: number;
    acceptProbability: number;
    difficulty: 'easy' | 'medium' | 'hard';
    firstMessage: string;
    secondMessage: string;
    cashOffer: number;
    pickupOffer: number;
    bundleOffer: number;
  };
  listingPrice: number;
}

const DIFFICULTY_META: Record<string, { label: string; tone: string; bar: string; level: number }> = {
  easy: { label: 'Kolay', tone: 'text-success', bar: 'bg-success', level: 1 },
  medium: { label: 'Orta', tone: 'text-warning', bar: 'bg-warning', level: 2 },
  hard: { label: 'Zor', tone: 'text-danger', bar: 'bg-danger', level: 3 },
};

export function NegotiationCenter({ negotiation, listingPrice }: NegotiationCenterProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast('Panoya kopyalandı', { description: field });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const diffMeta = DIFFICULTY_META[negotiation.difficulty];
  const savings = listingPrice - negotiation.suggestedOffer;

  const offerCards: Array<{
    icon: LucideIcon;
    label: string;
    price: number;
    desc: string;
    field: string;
  }> = [
    { icon: Wallet, label: 'Nakit Teklif', price: negotiation.cashOffer, desc: 'Bugün nakit ödeme', field: 'Nakit Teklif' },
    { icon: Truck, label: 'Teslim Alım Teklifi', price: negotiation.pickupOffer, desc: 'Bugün teslim alım', field: 'Teslim Alım' },
    { icon: Package, label: 'Paket Teklifi', price: negotiation.bundleOffer, desc: 'Birden fazla ürün', field: 'Paket Teklifi' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="ib-card relative overflow-hidden border-l-4 border-l-primary p-6"
    >
      <div className="absolute right-0 top-0 h-32 w-32 bg-primary/5 rounded-full -translate-y-12 translate-x-12" />

      <div className="relative">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Handshake className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Pazarlık Merkezi</h3>
            <p className="text-xs text-muted-foreground">AI destekli pazarlık stratejisi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Suggested offer */}
          <div className="rounded-xl border-2 border-primary/30 bg-primary-soft/20 p-4">
            <p className="text-xs font-semibold text-muted-foreground">Önerilen Teklif</p>
            <p className="mt-1 font-display text-2xl font-bold text-primary">{formatTry(negotiation.suggestedOffer)}</p>
            {savings > 0 && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success">
                <TrendingDown className="h-3 w-3" />
                {formatTry(savings)} tasarruf
              </p>
            )}
          </div>

          {/* Max recommended offer */}
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <p className="text-xs font-semibold text-muted-foreground">Maks. Önerilen Teklif</p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">{formatTry(negotiation.maxRecommendedOffer)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Bunu aşmayın</p>
          </div>

          {/* Accept probability */}
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <p className="text-xs font-semibold text-muted-foreground">Kabul Olasılığı</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-foreground">{negotiation.acceptProbability}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${negotiation.acceptProbability}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className={cn('h-full rounded-full', negotiation.acceptProbability >= 70 ? 'bg-success' : negotiation.acceptProbability >= 40 ? 'bg-warning' : 'bg-danger')}
              />
            </div>
          </div>

          {/* Difficulty */}
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <p className="text-xs font-semibold text-muted-foreground">Pazarlık Zorluğu</p>
            <p className={cn('mt-1 font-display text-2xl font-bold', diffMeta.tone)}>{diffMeta.label}</p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={cn('h-1.5 flex-1 rounded-full', i < diffMeta.level ? diffMeta.bar : 'bg-muted')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Offer variants */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {offerCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-xl border border-border bg-card/50 p-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{card.label}</span>
                </div>
                <p className="mt-2 font-display text-lg font-bold text-foreground">{formatTry(card.price)}</p>
                <p className="text-[11px] text-muted-foreground">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Suggested messages */}
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground">Önerilen Mesajlar</p>

          <div className="rounded-xl border border-border bg-card/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                İlk Mesaj
              </span>
              <button
                onClick={() => copy(negotiation.firstMessage, 'İlk Mesaj')}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {copiedField === 'İlk Mesaj' ? <CheckCircle2 className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                {copiedField === 'İlk Mesaj' ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{negotiation.firstMessage}</p>
          </div>

          <div className="rounded-xl border border-border bg-card/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                İkinci Mesaj (Karşı Teklif)
              </span>
              <button
                onClick={() => copy(negotiation.secondMessage, 'İkinci Mesaj')}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {copiedField === 'İkinci Mesaj' ? <CheckCircle2 className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                {copiedField === 'İkinci Mesaj' ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{negotiation.secondMessage}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
