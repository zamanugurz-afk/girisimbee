'use client';

import Link from 'next/link';
import {
  Calendar,
  ExternalLink,
  HeartOff,
  ImageIcon,
  MapPin,
  Share2,
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
        'group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md',
        'dark:border-white/10 dark:bg-card/90',
      )}
    >
      <div className="flex flex-col sm:flex-row">
        <Link
          href={item.listingHref}
          className="relative block aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted/40 sm:aspect-auto sm:h-auto sm:w-44 md:w-52"
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
              <ImageIcon className="h-8 w-8 opacity-50" aria-hidden />
              <span className="text-xs">Görsel yok</span>
            </div>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              >
                {item.categoryLabel}
              </Badge>
              {item.isShowcase ? (
                <Badge variant="outline" className="rounded-full">
                  Vitrin
                </Badge>
              ) : null}
              {item.isUrgentShowcase ? (
                <Badge variant="outline" className="rounded-full">
                  Acil
                </Badge>
              ) : null}
            </div>

            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
              <Link
                href={item.listingHref}
                className="transition-colors hover:text-primary"
              >
                {item.listingTitle}
              </Link>
            </h3>

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {item.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Yayın: {formatDate(item.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Favori: {formatDate(item.addedAt)}
              </span>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 rounded-2xl text-destructive hover:border-destructive/40 hover:text-destructive"
              disabled={busy}
              onClick={onRemove}
            >
              <HeartOff className="mr-1.5 h-3.5 w-3.5" />
              Favorilerden kaldır
            </Button>
            <Button
              asChild
              type="button"
              size="sm"
              variant="outline"
              className="h-9 rounded-2xl"
            >
              <Link href={item.listingHref}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                İlana git
              </Link>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 rounded-2xl"
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
