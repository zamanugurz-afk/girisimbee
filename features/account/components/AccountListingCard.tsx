'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  MapPin,
  Clock,
  Tag,
  Loader2,
  Zap,
  MoreVertical,
  ArrowRight,
} from 'lucide-react';
import { LISTING_TYPE_ICON_MAP } from '@/components/girisimco/listing/listing-type-icon';
import type { ListingTypeIconKey } from '@/features/listings/utils/listing-card-display';
import { AccountListingStatsModal } from '@/features/account/components/AccountListingStatsModal';
import { AccountListingPromoteModal } from '@/features/account/components/AccountListingPromoteModal';
import type { AccountListingCardData, AccountListingStatus } from '@/features/account/types/account-listings.types';
import { ACCOUNT_LISTING_STATUS_LABELS } from '@/features/account/types/account-listings.constants';
import { cn } from '@/lib/utils';

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
    color = '#F59E0B';
  } else if (typeUpper.includes('DEVİR') || catUpper.includes('DEVİR') || typeUpper.includes('İŞLETME') || catUpper.includes('İŞLETME')) {
    label = 'İşletme Devri';
    iconKey = 'transfer';
    color = '#D97706';
  } else if (typeUpper.includes('FRANCHISE') || catUpper.includes('FRANCHISE') || typeUpper.includes('BAYİ')) {
    label = 'Franchise';
    iconKey = 'franchise';
    color = '#EC4899';
  } else if (typeUpper.includes('DİJİTAL') || typeUpper.includes('AI') || catUpper.includes('DİJİTAL')) {
    label = 'Dijital ve AI Çözümü';
    iconKey = 'digital';
    color = '#8B5CF6';
  } else if (typeUpper.includes('HİZMET') || catUpper.includes('HİZMET') || typeUpper.includes('USTA') || catUpper.includes('USTA')) {
    label = 'Ustalar ve Hizmetler';
    iconKey = 'services';
    color = '#6366F1';
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
      <Link href={publicHref} className="block h-full outline-none">
        <article
          className={cn(
            'group relative flex h-full min-h-[13.5rem] flex-col justify-between overflow-hidden rounded-2xl p-4 sm:p-5',
            'bg-card border border-border/70 hover:border-primary/40',
            'shadow-xs hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5',
            'cursor-pointer',
          )}
        >
          <div>
            {/* Top Meta Row: Type Pill + Price Badge + Status Badge & Actions */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                {/* Category / Type Pill */}
                <span
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `${primaryBadge.color}15`, color: primaryBadge.color }}
                >
                  <IconComponent className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-none">{primaryBadge.label}</span>
                </span>

                {/* Compact Price Badge */}
                {listing.price ? (
                  <span
                    className="inline-flex shrink-0 items-center rounded-lg px-2.5 py-1 font-display text-xs font-semibold tabular-nums border"
                    style={{
                      backgroundColor: 'rgba(159, 18, 57, 0.07)',
                      color: '#9F1239',
                      borderColor: 'rgba(159, 18, 57, 0.20)',
                    }}
                  >
                    {listing.price}
                  </span>
                ) : null}
              </div>

              {/* Right Side: Status Badge + Showcase + Quick Management Menu */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Süper İlan Badge */}
                {listing.isUrgentShowcase && (
                  <span className="inline-flex items-center gap-0.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    <Zap className="h-3 w-3 fill-rose-500 text-rose-500" />
                    Süper İlan
                  </span>
                )}

                {/* Status Badge */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    listing.status === 'active'
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : listing.status === 'expired'
                        ? 'border border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                        : 'border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      listing.status === 'active'
                        ? 'bg-emerald-500 animate-pulse'
                        : listing.status === 'expired'
                          ? 'bg-zinc-500'
                          : 'bg-amber-500',
                    )}
                  />
                  {ACCOUNT_LISTING_STATUS_LABELS[listing.status]}
                </span>

                {/* Management Dropdown Menu (•••) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="İlan İşlemleri"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 rounded-xl border border-border/80 bg-popover/95 shadow-lg backdrop-blur-md"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <DropdownMenuItem asChild>
                      <Link href={editHref} className="flex items-center gap-2 cursor-pointer font-medium">
                        <Pencil className="h-4 w-4 text-slate-500" />
                        <span>Düzenle</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setStatsOpen(true);
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <BarChart2 className="h-4 w-4 text-blue-500" />
                      <span>İstatistikler ({listing.viewCount} Gör.)</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPromoteOpen(true);
                      }}
                      className="flex items-center gap-2 cursor-pointer text-rose-600 dark:text-rose-400 font-medium"
                    >
                      <Zap className="h-4 w-4 text-rose-500 fill-rose-500" />
                      <span>Süper İlan Yap</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={isActionBusy}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void handleToggleStatus();
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {isPublished ? (
                        <>
                          <Pause className="h-4 w-4 text-amber-500" />
                          <span>Yayından Kaldır</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 text-emerald-500" />
                          <span>Tekrar Yayınla</span>
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteDialogOpen(true);
                      }}
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>İlanı Sil</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Title */}
            <h3 className="mt-3 line-clamp-2 font-display text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
              {listing.title}
            </h3>

            {/* Description */}
            {listing.shortDescription ? (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {listing.shortDescription}
              </p>
            ) : null}
          </div>

          {/* Footer Meta Strip */}
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
              {listing.location && (
                <span className="inline-flex items-center gap-1 shrink-0">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate max-w-[110px] sm:max-w-[140px]">{listing.location}</span>
                </span>
              )}
              {listing.publishedAt && (
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="whitespace-nowrap">{formatDate(listing.publishedAt)}</span>
                </span>
              )}
            </div>

            {/* İncele ➔ Button */}
            <span className="inline-flex items-center gap-1 font-semibold text-foreground transition-colors group-hover:text-primary whitespace-nowrap pl-2 shrink-0">
              <span>İncele</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </article>
      </Link>

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
              <strong className="text-foreground font-medium">"{listing.title}"</strong> başlıklı ilanınız kalıcı olarak silinecek, vitrinden ve arama havuzundan kaldırılacaktır. Bu işlem geri alınamaz.
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
