'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pencil,
  BarChart2,
  Sparkles,
  Pause,
  Play,
  Trash2,
  ExternalLink,
  Eye,
  Heart,
  MessageSquare,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Loader2,
  Zap,
} from 'lucide-react';
import { LISTING_TYPE_ICON_MAP } from '@/components/girisimco/listing/listing-type-icon';
import type { ListingTypeIconKey } from '@/features/listings/utils/listing-card-display';
import { AccountListingStatsModal } from '@/features/account/components/AccountListingStatsModal';
import { AccountListingPromoteModal } from '@/features/account/components/AccountListingPromoteModal';
import type { AccountListingCardData, AccountListingStatus } from '@/features/account/types/account-listings.types';
import { ACCOUNT_LISTING_STATUS_LABELS } from '@/features/account/types/account-listings.constants';

function formatDate(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getListingPrimaryBadge(listing: AccountListingCardData): {
  label: string;
  iconKey: ListingTypeIconKey;
  color: string;
} {
  const typeUpper = (listing.typeLabel || '').toUpperCase();
  const catUpper = (listing.category || '').toUpperCase();

  let label = listing.typeLabel || listing.category;
  let iconKey: ListingTypeIconKey = (listing.iconKey as ListingTypeIconKey) || 'general';
  let color = listing.groupColor || '#10B981';

  if (typeUpper.includes('İŞE AL') || (catUpper === 'İŞ' && typeUpper.includes('AL'))) {
    label = 'İşe Alıyorum';
    iconKey = 'employer';
    color = '#10B981';
  } else if (typeUpper.includes('İŞ AR') || (catUpper === 'İŞ' && typeUpper.includes('AR'))) {
    label = 'İş Arıyorum';
    iconKey = 'job-seeker';
    color = '#0EA5E9';
  } else if (typeUpper.includes('ORTAK') || catUpper.includes('ORTAK')) {
    label = typeUpper.includes('OLMAK') ? 'Ortak Olmak İstiyorum' : 'Ortak Arıyorum';
    iconKey = 'partner';
    color = '#6366F1';
  } else if (typeUpper.includes('DEVİR') || catUpper.includes('DEVİR') || typeUpper.includes('İŞLETME') || catUpper.includes('İŞLETME')) {
    label = 'İşletme Devri';
    iconKey = 'transfer';
    color = '#D97706';
  } else if (typeUpper.includes('FRANCHISE') || catUpper.includes('FRANCHISE') || typeUpper.includes('BAYİ')) {
    label = 'Franchise';
    iconKey = 'franchise';
    color = '#EC4899';
  } else if (typeUpper.includes('DİJİTAL') || typeUpper.includes('AI') || catUpper.includes('DİJİTAL')) {
    label = 'Dijital & AI Çözümü';
    iconKey = 'digital';
    color = '#8B5CF6';
  } else if (typeUpper.includes('YATIRIM') || catUpper.includes('YATIRIM')) {
    label = typeUpper.includes('YAPIYORUM') ? 'Yatırım Yapıyorum' : 'Yatırım Arıyorum';
    iconKey = typeUpper.includes('YAPIYORUM') ? 'investor' : 'investment';
    color = '#3B82F6';
  }

  return { label, iconKey, color };
}

export function AccountListingCard({
  listing,
  onStatusChange,
  onDelete,
  onPromote,
}: {
  listing: AccountListingCardData;
  onStatusChange?: (id: string, newStatus: AccountListingStatus) => void;
  onDelete?: (id: string) => void;
  onPromote?: (id: string) => void;
}) {
  const [statsOpen, setStatsOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isActionBusy, setIsActionBusy] = useState(false);

  const primaryBadge = getListingPrimaryBadge(listing);
  const IconComponent = LISTING_TYPE_ICON_MAP[primaryBadge.iconKey] || Tag;

  const isPublished = listing.status === 'active';
  const publicHref = `/ilan/${listing.slug || listing.id}`;
  const editHref = `/ilanlarim/${listing.id}/duzenle`;

  // Status toggle handler via Server API
  const handleToggleStatus = async () => {
    setIsActionBusy(true);
    try {
      const nextAction = isPublished ? 'pause' : 'publish';
      const res = await fetch(`/api/account/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: nextAction }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'İşlem gerçekleştirilemedi');
      }

      const nextStatus: AccountListingStatus = isPublished ? 'unpublished' : 'active';
      toast.success(isPublished ? 'İlan başarıyla duraklatıldı' : 'İlan tekrar yayına alındı');
      onStatusChange?.(listing.id, nextStatus);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'İşlem gerçekleştirilemedi');
    } finally {
      setIsActionBusy(false);
    }
  };

  // Delete handler via Server API
  const handleDeleteConfirm = async () => {
    setIsActionBusy(true);
    try {
      const res = await fetch(`/api/account/listings/${listing.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'İlan silinemedi');
      }

      toast.success('İlan başarıyla silindi');
      setDeleteDialogOpen(false);
      onDelete?.(listing.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'İlan silinemedi');
    } finally {
      setIsActionBusy(false);
    }
  };

  const handlePromoteSuccess = (id: string) => {
    onPromote?.(id);
  };

  return (
    <>
      <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90">
        <div>
          {/* Top Category Icon & Badges */}
          <div className="flex items-start justify-between gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-2xs transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: `${primaryBadge.color}15` }}
            >
              <IconComponent className="h-6 w-6" style={{ color: primaryBadge.color }} />
            </div>

            <div className="flex flex-col items-end gap-1.5">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  listing.status === 'active'
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : listing.status === 'expired'
                      ? 'border border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                      : 'border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    listing.status === 'active'
                      ? 'bg-emerald-500 animate-pulse'
                      : listing.status === 'expired'
                        ? 'bg-zinc-500'
                        : 'bg-amber-500'
                  }`}
                />
                {ACCOUNT_LISTING_STATUS_LABELS[listing.status]}
              </span>

              {/* Showcase & Urgent Badges */}
              <div className="flex items-center gap-1">
                {listing.isShowcase && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3 w-3" />
                    Vitrin
                  </span>
                )}
                {listing.isUrgentShowcase && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    <Zap className="h-3 w-3" />
                    Acil
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Category Chip */}
          <div className="mt-3.5 flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: `${primaryBadge.color}15`,
                color: primaryBadge.color,
              }}
            >
              {primaryBadge.label}
            </span>

            {listing.price ? (
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-display text-xs font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {listing.price}
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h3 className="mt-2.5">
            <Link
              href={publicHref}
              className="group/link inline-flex items-center gap-1 font-display text-base font-bold tracking-tight text-slate-950 hover:text-amber-600 dark:text-white dark:hover:text-amber-400 transition-colors line-clamp-2"
            >
              <span>{listing.title}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 text-slate-400 transition-opacity shrink-0" />
            </Link>
          </h3>

          {/* Description */}
          {listing.shortDescription ? (
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-zinc-400 line-clamp-2">
              {listing.shortDescription}
            </p>
          ) : null}

          {/* Meta Details */}
          <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800 pt-2.5">
            {listing.location ? (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                <span className="truncate">{listing.location}</span>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                <span>Yayın: {formatDate(listing.publishedAt)}</span>
              </span>
              {listing.endsAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                  <span>Bitiş: {formatDate(listing.endsAt)}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Metrics & Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-3">
          {/* Metrics Capsule */}
          <div className="flex items-center justify-between rounded-xl bg-sky-50/40 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-800/40 px-3 py-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-blue-500" />
              <strong className="text-slate-900 dark:text-white font-bold tabular-nums">{listing.viewCount}</strong>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">Görüntüleme</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              <strong className="text-slate-900 dark:text-white font-bold tabular-nums">{listing.favoriteCount}</strong>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">Favori</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
              <strong className="text-slate-900 dark:text-white font-bold tabular-nums">{listing.applicationCount || 0}</strong>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">Talep</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="grid grid-cols-2 gap-1.5">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 rounded-xl gap-1.5 text-xs font-semibold hover:border-slate-300 dark:hover:border-zinc-700"
            >
              <Link href={editHref}>
                <Pencil className="h-3.5 w-3.5 text-slate-500" />
                <span>Düzenle</span>
              </Link>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setStatsOpen(true)}
              className="h-8 rounded-xl gap-1.5 text-xs font-semibold hover:border-slate-300 dark:hover:border-zinc-700"
            >
              <BarChart2 className="h-3.5 w-3.5 text-blue-500" />
              <span>İstatistik</span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPromoteOpen(true)}
              className="h-8 rounded-xl gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:border-amber-400/50 dark:text-amber-400"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Vitrine Taşı</span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isActionBusy}
              onClick={handleToggleStatus}
              className="h-8 rounded-xl gap-1.5 text-xs font-semibold hover:border-slate-300 dark:hover:border-zinc-700"
            >
              {isActionBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isPublished ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-amber-500" />
                  <span>Kaldır</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Yayınla</span>
                </>
              )}
            </Button>
          </div>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isActionBusy}
            onClick={() => setDeleteDialogOpen(true)}
            className="h-7 w-full rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            İlanı Sil
          </Button>
        </div>
      </article>

      {/* Statistics Modal */}
      <AccountListingStatsModal
        listing={listing}
        open={statsOpen}
        onOpenChange={setStatsOpen}
        onOpenPromote={() => setPromoteOpen(true)}
      />

      {/* Promote Modal */}
      <AccountListingPromoteModal
        listing={listing}
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
        onPromoted={handlePromoteSuccess}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-bold">
              İlanı Silmek İstediğinize Emin Misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-medium">"{listing.title}"</strong> başlıklı ilanınız kalıcı olarak silinecek, vitrinden ve eşleşme havuzundan kaldırılacaktır. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-lg" disabled={isActionBusy}>
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteConfirm();
              }}
              disabled={isActionBusy}
              className="rounded-lg bg-destructive hover:bg-destructive/90 text-white font-medium gap-1.5"
            >
              {isActionBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              <span>Evet, İlanı Sil</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
