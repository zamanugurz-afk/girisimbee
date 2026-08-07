'use client';

import { ADMIN_OVERVIEW_CARD_ICONS } from '@/features/admin/panel/mock/admin-overview.mock';
import type { AdminOverviewSnapshot } from '@/features/admin/panel/types/admin-overview.types';
import { cn } from '@/lib/utils';

export function AdminOverviewCards({
  cards,
}: {
  cards: AdminOverviewSnapshot['cards'];
}) {
  return (
    <section
      aria-label="Özet kartlar"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {cards.map((card) => {
        const Icon = ADMIN_OVERVIEW_CARD_ICONS[card.id];
        return (
          <article
            key={card.id}
            className={cn(
              'group rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200',
              'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md',
              'dark:border-white/10 dark:bg-card/90',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  {card.value}
                </p>
                {card.hint ? (
                  <p className="mt-2 text-xs text-muted-foreground">{card.hint}</p>
                ) : null}
              </div>
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted/50 transition-colors group-hover:bg-primary/10',
                  card.accent,
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
