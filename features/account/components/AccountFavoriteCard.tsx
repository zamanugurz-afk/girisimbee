'use client';

import Link from 'next/link';
import {
  Calendar,
  ExternalLink,
  HeartOff,
  ImageIcon,
  MapPin,
  Share2,
  Heart,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AccountFavoriteCardData } from '@/features/account/types/account-favorites.types';
import { cn } from '@/lib/utils';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '—';
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function AccountFavoriteCard({
  item,
  onRemove,
  onShare,
  busy,
}: {
  item: AccountFavoriteCardData;
  onRemove: () => void;
  onShare: () => void;
  busy?: boolean;
}) {
  return (
    <article
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300',
        'hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-md',
        'dark:border-zinc-800 dark:bg-zinc-900/90',
      )}
    >
      <div>
        {/* Cover Image or Category Icon Box */}
        {item.coverImageUrl ? (
          <div className="relative mb-3.5 aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.coverImageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : null}

        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              {item.categoryLabel}
            </span>
            {item.isUrgentShowcase && (
              <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                <Zap className="h-3 w-3 fill-rose-500 text-rose-500" />
                Süper İlan
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-2.5">
          <Link
            href={item.listingHref}
            className="font-display text-base font-bold tracking-tight text-slate-950 hover:text-amber-600 dark:text-white dark:hover:text-amber-400 transition-colors line-clamp-2"
          >
            {item.listingTitle}
          </Link>
        </h3>

        {/* Meta Details */}
        <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800 pt-2.5">
          {item.location ? (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
              <span>Yayın: {formatDate(item.publishedAt)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              <span>Eklendi: {formatDate(item.addedAt)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
        <Button
          asChild
          type="button"
          size="sm"
          className="h-8.5 flex-1 rounded-xl text-xs font-semibold gap-1.5 shadow-2xs"
        >
          <Link href={item.listingHref}>
            <ExternalLink className="h-3.5 w-3.5" />
            <span>İlana Git</span>
          </Link>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8.5 rounded-xl px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:text-rose-400 dark:hover:bg-rose-950/40"
          disabled={busy}
          onClick={onRemove}
          title="Favorilerden Kaldır"
        >
          <HeartOff className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8.5 rounded-xl px-2.5 text-xs font-semibold text-slate-600 hover:border-slate-300 dark:text-zinc-300 dark:hover:border-zinc-700"
          onClick={onShare}
          title="Paylaş"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
