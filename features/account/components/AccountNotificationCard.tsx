'use client';

import Link from 'next/link';
import { CheckCheck, ExternalLink, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AccountNotificationCardData } from '@/features/account/types/account-notifications.types';
import {
  ACCOUNT_NOTIFICATION_ICON_MAP,
  ACCOUNT_NOTIFICATION_STATUS_LABELS,
  ACCOUNT_NOTIFICATION_TYPE_LABELS,
} from '@/features/account/types/account-notifications.constants';

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function AccountNotificationCard({
  item,
  busy,
  onMarkRead,
  onDelete,
}: {
  item: AccountNotificationCardData;
  busy?: boolean;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const unread = item.status === 'unread';
  const Icon = ACCOUNT_NOTIFICATION_ICON_MAP[item.iconKey] ?? ACCOUNT_NOTIFICATION_ICON_MAP.bell;

  return (
    <article
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-xs transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-md',
        unread
          ? 'border-amber-500/30 bg-amber-500/[0.03] dark:border-amber-500/20 dark:bg-amber-500/10'
          : 'border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900/90',
      )}
    >
      <div className="space-y-3">
        {/* Top Header: Icon + Badges */}
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105',
              unread
                ? 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400',
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
              {ACCOUNT_NOTIFICATION_TYPE_LABELS[item.type]}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold',
                unread
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400',
              )}
            >
              {ACCOUNT_NOTIFICATION_STATUS_LABELS[item.status]}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-display text-sm font-bold tracking-tight text-slate-950 dark:text-white line-clamp-1">
            {item.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-zinc-400 line-clamp-2">
            {item.description}
          </p>
          <p className="mt-2 text-[11px] font-medium text-slate-400 dark:text-zinc-500">
            {formatDateTime(item.createdAt)}
          </p>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-1.5">
        {unread ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 flex-1 rounded-xl text-xs font-semibold hover:border-slate-300 dark:hover:border-zinc-700"
            disabled={busy}
            onClick={onMarkRead}
            title="Okundu olarak işaretle"
          >
            <CheckCheck className="mr-1 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate">Okundu</span>
          </Button>
        ) : null}

        {item.actionHref ? (
          <Button
            asChild
            type="button"
            size="sm"
            className="h-8 flex-1 rounded-xl text-xs font-semibold shadow-2xs gap-1"
          >
            <Link href={item.actionHref}>
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">{item.actionLabel ?? 'İlana Git'}</span>
            </Link>
          </Button>
        ) : null}

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
          disabled={busy}
          onClick={onDelete}
          title="Bildirimi Sil"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
}
