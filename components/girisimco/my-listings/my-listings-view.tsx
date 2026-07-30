'use client';

import Link from 'next/link';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { MarketplaceEmptyState } from '@/components/girisimco/marketplace/marketplace-empty-state';
import { MyListingCard } from '@/components/girisimco/my-listings/my-listing-card';
import { useMyListings } from '@/features/listings/hooks/use-my-listings';
import type { ListingId } from '@/lib/domain/ids';
import type { MyListingSortBy, MyListingStatusFilter } from '@/features/listings/types/my-listings.types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const STATUS_FILTERS: { value: MyListingStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'draft', label: 'Taslak' },
  { value: 'pending_review', label: 'İncelemede' },
  { value: 'published', label: 'Yayında' },
  { value: 'paused', label: 'Duraklatıldı' },
  { value: 'rejected', label: 'Reddedildi' },
  { value: 'archived', label: 'Arşivlendi' },
  { value: 'sold', label: 'Satıldı' },
  { value: 'expired', label: 'Süresi Doldu' },
];

const SORT_OPTIONS: { value: MyListingSortBy; label: string }[] = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'oldest', label: 'En Eski' },
  { value: 'recently_updated', label: 'Son Güncellenen' },
];

export function MyListingsView() {
  const {
    items,
    total,
    isLoading,
    error,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    actionId,
    refresh,
    handlePublish,
    handleRenew,
    handleMarkSold,
    handlePause,
    handleArchive,
    handleDelete,
  } = useMyListings();

  const [deleteTarget, setDeleteTarget] = useState<{ id: ListingId; title: string } | null>(null);

  const hasActiveFilters = statusFilter !== 'all' || query.trim().length > 0;
  const showEmptyState = !isLoading && !error && items.length === 0 && !hasActiveFilters;

  return (
    <>
      <div className="pt-14">
        <div className="border-b border-border/80">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                  İlanlarım
                </h1>
                <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
                  Oluşturduğunuz ilanları yönetin, durumlarını güncelleyin ve performanslarını takip edin.
                </p>
              </div>
              <Button asChild className="rounded-lg bg-primary dark:bg-white dark:text-primary-foreground">
                <Link href="/ilan/olustur">Yeni İlan</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
          {!showEmptyState && (
            <div className="mb-6 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="İlanlarda ara…"
                  className="max-w-md rounded-lg border-border/80"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setViewMode('grid')}
                    aria-label="Izgara görünümü"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setViewMode('list')}
                    aria-label="Liste görünümü"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((filter) => (
                    <Button
                      key={filter.value}
                      type="button"
                      variant={statusFilter === filter.value ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 rounded-lg text-xs"
                      onClick={() => setStatusFilter(filter.value)}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as MyListingSortBy)}>
                  <SelectTrigger className="w-full rounded-lg sm:w-[200px]">
                    <SelectValue placeholder="Sırala" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {!isLoading && !error && !showEmptyState && (
            <p className="mb-4 text-xs text-muted-foreground">
              {total.toLocaleString('tr-TR')} ilan
            </p>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-3 rounded-lg" onClick={refresh}>
                Tekrar Dene
              </Button>
            </div>
          )}

          {isLoading && (
            <div
              className={cn(
                'grid gap-4',
                viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
              )}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-xl border border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]"
                />
              ))}
            </div>
          )}

          {showEmptyState && (
            <MarketplaceEmptyState
              variant="listings"
              title="Henüz ilanınız bulunmuyor."
              description="İlk ilanınızı oluşturarak platformda görünmeye başlayın."
              cta={{ label: 'İlk İlanımı Oluştur', href: '/ilan/olustur' }}
            />
          )}

          {!isLoading && !error && items.length === 0 && hasActiveFilters && (
            <div className="rounded-xl border border-dashed border-border/80 px-6 py-16 text-center dark:border-white/10">
              <p className="text-sm font-medium text-foreground">
                Bu filtrelere uygun ilan bulunmuyor.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Farklı bir filtre veya arama terimi deneyin.</p>
            </div>
          )}

          {!isLoading && !error && items.length > 0 && (
            <div
              className={cn(
                'grid gap-4',
                viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
              )}
            >
              {items.map((item) => (
                <MyListingCard
                  key={item.listing.id}
                  item={item}
                  viewMode={viewMode}
                  isBusy={actionId === item.listing.id}
                  onPublish={() => handlePublish(item.listing.id)}
                  onRenew={() => handleRenew(item.listing.id)}
                  onMarkSold={() => handleMarkSold(item.listing.id)}
                  onPause={() => handlePause(item.listing.id)}
                  onArchive={() => handleArchive(item.listing.id)}
                  onDelete={() =>
                    setDeleteTarget({ id: item.listing.id, title: item.listing.title })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>İlanı sil</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.title}" ilanını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
                : 'Bu ilanı silmek istediğinize emin misiniz?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  void handleDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
