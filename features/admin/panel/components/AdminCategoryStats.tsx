'use client';

import type { AdminCategoryStatItem } from '@/features/admin/panel/types/admin-overview.types';
import { cn } from '@/lib/utils';

export function AdminCategoryStats({
  categories,
}: {
  categories: AdminCategoryStatItem[];
}) {
  return (
    <section
      aria-label="En popüler kategoriler"
      className={cn(
        'rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200',
        'hover:border-primary/20 hover:shadow-md',
        'dark:border-white/10 dark:bg-card/90',
      )}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">En popüler kategoriler</h2>
        <p className="mt-1 text-xs text-muted-foreground">İlan dağılımına göre sıralama</p>
      </div>

      <ul className="space-y-4">
        {categories.map((category) => (
          <li key={category.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">{category.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {category.listingCount} ilan · %{category.sharePercent}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted/70 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${category.sharePercent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
