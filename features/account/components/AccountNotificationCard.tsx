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
        'group rounded-2xl border p-4 shadow-xs transition-all duration-200 sm:p-5',
        'hover:-translate-y-0.5 hover:shadow-md',
        unread
          ? 'border-amber-500/30 bg-amber-500/[0.04] dark:border-amber-500/20 dark:bg-amber-500/10'
          : 'border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900/90',
      )}
    >
      <div className="flex gap-3 sm:gap-4">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
            unread
              ? 'bg-primary/15 text-primary'
              : 'bg-muted/60 text-muted-foreground dark:bg-white/5',
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px]">
                {ACCOUNT_NOTIFICATION_TYPE_LABELS[item.type]}
              </Badge>
              <Badge
                variant={unread ? 'default' : 'outline'}
                className="rounded-full px-2.5 py-0.5 text-[11px]"
              >
                {ACCOUNT_NOTIFICATION_STATUS_LABELS[item.status]}
              </Badge>
            </div>
            <h3 className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 rounded-2xl"
              disabled={!unread || busy}
              onClick={onMarkRead}
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Okundu olarak işaretle
            </Button>
            {item.actionHref ? (
              <Button asChild type="button" size="sm" variant="outline" className="h-9 rounded-2xl">
                <Link href={item.actionHref}>
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  {item.actionLabel ?? 'İlgili sayfaya git'}
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 rounded-2xl text-destructive hover:text-destructive"
              disabled={busy}
              onClick={onDelete}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Bildirimi sil
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
