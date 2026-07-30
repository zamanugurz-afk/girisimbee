'use client';

import { CalendarDays, CalendarRange, TrendingDown, Package } from 'lucide-react';
import type { HomepageSummary } from '@/hooks/use-homepage-data';
import { cn, formatPct } from '@/lib/utils';

interface HomepageSummaryCardsProps {
  summary?: HomepageSummary;
  isLoading?: boolean;
}

const CARDS = [
  {
    key: 'todayListings' as const,
    label: 'Bugünkü İlanlar',
    hint: 'Son 24 saat',
    icon: CalendarDays,
    tone: 'text-primary',
    bg: 'bg-primary-soft',
  },
  {
    key: 'last3DaysListings' as const,
    label: 'Son 3 Gün',
    hint: 'Son 72 saat',
    icon: CalendarRange,
    tone: 'text-accent-foreground',
    bg: 'bg-secondary',
  },
  {
    key: 'last30DaysListings' as const,
    label: 'Son 30 Gün',
    hint: 'Aktif pazar',
    icon: Package,
    tone: 'text-foreground',
    bg: 'bg-muted',
  },
  {
    key: 'averageMarketDiscount' as const,
    label: 'Ort. Piyasa İndirimi',
    hint: 'Son 30 gün',
    icon: TrendingDown,
    tone: 'text-success',
    bg: 'bg-success-soft',
    format: (value: number) => formatPct(-value),
  },
];

export function HomepageSummaryCards({ summary, isLoading }: HomepageSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const raw = summary?.[card.key] ?? 0;
        const value = card.format ? card.format(raw) : String(raw);

        return (
          <div key={card.key} className="ib-card flex items-start gap-3 p-4">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', card.bg, card.tone)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{card.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
                {isLoading ? '—' : value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{card.hint}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
