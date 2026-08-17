'use client';

import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Calendar,
  Clock,
  Sparkles,
  Pencil,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import type { AccountListingCardData } from '@/features/account/types/account-listings.types';
import { ACCOUNT_LISTING_STATUS_LABELS } from '@/features/account/types/account-listings.constants';

function formatDate(value?: string | null): string {
  if (!value) return 'Belirtilmedi';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function AccountListingStatsModal({
  listing,
  open,
  onOpenChange,
  onOpenPromote,
}: {
  listing: AccountListingCardData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenPromote?: () => void;
}) {
  const views = listing.viewCount || 0;
  const favorites = listing.favoriteCount || 0;
  const inquiries = listing.applicationCount || 0;
  const engagementRate = views > 0 ? (((favorites + inquiries) / views) * 100).toFixed(1) : '0.0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-2xl p-0 border border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
        {/* Header */}
        <div className="border-b border-border/80 p-6 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: listing.groupColor ? `${listing.groupColor}15` : 'rgba(16, 185, 129, 0.1)',
                  color: listing.groupColor || '#10B981',
                }}
              >
                {listing.category}
              </span>
              <Badge
                variant={
                  listing.status === 'active'
                    ? 'default'
                    : listing.status === 'expired'
                      ? 'secondary'
                      : 'outline'
                }
                className={
                  listing.status === 'active'
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium'
                    : ''
                }
              >
                {ACCOUNT_LISTING_STATUS_LABELS[listing.status]}
              </Badge>
              {listing.isShowcase && (
                <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Vitrin
                </Badge>
              )}
            </div>
            {listing.price && (
              <span className="rounded-lg bg-emerald-500/10 px-3 py-1 font-display text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {listing.price}
              </span>
            )}
          </div>
          <DialogTitle className="mt-3 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {listing.title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            İlanınızın görüntülenme, favori ve kullanıcı etkileşim metrikleri.
          </DialogDescription>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 transition-all hover:bg-muted/40 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Eye className="h-4 w-4 text-blue-500" />
                <span>Görüntülenme</span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {views}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Toplam tekil ziyaret</p>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 transition-all hover:bg-muted/40 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Favori</span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {favorites}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Kaydedilme sayısı</p>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 transition-all hover:bg-muted/40 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                <span>Talepler</span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {inquiries}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">İletişim & başvuru</p>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 transition-all hover:bg-muted/40 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                <span>Etkileşim</span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground tabular-nums">
                %{engagementRate}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Ziyaret / Dönüşüm</p>
            </div>
          </div>

          {/* Timeline and Details Box */}
          <div className="rounded-xl border border-border/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Yayın Bilgileri ve Zaman Çizelgesi
            </h4>
            <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <dt className="text-muted-foreground">Yayın Tarihi:</dt>
                <dd className="font-medium text-foreground">{formatDate(listing.publishedAt)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <dt className="text-muted-foreground">Bitiş Tarihi:</dt>
                <dd className="font-medium text-foreground">{formatDate(listing.endsAt)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                <dt className="text-muted-foreground">İlan No:</dt>
                <dd className="font-mono text-foreground">{listing.id.slice(0, 13)}...</dd>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <dt className="text-muted-foreground">Vitrin Paketi:</dt>
                <dd className="font-medium text-foreground">
                  {listing.isShowcase ? 'Aktif (Öne Çıkarılmış)' : 'Standart İlan'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Performance Enhancement Banner */}
          {!listing.isShowcase && (
            <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400 shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-display text-sm font-semibold text-foreground">
                    İlanınızı 5 Kat Daha Fazla Kişiye Ulaştırın
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Vitrin paketleri ile ilanınızı ana sayfa ve arama sonuçlarının en üst sıralarına taşıyarak daha hızlı sonuç alabilirsiniz.
                  </p>
                  {onOpenPromote && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        onOpenPromote();
                      }}
                      className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm"
                    >
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      Vitrine Taşı
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-zinc-50/70 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/70">
          <Button asChild variant="outline" size="sm" className="rounded-lg gap-1.5">
            <Link href={`/ilanlarim/${listing.id}/duzenle`}>
              <Pencil className="h-3.5 w-3.5" />
              İlanı Düzenle
            </Link>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-lg px-5"
          >
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
