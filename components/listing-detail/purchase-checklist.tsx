'use client';

import { motion } from 'framer-motion';
import { CheckSquare, Square, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useListingNotes } from '@/hooks/use-listing-notes';
import type { ListingResponse } from '@/types';

interface PurchaseChecklistProps {
  listing: ListingResponse;
}

type CategoryKey = 'gaming' | 'apple-watch' | 'samsung-watch';

const CHECKLISTS: Record<CategoryKey, string[]> = {
  gaming: [
    'Orijinal Kutu',
    'Fatura',
    'Garanti',
    'Orijinal Kontrolcü',
    'HDMI Kablo',
    'Güç Kablosu',
    'Seri Numarası',
    'Kontrolcü Drift Testi',
    'Fan Sesi',
    'Disk Okuyucu Testi',
    'USB Portları',
    'WiFi',
    'Bluetooth',
    'Fabrika Sıfırlama',
    'Hesap Çıkışı',
  ],
  'apple-watch': [
    'Batarya Sağlığı',
    'Aktivasyon Kilidi',
    'Ekran',
    'Mikrofon',
    'Hoparlör',
    'Sensörler',
    'Orijinal Şarj Aleti',
  ],
  'samsung-watch': [
    'Batarya',
    'AMOLED Ekran',
    'Bluetooth',
    'WiFi',
    'NFC',
    'LTE',
    'Orijinal Şarj Aleti',
  ],
};

function getCategoryKey(listing: ListingResponse): CategoryKey {
  const product = listing.product;
  if (!product) return 'gaming';
  if (product.brand === 'Apple') return 'apple-watch';
  if (product.brand === 'Samsung') return 'samsung-watch';
  return 'gaming';
}

export function PurchaseChecklist({ listing }: PurchaseChecklistProps) {
  const categoryKey = getCategoryKey(listing);
  const items = CHECKLISTS[categoryKey];
  const { checklistChecked, setChecklistChecked, isSaving } = useListingNotes(listing.id);
  const checked = checklistChecked;

  const toggle = (idx: number) => {
    const next = new Set(checked);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setChecklistChecked([...next]);
  };

  const progress = items.length > 0 ? (checked.size / items.length) * 100 : 0;

  const reset = () => {
    setChecklistChecked([]);
    toast('Kontrol listesi sıfırlandı');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="ib-card p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-soft text-success">
            <ClipboardCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Satın Alma Kontrol Listesi</h3>
            <p className="text-xs text-muted-foreground">
              {listing.product?.name} için kontrol noktaları
            </p>
          </div>
        </div>
        <button
          onClick={reset}
          disabled={isSaving}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          Sıfırla
        </button>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">İlerleme</span>
          <span className="font-bold text-foreground">{Math.round(progress)}% ({checked.size}/{items.length})</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className={cn(
              'h-full rounded-full',
              progress === 100 ? 'bg-success' : progress >= 50 ? 'bg-primary' : 'bg-warning',
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => {
          const isChecked = checked.has(idx);
          return (
            <button
              key={idx}
              onClick={() => toggle(idx)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all',
                isChecked
                  ? 'border-success/40 bg-success-soft/15'
                  : 'border-border bg-card/30 hover:border-primary/30 hover:bg-muted/30',
              )}
            >
              {isChecked ? (
                <CheckSquare className="h-4 w-4 shrink-0 text-success" />
              ) : (
                <Square className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className={cn(
                'text-sm font-medium',
                isChecked ? 'text-success line-through' : 'text-foreground',
              )}>
                {item}
              </span>
            </button>
          );
        })}
      </div>

      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 rounded-xl bg-success-soft px-4 py-3 text-sm font-semibold text-success"
        >
          <CheckSquare className="h-4 w-4" />
          Tüm kontrol noktaları tamam! Güvenle satın alabilirsiniz.
        </motion.div>
      )}
    </motion.div>
  );
}
