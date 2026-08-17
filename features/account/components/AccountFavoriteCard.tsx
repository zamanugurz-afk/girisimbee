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
        'group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-md',
        'dark:border-zinc-800 dark:bg-zinc-900/90',
      )}
    >
      <div className="flex flex-col sm:flex-row">
        <Link
          href={item.listingHref}
          className="relative block aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-zinc-800/60 sm:aspect-auto sm:h-auto sm:w-44 md:w-52"
        >
          {item.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.coverImageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 text-muted-foreground sm:min-h-full">
              <ImageIcon className="h-8 w-8 opacity-40" aria-hidden />
              <span className="text-xs">Görsel yok</span>
            </div>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-lg bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                {item.categoryLabel}
              </span>
              {item.isShowcase && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-3 w-3" />
                  Vitrin
                </span>
              )}
              {item.isUrgentShowcase && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                  <Zap className="h-3 w-3" />
                  Acil
                </span>
              )}
            </div>

            <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
              <Link
                href={item.listingHref}
                className="transition-colors hover:text-primary"
              >
                {item.listingTitle}
              </Link>
            </h3>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {item.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground/80" aria-hidden />
                  {item.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" aria-hidden />
                Yayın: {formatDate(item.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-rose-500/80" aria-hidden />
                Eklendi: {formatDate(item.addedAt)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center gap-2">
            <Button
              asChild
              type="button"
              size="sm"
              variant="outline"
              className="h-8.5 px-3 rounded-lg text-xs font-medium"
            >
              <Link href={item.listingHref}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                İlana Git
              </Link>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8.5 px-3 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
              disabled={busy}
              onClick={onRemove}
            >
              <HeartOff className="mr-1.5 h-3.5 w-3.5" />
              Favoriden Kaldır
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8.5 px-3 rounded-lg text-xs font-medium text-muted-foreground"
              onClick={onShare}
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5" />
              Paylaş
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
