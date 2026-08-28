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
        body: JSON.stringify({ action: 'urgent' }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Süper İlan işlemi başarısız oldu.');
      }

      toast.success('İlanınız başarıyla Süper İlan yapıldı!');
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
          <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs uppercase tracking-wider">
            <Zap className="h-4 w-4" />
            <span>Öncelikli Listeleme</span>
          </div>
          <DialogTitle className="mt-2 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            İlanınızı Süper İlan Yapın
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            <strong className="text-foreground font-medium">{listing.title}</strong> ilanınızı Keşfet ve aramalarda en üst sıraya taşıyın.
          </DialogDescription>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          {/* Packages List */}
          <div className="space-y-3">
            {/* Süper İlan Paketi */}
            <div className="relative rounded-xl border border-rose-500/40 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent p-4 transition-all hover:border-rose-500">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-rose-500 p-2 text-white shadow-sm shrink-0">
                    <Zap className="h-5 w-5 fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm font-bold text-foreground">
                        Süper İlan Paketi
                      </h4>
                      {listing.isUrgentShowcase && (
                        <span className="rounded-full bg-rose-500/15 text-rose-600 px-2 py-0.5 text-[10px] font-semibold">
                          Şu an Aktif
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Keşfet sayfasında ve tüm aramalarda en üst sırada kırmızı parlayan Süper İlan rozetiyle listelenin.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Maksimum Dönüşüm ve Anında Öncelikli Başvuru
                    </div>
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
            {!listing.isUrgentShowcase && (
              <Button
                type="button"
                size="sm"
                disabled={isActivating}
                onClick={handleInstantBoost}
                className="rounded-lg bg-rose-500 hover:bg-rose-600 text-white gap-1.5 shadow-sm font-medium"
              >
                {isActivating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5 fill-white" />
                )}
                <span>Hemen Süper İlan Yap</span>
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
