import type { AdminStatItem } from '@/features/admin/panel/types/admin-panel.types';

export function AdminStatsCard({ item }: { item: AdminStatItem }) {
  return (
    <div className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10">
      <p className="text-sm text-muted-foreground">{item.label}</p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">
        {item.value}
      </p>
      {item.hint ? <p className="mt-2 text-xs text-muted-foreground">{item.hint}</p> : null}
    </div>
  );
}

export function AdminStatsGrid({ items }: { items: AdminStatItem[] }) {
  return (
    <section aria-label="Admin özeti" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <AdminStatsCard key={item.id} item={item} />
      ))}
    </section>
  );
}
