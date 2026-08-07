'use client';

import {
  BadgeCheck,
  CreditCard,
  Flag,
  Megaphone,
  UserPlus,
} from 'lucide-react';
import type { AdminActivityItem } from '@/features/admin/panel/types/admin-overview.types';
import { cn } from '@/lib/utils';

const KIND_META = {
  user: {
    label: 'Kullanıcı',
    icon: UserPlus,
    className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
  listing: {
    label: 'İlan',
    icon: Megaphone,
    className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  payment: {
    label: 'Ödeme',
    icon: CreditCard,
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  verification: {
    label: 'Doğrulama',
    icon: BadgeCheck,
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  complaint: {
    label: 'Şikâyet',
    icon: Flag,
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
} as const;

function formatRelative(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function AdminActivityFeed({
  items,
}: {
  items: AdminActivityItem[];
}) {
  return (
    <section
      aria-label="Son aktiviteler"
      className={cn(
        'rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200',
        'hover:border-primary/20 hover:shadow-md',
        'dark:border-white/10 dark:bg-card/90',
      )}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">Son aktiviteler</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Platformdaki en güncel operasyon olayları
        </p>
      </div>

      <ul className="space-y-3">
        {items.map((item) => {
          const meta = KIND_META[item.kind];
          const Icon = meta.icon;
          return (
            <li
              key={item.id}
              className="flex gap-3 rounded-2xl border border-transparent px-2 py-2 transition-colors hover:border-border/70 hover:bg-muted/30 dark:hover:border-white/10"
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                  meta.className,
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <time className="text-[11px] text-muted-foreground">
                    {formatRelative(item.createdAt)}
                  </time>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
