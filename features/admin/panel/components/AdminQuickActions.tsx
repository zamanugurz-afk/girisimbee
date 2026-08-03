'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { AdminQuickActionItem } from '@/features/admin/panel/types/admin-overview.types';
import { cn } from '@/lib/utils';

export function AdminQuickActions({
  actions,
}: {
  actions: AdminQuickActionItem[];
}) {
  return (
    <section
      aria-label="Hızlı işlemler"
      className={cn(
        'rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200',
        'hover:border-primary/20 hover:shadow-md',
        'dark:border-white/10 dark:bg-card/90',
      )}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">Hızlı işlemler</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Sık kullanılan yönetim kısayolları
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className={cn(
                'group flex items-start gap-3 rounded-2xl border border-border/70 bg-background px-3 py-3 transition-all duration-200',
                'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm',
                'dark:border-white/10 dark:bg-background/40',
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
