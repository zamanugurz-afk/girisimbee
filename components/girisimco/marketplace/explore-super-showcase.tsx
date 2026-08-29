'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, CheckCircle2, ChevronRight, Plus, Sparkles, Zap } from 'lucide-react';
import type { ContentItem } from '@/features/categories/types/category.types';
import { resolveContextualListingImage } from '@/features/listings/services/contextual-listing-image-resolver';
import { listingHref } from '@/features/listings/services/listing.service';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExploreSuperShowcaseProps {
  items: ContentItem[];
  className?: string;
}

export function ExploreSuperShowcase({ items, className }: ExploreSuperShowcaseProps) {
  // En azından süper / acil veya öne çıkan ilanları filtrele; eğer yoksa ilk 4 ilanı al
  const superItems = useMemo(() => {
    const urgents = items.filter((item) => item.isUrgent || item.isShowcase);
    if (urgents.length > 0) return urgents.slice(0, 4);
    return items.slice(0, 4);
  }, [items]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 5 Saniyede bir otomatik geçiş
  useEffect(() => {
    if (isPaused || superItems.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % superItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [superItems.length, isPaused]);

  if (superItems.length === 0) return null;

  const currentItem = superItems[activeIndex] || superItems[0];
  const itemHref = currentItem.href ?? (currentItem.listingId ? listingHref(currentItem.id) : `/ilan/${currentItem.id}`);

  const displayImage = resolveContextualListingImage({
    title: currentItem.title,
    description: currentItem.description || currentItem.detail,
    categorySlug: currentItem.listingGroupLabel || currentItem.tag,
    categoryName: currentItem.listingTypeLabel || 'İlan',
    sector: currentItem.sector,
    imageUrl: currentItem.imageUrl,
    coverUrl: currentItem.coverUrl,
  });

  const scrollToAllListings = () => {
    const el = document.getElementById('tum-ilanlar-alani');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-amber-500/[0.04] via-white to-slate-50 dark:from-zinc-900/90 dark:via-zinc-900 dark:to-zinc-950 border border-slate-200/90 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] p-6 sm:p-8 lg:p-10',
        className,
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Arka Plan Işık Efektleri */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* SOL ALAN: BAŞLIK, AÇIKLAMA VE İNTERAKTİF PİLL LİSTESİ */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          
          {/* Üst Başlık & Vurgu */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/20">
              <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>Öncelikli Fırsatlar</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Süper <span className="text-amber-500">İlanlar</span>
            </h2>
            
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full mt-2 mb-3" />
            
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-zinc-200">
              Seçili fırsat, stratejik ortaklık ve acil ilanlar
            </h3>
            
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-lg">
              Girişim ekosisteminde doğrulanmış en gözde fırsatlar, yatırım turları, açık pozisyonlar ve kurumsal büyüme modelleri öncelikli olarak bu vitrinde toplanıyor.
            </p>
          </div>

          {/* İNTERAKTİF İLAN SEÇİCİ TABLAR (#1, #2, #3, #4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-6">
            {superItems.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    'flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border text-left transition-all duration-300 group',
                    isSelected
                      ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-md shadow-slate-950/20 dark:bg-zinc-800 dark:border-amber-500/50'
                      : 'bg-white/80 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 hover:border-amber-500/40 hover:bg-amber-500/[0.02] text-slate-800 dark:text-zinc-200',
                  )}
                >
                  <span className="text-xs sm:text-[13px] font-bold line-clamp-1 pr-2">
                    {item.title}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-lg transition-colors',
                      isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 group-hover:bg-amber-500/20 group-hover:text-amber-600',
                    )}
                  >
                    #{idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ALT BUTONLAR */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              type="button"
              onClick={scrollToAllListings}
              className="h-11 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-transform active:scale-[0.98] inline-flex items-center gap-1.5"
            >
              <span>Tüm İlanları Keşfet</span>
              <ArrowDown className="h-4 w-4" />
            </Button>

            <Link
              href="/ilan/olustur"
              className="h-11 px-4 rounded-2xl border border-slate-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold text-xs sm:text-sm transition-all inline-flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>İlan Ver</span>
            </Link>
          </div>

        </div>

        {/* SAĞ ALAN: SPOTLIGHT VİTRİN KARTI (2. Resimdeki Tasarım) */}
        <div className="lg:col-span-6">
          <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-[2rem] border border-slate-200/90 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 shadow-xl transition-all duration-500">
            
            {/* Arka Plan Görseli */}
            <Image
              src={displayImage}
              alt={currentItem.title}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 600px"
              unoptimized
            />

            {/* Karartma degrade katmanı */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

            {/* Sol Üst Rozet: SÜPER İLAN */}
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-lg uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 fill-slate-950" />
                <span>SÜPER İLAN</span>
              </span>
            </div>

            {/* Sağ Üst Rozet: Doğrulanmış */}
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-400/30 text-xs font-bold shadow-md">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Doğrulanmış</span>
              </span>
            </div>

            {/* ALT FLOATING KART OVERLAY (2. Resimdeki Birebir Cam Kutu) */}
            <div className="absolute inset-x-3.5 bottom-3.5 sm:inset-x-4 sm:bottom-4 z-10">
              <div className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 sm:p-5 border border-white/40 dark:border-zinc-700/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {currentItem.listingTypeLabel || currentItem.tag || 'Öne Çıkan İlan'}
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                    {currentItem.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                    {currentItem.description || currentItem.detail || currentItem.location || 'Detayları inceleyin.'}
                  </p>
                </div>

                <Link
                  href={itemHref}
                  className="shrink-0 h-10 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <span>İlanı İncele</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
