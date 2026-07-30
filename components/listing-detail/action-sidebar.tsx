'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Link2,
  Share2,
  RefreshCw,
  GitCompare,
  Printer,
  Phone,
  MessageCircle,
  Bell,
  Check,
  Copy,
} from 'lucide-react';
import { cn, formatTry } from '@/lib/utils';
import { toast } from 'sonner';
import { getListingSourceUrl } from '@/lib/listing-source';
import { ListingSourceTextButton } from '@/components/data-display/listing-source-actions';
import type { ListingResponse, AIAnalysisResponse } from '@/types';

interface ActionSidebarProps {
  listing: ListingResponse;
  analysis: AIAnalysisResponse | undefined;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function ActionSidebar({ listing, analysis, isFavorite, onToggleFavorite }: ActionSidebarProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const sourceUrl = getListingSourceUrl(listing);

  const copyLink = () => {
    if (!sourceUrl) return;
    navigator.clipboard.writeText(sourceUrl);
    setLinkCopied(true);
    toast('İlan bağlantısı kopyalandı');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const share = async () => {
    if (!sourceUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `${listing.title} — ${formatTry(listing.price)}`,
          url: sourceUrl,
        });
      } catch {}
    } else {
      copyLink();
    }
  };

  const refreshAnalysis = () => {
    setRefreshing(true);
    toast('AI analizi yenileniyor…', { description: 'Birkaç saniye sürebilir' });
    setTimeout(() => {
      setRefreshing(false);
      toast('AI analizi güncellendi');
    }, 1500);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="sticky top-20 space-y-3">
      {/* Quick info */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="ib-card p-4"
      >
        <p className="text-xs text-muted-foreground">İlan Fiyatı</p>
        <p className="mt-1 font-display text-2xl font-bold text-foreground">{formatTry(listing.price)}</p>
        {analysis && (
          <div className="mt-2 flex items-center gap-2">
            <span className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold',
              analysis.opportunity_score >= 80 ? 'bg-success-soft text-success' : analysis.opportunity_score >= 55 ? 'bg-primary-soft text-primary' : 'bg-secondary text-muted-foreground',
            )}>
              AI {analysis.opportunity_score}
            </span>
            <span className="text-xs text-muted-foreground">{analysis.confidence}% güven</span>
          </div>
        )}
      </motion.div>

      {/* Primary action */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-2"
      >
        <ListingSourceTextButton
          listing={listing}
          label="Orijinal İlanı Aç"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-md"
          trailingIcon="external"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onToggleFavorite}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all',
              isFavorite
                ? 'border-danger/40 bg-danger-soft text-danger'
                : 'border-border bg-card text-foreground hover:border-danger/30 hover:bg-danger-soft/10',
            )}
          >
            <Heart className={cn('h-3.5 w-3.5', isFavorite && 'fill-current')} />
            {isFavorite ? 'Favoride' : 'Favori'}
          </button>

          <button
            onClick={copyLink}
            disabled={!sourceUrl}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-muted/30',
              !sourceUrl && 'cursor-not-allowed opacity-50',
            )}
          >
            {linkCopied ? <Check className="h-3.5 w-3.5 text-success" /> : <Link2 className="h-3.5 w-3.5" />}
            {linkCopied ? 'Kopyalandı' : 'Bağlantı'}
          </button>
        </div>

        <button
          onClick={share}
          disabled={!sourceUrl}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-muted/30',
            !sourceUrl && 'cursor-not-allowed opacity-50',
          )}
        >
          <Share2 className="h-3.5 w-3.5" />
          Paylaş
        </button>
      </motion.div>

      {/* Secondary actions */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="ib-card space-y-1 p-3"
      >
        <button
          onClick={refreshAnalysis}
          disabled={refreshing}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/30 disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4 text-muted-foreground', refreshing && 'animate-spin')} />
          Analizi Yenile
        </button>
        <button
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
          onClick={() => toast('Karşılaştırma listesine eklendi')}
        >
          <GitCompare className="h-4 w-4 text-muted-foreground" />
          Benzerlerle Karşılaştır
        </button>
        <button
          onClick={printReport}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
        >
          <Printer className="h-4 w-4 text-muted-foreground" />
          Raporu Yazdır
        </button>
      </motion.div>

      {/* Quick contact */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="ib-card space-y-2 p-4"
      >
        <p className="text-xs font-semibold text-muted-foreground">Hızlı İletişim</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => toast('Satıcı aranıyor…')}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-2 text-xs font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-muted/30"
          >
            <Phone className="h-3.5 w-3.5" />
            Ara
          </button>
          <button
            onClick={() => toast('WhatsApp açılıyor…')}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-success/30 bg-success-soft py-2 text-xs font-semibold text-success transition-all hover:bg-success-soft/80"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </button>
        </div>
        <button
          onClick={() => toast('Fiyat alarmı oluşturuldu')}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-warning/30 bg-warning-soft py-2 text-xs font-semibold text-warning transition-all hover:bg-warning-soft/80"
        >
          <Bell className="h-3.5 w-3.5" />
          Fiyat Alarmı Ekle
        </button>
      </motion.div>
    </div>
  );
}

interface BottomActionBarProps {
  listing: ListingResponse;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function BottomActionBar({ listing, isFavorite, onToggleFavorite }: BottomActionBarProps) {
  const [phoneCopied, setPhoneCopied] = useState(false);

  const copyPhone = () => {
    navigator.clipboard.writeText('+90 5XX XXX XX XX');
    setPhoneCopied(true);
    toast('Telefon numarası kopyalandı');
    setTimeout(() => setPhoneCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl lg:hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Fiyat</p>
          <p className="font-display text-sm font-bold text-foreground">{formatTry(listing.price)}</p>
        </div>

        <button
          onClick={onToggleFavorite}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
            isFavorite ? 'border-danger/40 bg-danger-soft text-danger' : 'border-border bg-card text-foreground',
          )}
          aria-label="Favori"
        >
          <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
        </button>

        <button
          onClick={copyPhone}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-all hover:bg-muted/30"
          aria-label="Telefon kopyala"
        >
          {phoneCopied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </button>

        <button
          onClick={() => toast('WhatsApp açılıyor…')}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-soft text-success transition-all hover:bg-success-soft/80"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </button>

        <ListingSourceTextButton
          listing={listing}
          label="Aç"
          className="flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90"
          trailingIcon="external"
        />
      </div>
    </motion.div>
  );
}
