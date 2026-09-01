'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Flame, Sparkles, ArrowLeft } from 'lucide-react';
import { MONTHLY_TREND_IDEAS } from '@/lib/data/monthly-trend-ideas';
import { TrendIdeaCard, TrendIdeaAdvertiseCta } from './TrendIdeaCard';
import { cn } from '@/lib/utils';

export function TrendIdeaCatalogView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

  const categories = ['Tümü', 'Otomotiv & Mobil', 'Evcil Hayvan', 'B2B & Kurumsal', 'Hizmet & Otomasyon'];

  const filteredItems = selectedCategory === 'Tümü'
    ? MONTHLY_TREND_IDEAS
    : MONTHLY_TREND_IDEAS.filter((i) => i.category === selectedCategory);

  return (
    <div className="gc-header-offset min-w-0 overflow-x-hidden border-b border-[#EEF0F4] bg-[#FAFBFC] dark:border-border dark:bg-background">
      <div className="mx-auto min-w-0 max-w-[1280px] px-5 py-8 lg:px-8 lg:py-10">
        
        {/* Üst Geri Dön Bağlantısı */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-zinc-400 transition-colors hover:text-slate-950 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
            <Flame className="w-3.5 h-3.5 fill-current" />
            Eylül 2026 Edisyonu
          </span>
        </div>

        {/* Başlık Alanı */}
        <div className="mb-8 max-w-2xl">
          <p className="inline-flex items-center gap-1.5 font-display text-[13px] font-bold tracking-tight text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            Girişimbee Niş Konseptler
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl">
            Trend & Yeni Nesil İş Fikirleri
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400 sm:text-[15px]">
            Uçuk teoriler yerine; sermayesi, amortismanı, aylık net kârı ve operasyonel fizibilitesi hesaplanmış uygulanabilir niş modeller.
          </p>
        </div>

        {/* Kategori Filtre Butonları */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap select-none',
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-muted-foreground border border-slate-200/90 dark:border-zinc-700 hover:text-slate-900 dark:hover:text-white',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* İlan Kartları Izgarası (3 Kolonlu Kart Düzeneği) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, idx) => (
            <TrendIdeaCard key={item.id} item={item} index={idx} />
          ))}
          <TrendIdeaAdvertiseCta />
        </div>

      </div>
    </div>
  );
}

export default TrendIdeaCatalogView;
