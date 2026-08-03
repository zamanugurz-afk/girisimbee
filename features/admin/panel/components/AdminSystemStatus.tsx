'use client';

import {
  BadgeCheck,
  CreditCard,
  Megaphone,
  Users,
} from 'lucide-react';
import type { AdminSystemStatus } from '@/features/admin/panel/types/admin-system-status.types';
import { cn } from '@/lib/utils';

const ITEM_ICONS = {
  online_users: Users,
  active_listings: Megaphone,
  pending_verifications: BadgeCheck,
  pending_payments: CreditCard,
} as const;

function formatCount(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

export function AdminSystemStatus({
  status,
}: {
  status: AdminSystemStatus;
}) {
  return (
    <section
      aria-label="Sistem durumu"
      className={cn(
        'rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-200 sm:p-5',
        'hover:border-primary/20 hover:shadow-md',
        'dark:border-white/10 dark:bg-card/90',
      )}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <h2 className="text-sm font-semibold text-foreground">{status.label}</h2>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          Çevrimiçi
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {status.items.map((item) => {
          const Icon = ITEM_ICONS[item.id];
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-3 py-3 transition-colors',
                'hover:border-primary/25 hover:bg-muted/20',
                'dark:border-white/10 dark:bg-background/40',
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 font-display text-lg font-semibold tabular-nums text-foreground">
                  {formatCount(item.value)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
