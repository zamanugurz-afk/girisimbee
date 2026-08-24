'use client';

import Link from 'next/link';
import {
  Archive,
  Ban,
  CheckCheck,
  ExternalLink,
  Flag,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DashboardMessageCardData } from '@/features/messaging/types/dashboard-messages.types';
import { initials, timeAgo, cn } from '@/lib/utils';

export function DashboardMessageCard({
  item,
  active,
  busy,
  onOpen,
  onArchive,
  onDelete,
  onBlock,
  onReport,
}: {
  item: DashboardMessageCardData;
  active?: boolean;
  busy?: boolean;
  onOpen: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onBlock: () => void;
  onReport: () => void;
}) {
  return (
    <article
      className={cn(
        'group rounded-2xl border p-4 shadow-xs transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        active
          ? 'border-amber-500/40 bg-amber-500/[0.04] dark:border-amber-500/30 dark:bg-amber-500/10'
          : 'border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900/90',
      )}
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Avatar className="h-12 w-12 rounded-2xl">
            {item.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.avatarUrl}
                alt=""
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <AvatarFallback className="rounded-2xl text-xs font-semibold">
                {initials(item.userName)}
              </AvatarFallback>
            )}
          </Avatar>
        </button>

        <div className="min-w-0 flex-1">
          <button type="button" onClick={onOpen} className="w-full text-left">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {item.userName}
                  {item.username ? (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      @{item.username}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 truncate text-sm text-foreground/90">{item.subject}</p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {timeAgo(item.date)}
              </span>
            </div>
            <p className="mt-1.5 truncate text-xs text-muted-foreground">{item.lastMessage}</p>
          </button>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant={item.isUnread ? 'default' : 'secondary'}
              className="rounded-full px-2 py-0.5 text-[11px]"
            >
              {item.isUnread ? (
                <span className="inline-flex items-center gap-1">
                  {item.readLabel}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <CheckCheck className="h-3 w-3" aria-hidden />
                  {item.readLabel}
                </span>
              )}
            </Badge>

            {item.kind === 'application' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300">
                İş Başvurusu
              </span>
            ) : item.kind === 'support' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300">
                Destek
              </span>
            ) : null}

            {item.listingTitle && item.listingHref ? (
              <Link
                href={item.listingHref}
                className="inline-flex max-w-[180px] items-center gap-1 truncate text-xs font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                {item.listingTitle}
              </Link>
            ) : item.listingTitle ? (
              <span className="truncate text-xs text-muted-foreground">{item.listingTitle}</span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-xl"
              onClick={onOpen}
            >
              Mesajı aç
            </Button>
            {item.status === 'open' ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 rounded-xl"
                disabled={busy}
                onClick={onArchive}
              >
                <Archive className="mr-1 h-3.5 w-3.5" />
                Arşiv
              </Button>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-xl"
                  disabled={busy}
                  aria-label="Diğer işlemler"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {item.status === 'open' ? (
                  <DropdownMenuItem onClick={onArchive}>
                    <Archive className="mr-2 h-4 w-4" />
                    Arşive taşı
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={onReport}>
                  <Flag className="mr-2 h-4 w-4" />
                  Kullanıcıyı bildir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onBlock} className="text-destructive focus:text-destructive">
                  <Ban className="mr-2 h-4 w-4" />
                  Kullanıcıyı engelle
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Mesajı sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </article>
  );
}
