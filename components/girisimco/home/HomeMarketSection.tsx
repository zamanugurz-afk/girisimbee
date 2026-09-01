'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight, Sparkles, Store, CheckCircle2 } from 'lucide-react';
import {
  getMockHomeMarketAds,
  MARKET_HOME_PREVIEW_COUNT,
  type MarketItem,
} from '@/features/admin/market';
import { toPublicMarketItem } from '@/features/admin/market/lib/public-market-item';
import {
  MARKET_HOME_CTA_HREF,
  MARKET_HOME_CTA_LABEL,
} from '@/features/admin/market/presentation/market-copy';
import { cn } from '@/lib/utils';

/**
 * Editorial Showcase Layout for Girişimbee Market
 * Inspired by the clean editorial split layout (Cursive Title + Underline + Josefin Sans copy + Large Rounded Visual Showcase).
 */
export function HomeMarketSection({ fold = false }: { fold?: boolean }) {
  const [items, setItems] = useState<MarketItem[]>(() => getMockHomeMarketAds());
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);

    async function load() {
      try {
        const res = await fetch('/api/market', { signal: controller.signal });
        if (!res.ok) return;
        const json = (await res.json()) as { data?: { items?: MarketItem[] } };
        const live = (json.data?.items ?? [])
          .filter((item) => item.status === 'published' && !item.deletedAt)
          .map(toPublicMarketItem)
          .slice(0, MARKET_HOME_PREVIEW_COUNT);
        if (!cancelled && live.length > 0) {
          setItems(live);
        }
      } catch {
        /* keep seed mocks */
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  // 5 Saniyelik Otomatik Döngü (Hover esnasında duraklar)
  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length, isPaused]);

  const activeItem = items[activeIndex] || items[0];
  const activeHref = activeItem?.linkUrl || `/market/${activeItem?.id || ''}`;

  return (
    <section
      id="market-section"
      className={cn(
        'relative z-[1] min-w-0 overflow-x-hidden bg-transparent dark:bg-transparent',
        fold && 'shrink-0',
      )}
      aria-labelledby="home-market-heading"
    >
      <div
        className={cn(
          'mx-auto w-full max-w-[1280px] px-5 lg:px-8',
          fold ? 'py-4' : 'py-8 sm:py-12 lg:py-14',
        )}
      >
        {/* Main Editorial Card Container */}
        <div className="relative overflow-hidden rounded-[2.25rem] bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 sm:p-10 lg:p-14">
          
          {/* Subtle Ambient Glows inside card */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden="true" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* ========================================================================= */}
            {/* SOL ALAN: EDITORIAL BAŞLIK, VURGULU ÇİZGİ, AÇIKLAMA VE FIRSAT LİSTESİ     */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              
              {/* Normal / Standart Başlık */}
              <div className="inline-flex items-baseline gap-2">
                <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white select-none">
                  Girişimbee <span className="text-amber-500">Market</span>
                </h2>
              </div>

              {/* Vurgu Çizgisi (Teal/Turkuaz & Kehribar Gradyan) */}
              <div className="mt-2.5 mb-5 h-1.5 w-16 rounded-full bg-gradient-to-r from-teal-400 to-amber-500" />

              {/* Kalın Josefin Sans Alt Başlık */}
              <h3 className="font-sans text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-snug">
                Seçili fırsat, stratejik ortaklık ve Çözümler
              </h3>

              {/* Josefin Sans Gövde Metinleri */}
              <div className="mt-4 space-y-3 text-[14px] sm:text-[15px] leading-relaxed text-slate-600 dark:text-zinc-400 font-normal">
                <p>
                  Girişim ekosisteminde doğrulanmış en gözde fırsatlar, yatırım turları, stratejik iş birlikleri ve kurumsal büyüme çözümleri tek bir vitrinde toplanıyor.
                </p>
                <p>
                  Her fırsat titizlikle incelenir, doğrudan karar vericilerle gizli ve güvenli iletişim kanalı oluşturularak doğru insanlarla doğru hedeflere ulaşmanız sağlanır.
                </p>
              </div>

              {/* 4 Seçili Fırsat Butonları (Interaktif Seçici) */}
              <div className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {items.map((item, idx) => {
                    const isSelected = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveIndex(idx);
                          setIsPaused(true);
                          setTimeout(() => setIsPaused(false), 8000);
                        }}
                        className={cn(
                          'group text-left px-3.5 py-3 rounded-2xl text-[12.5px] font-bold transition-all duration-300 flex items-center justify-between border relative overflow-hidden',
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm scale-[1.01]'
                            : 'bg-slate-50/80 text-slate-700 hover:bg-slate-100 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800 border-slate-200/80 dark:border-zinc-700/80',
                        )}
                      >
                        <span className="truncate pr-2 relative z-10">{item.title}</span>
                        <span
                          className={cn(
                            'text-[11px] shrink-0 font-black px-2 py-0.5 rounded-md relative z-10',
                            isSelected
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-200/80 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300 group-hover:bg-amber-100 group-hover:text-amber-800',
                          )}
                        >
                          #{idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alt Aksiyon Butonları */}
              <div className="mt-7 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <Link
                  href={MARKET_HOME_CTA_HREF}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm px-5 py-3 shadow-sm shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>{MARKET_HOME_CTA_LABEL}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/reklam"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4.5 py-3 text-sm font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 hover:border-slate-300 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Fırsat / Reklam Ekle</span>
                </Link>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SAĞ ALAN: 5 SN'DE BİR DÖNEN BÜYÜK GÖRSEL KART & VİTRİN ŞOVU               */}
            {/* ========================================================================= */}
            <div
              className="lg:col-span-7 flex flex-col justify-center w-full"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="group relative overflow-hidden rounded-[2.25rem] bg-slate-100 dark:bg-zinc-800 border border-slate-200/90 dark:border-zinc-700 shadow-2xl aspect-[16/10] sm:aspect-[16/10] lg:aspect-[16/10] min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] w-full">
                
                {/* Büyük Görsel (Fade geçişli) */}
                <div key={activeItem?.id} className="absolute inset-0 transition-opacity duration-700 animate-fade-in">
                  {activeItem?.imageUrl ? (
                    <Image
                      src={activeItem.imageUrl}
                      alt={activeItem.title}
                      fill
                      priority
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 800px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-400">
                      <Store className="h-12 w-12" aria-hidden />
                    </div>
                  )}
                </div>

                {/* Görsel Üzeri Hafif Karartma Gradyanı */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20 pointer-events-none" />

                {/* 5 Saniyelik Segmentli İlerleme Çizgileri */}
                <div className="absolute top-4 left-5 right-5 sm:left-6 sm:right-6 z-20 flex gap-2 pointer-events-none">
                  {items.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full bg-white/30 overflow-hidden backdrop-blur-xs shadow-xs"
                    >
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          i === activeIndex
                            ? 'w-full bg-amber-400 duration-500 shadow-sm shadow-amber-400/50'
                            : i < activeIndex
                            ? 'w-full bg-white/85'
                            : 'w-0',
                        )}
                      />
                    </div>
                  ))}
                </div>

                {/* Üst Rozet: FIRSAT & DOĞRULANMIŞ */}
                <div className="absolute top-8 sm:top-9 left-5 right-5 sm:left-6 sm:right-6 z-10 flex items-center justify-between pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-amber-500/30">
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    SEÇİLİ FIRSAT
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-semibold border border-white/15 shadow-md">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Doğrulanmış
                  </span>
                </div>

                {/* Alt Detay Kartı (Glassmorphism Katmanı) */}
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-10 p-5 sm:p-6 rounded-[1.6rem] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-white/30 dark:border-zinc-800 shadow-2xl transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-sans text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-1">
                        {activeItem?.title}
                      </h4>
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                        {activeItem?.description}
                      </p>
                    </div>

                    {/* Detay Butonu */}
                    <Link
                      href={activeHref}
                      className="shrink-0 self-start sm:self-center inline-flex items-center gap-2 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs sm:text-sm font-bold px-4.5 py-3 shadow-md transition-all hover:scale-105 active:scale-95"
                    >
                      <span>{activeItem?.ctaLabel || 'İncele'}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export function MarketAdCard({
  item,
  fold = false,
}: {
  item: MarketItem;
  fold?: boolean;
}) {
  const detailHref = item.linkUrl || `/market/${item.id}`;

  return (
    <Link
      href={detailHref}
      className={cn(
        'group relative flex h-full min-h-[15rem] flex-col overflow-hidden rounded-2xl',
        'border border-slate-200/90 bg-white/90 shadow-sm transition-all duration-300',
        'hover:border-amber-500/50 hover:shadow-md hover:-translate-y-0.5',
        'dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-amber-500/40',
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 350px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <Store className="h-8 w-8" aria-hidden />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase">
            Market
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[15px] font-bold leading-snug text-slate-900 dark:text-white transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-1">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
          {item.description}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3.5 text-xs font-bold text-slate-900 dark:text-amber-400 transition-colors group-hover:text-amber-600">
          <span>{item.ctaLabel || 'İncele'}</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
