'use client';

import Link from 'next/link';
import {
  Archive,
  Eye,
  Heart,
  MessageSquare,
  Pencil,
  Pause,
  RefreshCw,
  Send,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MyListingItem, MyListingViewMode } from '@/features/listings/types/my-listings.types';
import type { ListingStatus } from '@/features/listings/types/listing.entity.types';
import { getListingStatusLabel } from '@/features/listings/utils/listing-status-labels';
import { formatDate, formatNumber, cn } from '@/lib/utils';

interface MyListingCardProps {
  item: MyListingItem;
  viewMode: MyListingViewMode;
  isBusy?: boolean;
  onPublish: () => void;
  onRenew: () => void;
  onMarkSold: () => void;
  onPause: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const STATUS_STYLES: Record<ListingStatus, string> = {
  draft: 'border-[#E2E8F0] bg-[#F8FAFC] text-muted-foreground',
  pending_review: 'border-amber-200 bg-amber-50 text-amber-800',
  published: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  paused: 'border-orange-200 bg-orange-50 text-orange-800',
  expired: 'border-[#E2E8F0] bg-[#F8FAFC] text-muted-foreground',
  archived: 'border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]',
  rejected: 'border-red-200 bg-red-50 text-red-800',
  sold: 'border-blue-200 bg-blue-50 text-blue-800',
  deleted: 'border-red-200 bg-red-50 text-red-800',
};

function canSubmitForReview(status: ListingStatus): boolean {
  return status === 'draft' || status === 'rejected';
}

function canRenew(status: ListingStatus): boolean {
  return status === 'expired' || status === 'archived';
}

function canRepublish(status: ListingStatus): boolean {
  return status === 'paused';
}

function canPause(status: ListingStatus): boolean {
  return status === 'published';
}

function canMarkSold(status: ListingStatus): boolean {
  return status === 'published';
}

function canArchive(status: ListingStatus): boolean {
  return ['published', 'paused', 'sold'].includes(status);
}

function ListingThumbnail({ url, title }: { url: string | null; title: string }) {
  if (url) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-[#F1F5F9] dark:bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={title} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[120px] items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/40 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/[0.02]">
      Görsel yok
    </div>
  );
}

function ListingMetrics({ item }: { item: MyListingItem }) {
  const { listing, favoriteCount } = item;
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        {formatNumber(listing.viewCount)}
      </span>
      <span className="inline-flex items-center gap-1">
        <Heart className="h-3.5 w-3.5" />
        {formatNumber(favoriteCount)}
      </span>
      <span className="inline-flex items-center gap-1">
        <MessageSquare className="h-3.5 w-3.5" />
        {formatNumber(listing.applicationCount)}
      </span>
    </div>
  );
}

function ListingDates({ item }: { item: MyListingItem }) {
  const { listing } = item;
  return (
    <div className="space-y-0.5 text-xs text-muted-foreground">
      <p>Oluşturulma: {formatDate(listing.createdAt)}</p>
      <p>Güncelleme: {formatDate(listing.updatedAt)}</p>
      {listing.expiresAt && listing.status === 'published' && (
        <p>Bitiş: {formatDate(listing.expiresAt)}</p>
      )}
      {listing.rejectedReason && listing.status === 'rejected' && (
        <p className="text-red-600">Red: {listing.rejectedReason}</p>
      )}
    </div>
  );
}

function ListingActions({
  status,
  isBusy,
  onPublish,
  onRenew,
  onMarkSold,
  onPause,
  onArchive,
  onDelete,
  editHref,
}: {
  status: ListingStatus;
  isBusy?: boolean;
  onPublish: () => void;
  onRenew: () => void;
  onMarkSold: () => void;
  onPause: () => void;
  onArchive: () => void;
  onDelete: () => void;
  editHref: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs" disabled={isBusy}>
        <Link href={editHref}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Düzenle
        </Link>
      </Button>
      {canSubmitForReview(status) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs"
          disabled={isBusy}
          onClick={onPublish}
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          İncelemeye Gönder
        </Button>
      )}
      {canRepublish(status) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs"
          disabled={isBusy}
          onClick={onPublish}
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          Yayınla
        </Button>
      )}
      {canRenew(status) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs"
          disabled={isBusy}
          onClick={onRenew}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Yenile
        </Button>
      )}
      {canMarkSold(status) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs"
          disabled={isBusy}
          onClick={onMarkSold}
        >
          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
          Satıldı
        </Button>
      )}
      {canPause(status) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs"
          disabled={isBusy}
          onClick={onPause}
        >
          <Pause className="mr-1.5 h-3.5 w-3.5" />
          Duraklat
        </Button>
      )}
      {canArchive(status) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs"
          disabled={isBusy}
          onClick={onArchive}
        >
          <Archive className="mr-1.5 h-3.5 w-3.5" />
          Arşivle
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 rounded-lg text-xs text-destructive hover:text-destructive"
        disabled={isBusy}
        onClick={onDelete}
      >
        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
        Sil
      </Button>
    </div>
  );
}

export function MyListingCard({
  item,
  viewMode,
  isBusy,
  onPublish,
  onRenew,
  onMarkSold,
  onPause,
  onArchive,
  onDelete,
}: MyListingCardProps) {
  const { listing } = item;
  const editHref = `/ilanlarim/${listing.id}/duzenle`;

  if (viewMode === 'list') {
    return (
      <article className="rounded-xl border border-border/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-full shrink-0 sm:w-40">
            <ListingThumbnail url={item.thumbnailUrl} title={listing.title} />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate font-medium text-foreground">{listing.title}</h2>
                <Badge
                  variant="outline"
                  className={cn('mt-2 rounded-full', STATUS_STYLES[listing.status])}
                >
                  {getListingStatusLabel(listing.status)}
                </Badge>
              </div>
            </div>
            <ListingMetrics item={item} />
            <ListingDates item={item} />
            <ListingActions
              status={listing.status}
              isBusy={isBusy}
              onPublish={onPublish}
              onRenew={onRenew}
              onMarkSold={onMarkSold}
              onPause={onPause}
              onArchive={onArchive}
              onDelete={onDelete}
              editHref={editHref}
            />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col rounded-xl border border-border/80 bg-white dark:border-white/10 dark:bg-white/[0.02]">
      <div className="aspect-[16/10] p-3 pb-0">
        <ListingThumbnail url={item.thumbnailUrl} title={listing.title} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="line-clamp-2 font-medium text-foreground">{listing.title}</h2>
          <Badge
            variant="outline"
            className={cn('mt-2 rounded-full', STATUS_STYLES[listing.status])}
          >
            {getListingStatusLabel(listing.status)}
          </Badge>
        </div>
        <ListingMetrics item={item} />
        <ListingDates item={item} />
        <div className="mt-auto pt-1">
          <ListingActions
            status={listing.status}
            isBusy={isBusy}
            onPublish={onPublish}
            onRenew={onRenew}
            onMarkSold={onMarkSold}
            onPause={onPause}
            onArchive={onArchive}
            onDelete={onDelete}
            editHref={editHref}
          />
        </div>
      </div>
    </article>
  );
}
