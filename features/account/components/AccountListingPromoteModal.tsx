'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Flame, ArrowRight, ShieldCheck, Check, Loader2 } from 'lucide-react';
import type { AccountListingCardData } from '@/features/account/types/account-listings.types';

export function AccountListingPromoteModal({
  listing,
  open,
  onOpenChange,
  onPromoted,
}: {
  listing: AccountListingCardData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPromoted?: (id: string) => void;
}) {
  const [isActivating, setIsActivating] = useState(false);

  const handleInstantBoost = async () => {
    setIsActivating(true);
    try {
      const res = await fetch(`/api/account/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'showcase' }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Vitrine taşıma işlemi başarısız oldu.');
      }

      toast.success('İlanınız başarıyla vitrine taşındı ve öne çıkarıldı!');
      onPromoted?.(listing.id);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'İşlem başarısız');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden rounded-2xl p-0 border border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
        {/* Header */}
        <div className="border-b border-border/80 p-6 pb-5">
          <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Öne Çıkarma & Vitrin</span>
          </div>
          <DialogTitle className="mt-2 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            İlanınızı Vitrine Taşıyın
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            <strong className="text-foreground font-medium">{listing.title}</strong> ilanınızın görünürlüğünü katlayın.
          </DialogDescription>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          {/* Packages List */}
          <div className="space-y-3">
            {/* Package 1 */}
            <div className="relative rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 transition-all hover:border-amber-500">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-amber-500 p-2 text-white shadow-sm shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm font-bold text-foreground">
                        Ana Sayfa Vitrin Paketi
                      </h4>
                      {listing.isShowcase && (
                        <span className="rounded-full bg-emerald-500/15 text-emerald-600 px-2 py-0.5 text-[10px] font-semibold">
                          Şu an Aktif
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Girişimbee ana sayfasındaki premium vitrinde en üst sırada listelenin.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      5x Daha Fazla Görüntülenme Garantisi
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Package 2 */}
            <div className="relative rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent p-4 transition-all hover:border-rose-500/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-rose-500 p-2 text-white shadow-sm shrink-0">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground">
                      Acil İlan Rozeti
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      İlan kartınızda parlayan kırmızı "Acil" rozeti ile aramalarda doğrudan dikkat çekin.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                      <Zap className="h-3.5 w-3.5" />
                      Hızlı Başvuru & İletişim Akışı
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Package 3 */}
            <div className="relative rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent p-4 transition-all hover:border-indigo-500/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-indigo-500 p-2 text-white shadow-sm shrink-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground">
                      Kategori Sabitleme
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      İlgili kategorinin listeleme sayfasında ilk sırada kalın.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-zinc-50/70 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/70">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-lg"
          >
            Kapat
          </Button>

          <div className="flex items-center gap-2">
            {!listing.isShowcase && (
              <Button
                type="button"
                size="sm"
                disabled={isActivating}
                onClick={handleInstantBoost}
                className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white gap-1.5 shadow-sm font-medium"
              >
                {isActivating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>Hemen Vitrine Taşı</span>
              </Button>
            )}

            <Button asChild variant="outline" size="sm" className="rounded-lg gap-1.5">
              <Link href="/reklam" onClick={() => onOpenChange(false)}>
                <span>Tüm Paketler</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
