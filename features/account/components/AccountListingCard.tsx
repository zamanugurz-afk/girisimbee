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
import { useListingEngine } from '@/features/listings/hooks/use-listing-engine';
import { LISTING_TYPE_ICON_MAP } from '@/components/girisimco/listing/listing-type-icon';
import type { ListingTypeIconKey } from '@/features/listings/utils/listing-card-display';
import { AccountListingStatsModal } from '@/features/account/components/AccountListingStatsModal';
import { AccountListingPromoteModal } from '@/features/account/components/AccountListingPromoteModal';
import type { AccountListingCardData, AccountListingStatus } from '@/features/account/types/account-listings.types';
import { ACCOUNT_LISTING_STATUS_LABELS } from '@/features/account/types/account-listings.constants';
import type { ListingId } from '@/lib/domain/ids';

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

  if (typeUpper.includes('İŞE AL') || catUpper === 'İŞ' && typeUpper.includes('AL')) {
    label = 'İşe Alıyorum';
    iconKey = 'employer';
    color = '#10B981';
  } else if (typeUpper.includes('İŞ AR') || catUpper === 'İŞ' && typeUpper.includes('AR')) {
    label = 'İş Arıyorum';
    iconKey = 'job-seeker';
    color = '#0EA5E9';
  } else if (typeUpper.includes('ORTAK') || catUpper.includes('ORTAK')) {
    label = typeUpper.includes('OLMAK') ? 'Ortak Olmak İstiyorum' : 'Ortak Arıyorum';
    iconKey = 'partner';
    color = '#F59E0B';
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
}: {
  listing: AccountListingCardData;
  onStatusChange?: (id: string, newStatus: AccountListingStatus) => void;
  onDelete?: (id: string) => void;
}) {
  const { pauseListing, publishListing, softDeleteListing } = useListingEngine();

  const [statsOpen, setStatsOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isActionBusy, setIsActionBusy] = useState(false);

  const primaryBadge = getListingPrimaryBadge(listing);
  const IconComponent = LISTING_TYPE_ICON_MAP[primaryBadge.iconKey] || Tag;

  const isPublished = listing.status === 'active';
  const publicHref = `/ilan/${listing.slug || listing.id}`;
  const editHref = `/ilanlarim/${listing.id}/duzenle`;

  // Status toggle handler
  const handleToggleStatus = async () => {
    setIsActionBusy(true);
    try {
      if (isPublished) {
        await pauseListing(listing.id as ListingId);
        toast.success('İlan başarıyla duraklatıldı');
        onStatusChange?.(listing.id, 'unpublished');
      } else {
        await publishListing(listing.id as ListingId);
        toast.success('İlan tekrar yayına alındı');
        onStatusChange?.(listing.id, 'active');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'İşlem gerçekleştirilemedi');
    } finally {
      setIsActionBusy(false);
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    setIsActionBusy(true);
    try {
      await softDeleteListing(listing.id as ListingId);
      toast.success('İlan silindi');
      setDeleteDialogOpen(false);
      onDelete?.(listing.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'İlan silinemedi');
    } finally {
      setIsActionBusy(false);
    }
  };

  return (
    <>
      <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6">
        <div>
          {/* Top Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Single primary listing badge with matching icon */}
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: `${primaryBadge.color}15`,
                  color: primaryBadge.color,
                }}
              >
                <IconComponent className="h-3.5 w-3.5" />
                <span>{primaryBadge.label}</span>
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-medium ${
                  listing.status === 'active'
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : listing.status === 'expired'
                      ? 'border border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                      : 'border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    listing.status === 'active'
                      ? 'bg-emerald-500'
                      : listing.status === 'expired'
                        ? 'bg-zinc-500'
                        : 'bg-amber-500'
                  }`}
                />
                {ACCOUNT_LISTING_STATUS_LABELS[listing.status]}
              </span>

              {/* Showcase Badge */}
              {listing.isShowcase && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-3 w-3" />
                  Vitrin
                </span>
              )}

              {/* Urgent Badge */}
              {listing.isUrgentShowcase && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                  <Zap className="h-3 w-3" />
                  Acil
                </span>
              )}
            </div>

            {/* Price / Budget Pill */}
            {listing.price ? (
              <span className="shrink-0 rounded-lg bg-emerald-500/10 px-3 py-1 font-display text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {listing.price}
              </span>
            ) : null}
          </div>

          {/* Title with link */}
          <div className="mt-3.5">
            <Link
              href={publicHref}
              className="group/link inline-flex items-center gap-1.5 font-display text-lg font-bold tracking-tight text-foreground transition-colors hover:text-primary sm:text-xl"
            >
              <span className="line-clamp-1">{listing.title}</span>
              <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover/link:opacity-100 text-muted-foreground" />
            </Link>
          </div>

          {/* Short Description */}
          {listing.shortDescription ? (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
              {listing.shortDescription}
            </p>
          ) : null}

          {/* Details / Chips Row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {listing.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/80" />
                <span>{listing.location}</span>
              </span>
            ) : null}

            {listing.industry ? (
              <span className="inline-flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-muted-foreground/80" />
                <span>{listing.industry}</span>
              </span>
            ) : null}

            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
              <span>Yayın: {formatDate(listing.publishedAt)}</span>
            </span>

            {listing.endsAt && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
                <span>Bitiş: {formatDate(listing.endsAt)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom Section: Unified Metrics Capsule & Elegant Single-Strip Action Toolbar */}
        <div className="mt-5 pt-4 border-t border-border/70 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Live Metrics: Clean Single Segmented Strip */}
          <div className="inline-flex items-center rounded-xl bg-slate-50/90 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 px-3.5 py-1.5 text-xs text-muted-foreground self-start shrink-0 shadow-2xs">
            <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200 dark:border-zinc-700">
              <Eye className="h-3.5 w-3.5 text-blue-500" />
              <strong className="text-foreground font-semibold tabular-nums">{listing.viewCount}</strong>
              <span className="text-[11px] text-muted-foreground">Görüntülenme</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 border-r border-slate-200 dark:border-zinc-700">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              <strong className="text-foreground font-semibold tabular-nums">{listing.favoriteCount}</strong>
              <span className="text-[11px] text-muted-foreground">Favori</span>
            </div>

            <div className="flex items-center gap-1.5 pl-3">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
              <strong className="text-foreground font-semibold tabular-nums">{listing.applicationCount || 0}</strong>
              <span className="text-[11px] text-muted-foreground">Talep</span>
            </div>
          </div>

          {/* Action Toolbar: Strictly Single-Strip flex-nowrap */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto no-scrollbar py-0.5">
            {/* Düzenle */}
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8.5 px-3 shrink-0 rounded-lg gap-1.5 text-xs font-medium hover:border-slate-300 dark:hover:border-zinc-700 transition-all whitespace-nowrap"
            >
              <Link href={editHref}>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Düzenle</span>
              </Link>
            </Button>

            {/* İstatistikler */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setStatsOpen(true)}
              className="h-8.5 px-3 shrink-0 rounded-lg gap-1.5 text-xs font-medium hover:border-slate-300 dark:hover:border-zinc-700 transition-all whitespace-nowrap"
            >
              <BarChart2 className="h-3.5 w-3.5 text-blue-500" />
              <span>İstatistikler</span>
            </Button>

            {/* Vitrine Taşı */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPromoteOpen(true)}
              className="h-8.5 px-3 shrink-0 rounded-lg gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 hover:border-amber-400/50 dark:text-amber-400 transition-all whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Vitrine Taşı</span>
            </Button>

            {/* Yayından Kaldır / Yayınla */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isActionBusy}
              onClick={handleToggleStatus}
              className="h-8.5 px-3 shrink-0 rounded-lg gap-1.5 text-xs font-medium hover:border-slate-300 dark:hover:border-zinc-700 transition-all whitespace-nowrap"
            >
              {isActionBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isPublished ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-amber-500" />
                  <span>Yayından Kaldır</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Yayına Al</span>
                </>
              )}
            </Button>

            {/* Sil */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isActionBusy}
              onClick={() => setDeleteDialogOpen(true)}
              className="h-8.5 px-3 shrink-0 rounded-lg gap-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all whitespace-nowrap"
              aria-label="İlanı Sil"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Sil</span>
            </Button>
          </div>
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
