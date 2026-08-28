'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Pencil,
  BarChart2,
  Sparkles,
  Pause,
  Play,
  Trash2,
  Loader2,
  ShieldCheck,
  Eye,
  Heart,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AccountListingStatsModal } from '@/features/account/components/AccountListingStatsModal';
import { AccountListingPromoteModal } from '@/features/account/components/AccountListingPromoteModal';
import type { AccountListingCardData, AccountListingStatus } from '@/features/account/types/account-listings.types';
import { cn } from '@/lib/utils';

interface ListingOwnerActionsBarProps {
  listingId: string;
  slug?: string;
  title?: string;
  status?: string;
  views?: number;
  favorites?: number;
  applications?: number;
  className?: string;
}

export function ListingOwnerActionsBar({
  listingId,
  slug,
  title = 'İlanınız',
  status: initialStatus = 'active',
  views = 0,
  favorites = 0,
  applications = 0,
  className,
}: ListingOwnerActionsBarProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<string>(initialStatus);
  const [statsOpen, setStatsOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isActionBusy, setIsActionBusy] = useState(false);

  const isPublished = currentStatus === 'active' || currentStatus === 'published';
  const editHref = `/ilanlarim/${listingId}/duzenle`;

  const modalListingData: AccountListingCardData = {
    id: listingId,
    title,
    slug: slug || listingId,
    category: 'İlan',
    status: (isPublished ? 'active' : 'unpublished') as AccountListingStatus,
    publishedAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    viewCount: views,
    favoriteCount: favorites,
    applicationCount: applications,
    isShowcase: false,
    isUrgentShowcase: false,
  };

  const handleToggleStatus = async () => {
    setIsActionBusy(true);
    try {
      const nextAction = isPublished ? 'pause' : 'publish';
      const res = await fetch(`/api/account/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: nextAction }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'İşlem gerçekleştirilemedi');
      }

      const nextStatus = isPublished ? 'paused' : 'published';
      setCurrentStatus(nextStatus);
      toast.success(isPublished ? 'İlanınız başarıyla duraklatıldı (kaldırıldı)' : 'İlanınız tekrar yayına alındı');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'İşlem gerçekleştirilemedi');
    } finally {
      setIsActionBusy(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsActionBusy(true);
    try {
      const res = await fetch(`/api/account/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'İlan silinemedi');
      }

      toast.success('İlanınız başarıyla silindi');
      setDeleteDialogOpen(false);
      router.push('/dashboard/ilanlarim');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'İlan silinemedi');
    } finally {
      setIsActionBusy(false);
    }
  };

  return (
    <section
      aria-label="İlan Sahibi Yönetim Paneli"
      className={cn(
        'rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-sm dark:border-amber-700/50 dark:from-amber-950/40 dark:to-transparent',
        className,
      )}
    >
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Sol: Bilgi & Durum */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                İLAN SAHİBİ YÖNETİM PANELİ
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  isPublished
                    ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 dark:text-emerald-400'
                    : 'bg-zinc-500/10 text-zinc-600 border border-zinc-500/30 dark:text-zinc-400',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500')} />
                {isPublished ? 'Yayında' : 'Duraklatıldı'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Bu ilan size aittir. İlanınızı düzenleyebilir, istatistiklerini görebilir veya silebilirsiniz.
            </p>
          </div>
        </div>

        {/* Sağ: İstatistik Özeti */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-card/80 border border-slate-200/80 dark:border-border px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-blue-500" />
            <strong className="font-bold tabular-nums text-slate-900 dark:text-foreground">{views}</strong>
          </span>
          <span className="text-slate-300 dark:text-border">|</span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            <strong className="font-bold tabular-nums text-slate-900 dark:text-foreground">{favorites}</strong>
          </span>
          <span className="text-slate-300 dark:text-border">|</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
            <strong className="font-bold tabular-nums text-slate-900 dark:text-foreground">{applications}</strong>
          </span>
        </div>
      </div>

      {/* Aksiyon Butonları */}
      <div className="mt-4 pt-3.5 border-t border-amber-200/60 dark:border-amber-800/40 flex flex-wrap items-center gap-2">
        <Button
          asChild
          size="sm"
          className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Link href={editHref}>
            <Pencil className="h-3.5 w-3.5" />
            <span>İlanı Düzenle</span>
          </Link>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setStatsOpen(true)}
          className="rounded-xl text-xs font-semibold gap-1.5 bg-white dark:bg-card border-slate-200 dark:border-border hover:border-blue-400"
        >
          <BarChart2 className="h-3.5 w-3.5 text-blue-600" />
          <span>İstatistikler</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setPromoteOpen(true)}
          className="rounded-xl text-xs font-semibold gap-1.5 bg-white dark:bg-card border-slate-200 dark:border-border text-amber-700 hover:text-amber-800 hover:border-amber-400 dark:text-amber-300"
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
          className="rounded-xl text-xs font-semibold gap-1.5 bg-white dark:bg-card border-slate-200 dark:border-border hover:border-slate-300"
        >
          {isActionBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isPublished ? (
            <>
              <Pause className="h-3.5 w-3.5 text-amber-600" />
              <span>Yayından Kaldır</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 text-emerald-600" />
              <span>Tekrar Yayına Al</span>
            </>
          )}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isActionBusy}
          onClick={() => setDeleteDialogOpen(true)}
          className="rounded-xl text-xs font-semibold gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>İlanı Sil</span>
        </Button>
      </div>

      {/* İstatistik Modalı */}
      <AccountListingStatsModal
        open={statsOpen}
        onOpenChange={setStatsOpen}
        listing={modalListingData}
      />

      {/* Vitrin Modalı */}
      <AccountListingPromoteModal
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
        listing={modalListingData}
        onPromoted={() => {
          setPromoteOpen(false);
          toast.success('Süper İlan dopingi başarıyla uygulandı');
        }}
      />

      {/* Silme Onay Modalı */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              İlanı Silmek İstediğinize Emin Misiniz?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{title}</strong> başlıklı ilanınız kalıcı olarak silinecektir. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isActionBusy}
              className="rounded-xl text-xs"
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isActionBusy}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              {isActionBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              <span>Evet, İlanı Sil</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
