'use client';

import { TrendingUp } from 'lucide-react';
import type { AdminRevenueCategoryItem } from '@/features/admin/panel/types/admin-overview.types';
import { cn } from '@/lib/utils';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

export function AdminRevenueStats({
  categories,
}: {
  categories: AdminRevenueCategoryItem[];
}) {
  const maxRevenue = Math.max(...categories.map((item) => item.revenue), 1);

  return (
    <section
      aria-label="En yüksek gelir getiren kategoriler"
      className={cn(
        'rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200',
        'hover:border-primary/20 hover:shadow-md',
        'dark:border-white/10 dark:bg-card/90',
      )}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">
          En yüksek gelir getiren kategoriler
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Aylık gelir katkısı</p>
      </div>

      <ul className="space-y-4">
        {categories.map((category) => (
          <li key={category.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{category.name}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" aria-hidden />
                  +%{category.growthPercent}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(category.revenue)}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted/70 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-500/80 transition-all duration-500"
                style={{ width: `${Math.round((category.revenue / maxRevenue) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
