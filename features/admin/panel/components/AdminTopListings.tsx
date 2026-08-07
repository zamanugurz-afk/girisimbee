'use client';

import { Eye, Heart } from 'lucide-react';
import type { AdminTopListingRow } from '@/features/admin/panel/types/admin-panel.types';
import { cn } from '@/lib/utils';

function formatCount(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

export function AdminTopListings({
  listings,
}: {
  listings: AdminTopListingRow[];
}) {
  return (
    <section
      aria-label="En çok görüntülenen ilanlar"
      className={cn(
        'rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200',
        'hover:border-primary/20 hover:shadow-md',
        'dark:border-white/10 dark:bg-card/90',
      )}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">
          En çok görüntülenen ilanlar
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Bu haftanın öne çıkan ilanları</p>
      </div>

      <ul className="space-y-2">
        {listings.map((listing, index) => (
          <li
            key={listing.id}
            className={cn(
              'flex items-start gap-3 rounded-2xl border border-transparent px-2 py-2.5 transition-colors',
              'hover:border-border/70 hover:bg-muted/30 dark:hover:border-white/10',
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-muted/60 text-xs font-semibold tabular-nums text-foreground dark:bg-white/5">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{listing.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{listing.owner}</p>
              <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" aria-hidden />
                  {formatCount(listing.view_count)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3 w-3" aria-hidden />
                  {formatCount(listing.favorite_count)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
