'use client';

import Link from 'next/link';
import { ArrowRight, CheckCheck, Trash2 } from 'lucide-react';
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
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getNotificationTheme(type: string): { color: string; label: string } {
  switch (type) {
    case 'favorites':
      return { color: '#E11D48', label: 'Favoriler' };
    case 'follows':
      return { color: '#0EA5E9', label: 'Takipler' };
    case 'listings':
      return { color: '#10B981', label: 'İlanlar' };
    case 'payments':
      return { color: '#8B5CF6', label: 'Ödemeler' };
    case 'verifications':
      return { color: '#3B82F6', label: 'Doğrulamalar' };
    case 'system':
    default:
      return { color: '#F59E0B', label: 'Sistem' };
  }
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
  const theme = getNotificationTheme(item.type);

  const cardContent = (
    <article
      className={cn(
        'group relative flex h-full min-h-[13rem] flex-col justify-between overflow-hidden rounded-2xl p-4 sm:p-5',
        'bg-card border border-border/70 hover:border-primary/40',
        'shadow-xs hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5',
        item.actionHref && 'cursor-pointer',
      )}
    >
      <div>
        {/* Top Header: Type Pill + Status Badge & Action buttons */}
        <div className="flex items-start justify-between gap-2">
          {/* Type Pill */}
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${theme.color}15`, color: theme.color }}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{ACCOUNT_NOTIFICATION_TYPE_LABELS[item.type] ?? theme.label}</span>
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status Badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                unread
                  ? 'border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400',
              )}
            >
              {unread && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
              {ACCOUNT_NOTIFICATION_STATUS_LABELS[item.status]}
            </span>

            {/* Mark as read button */}
            {unread && (
              <button
                type="button"
                aria-label="Okundu olarak işaretle"
                title="Okundu olarak işaretle"
                disabled={busy}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMarkRead();
                }}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Delete button */}
            <button
              type="button"
              aria-label="Bildirimi sil"
              title="Bildirimi sil"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="mt-3 line-clamp-1 font-display text-sm sm:text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </div>

      {/* Footer Meta Strip */}
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span className="whitespace-nowrap text-[11px] text-muted-foreground">
          {formatDateTime(item.createdAt)}
        </span>

        {item.actionHref ? (
          <span className="inline-flex items-center gap-1 font-semibold text-foreground transition-colors group-hover:text-primary whitespace-nowrap pl-2 shrink-0">
            <span>{item.actionLabel ?? 'İncele'}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        ) : null}
      </div>
    </article>
  );

  if (item.actionHref) {
    return (
      <Link href={item.actionHref} className="block h-full outline-none">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
