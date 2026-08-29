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
      id="firsatlar"
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

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* ========================================================================= */}
            {/* SOL ALAN: EDITORIAL BAŞLIK, VURGULU ÇİZGİ, AÇIKLAMA VE FIRSAT LİSTESİ     */}
            {/* ========================================================================= */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              
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
                Seçili fırsat, stratejik ortaklık ve büyüme işbirlikleri
              </h3>

              {/* Josefin Sans Gövde Metinleri */}
              <div className="mt-4 space-y-3 text-[15px] sm:text-[16px] leading-relaxed text-slate-600 dark:text-zinc-400 font-normal">
                <p>
                  Girişim ekosisteminde doğrulanmış en gözde fırsatlar, yatırım turları ve franchise genişleme olanakları tek bir vitrinde toplanıyor.
                </p>
                <p>
                  Her fırsat titizlikle incelenir, doğrudan karar vericilerle gizli ve güvenli iletişim kanalı oluşturularak doğru insanlarla doğru hedeflere ulaşmanız sağlanır.
                </p>
              </div>

              {/* 4 Seçili Fırsat Butonları (Interaktif Seçici & Zaman Göstergesi) */}
              <div className="mt-6 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Öne Çıkan Fırsatlar ({items.length})
                  </span>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 animate-pulse">
                    ⚡ 5 sn'de bir değişir
                  </span>
                </div>
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
                          'group text-left px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 flex items-center justify-between border relative overflow-hidden',
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
              <div className="mt-8 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <Link
                  href={MARKET_HOME_CTA_HREF}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm px-5 py-3 shadow-sm shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>{MARKET_HOME_CTA_LABEL}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/ilan/olustur"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4.5 py-3 text-sm font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 hover:border-slate-300 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Fırsat İlanı Ekle</span>
                </Link>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SAĞ ALAN: 5 SN'DE BİR DÖNEN BÜYÜK GÖRSEL KART & VİTRİN ŞOVU               */}
            {/* ========================================================================= */}
            <div
              className="lg:col-span-6 flex flex-col justify-center"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="group relative overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-zinc-800 border border-slate-200/90 dark:border-zinc-700 shadow-xl aspect-[16/11] w-full">
                
                {/* Büyük Görsel (Fade geçişli) */}
                <div key={activeItem?.id} className="absolute inset-0 transition-opacity duration-700 animate-fade-in">
                  {activeItem?.imageUrl ? (
                    <Image
                      src={activeItem.imageUrl}
                      alt={activeItem.title}
                      fill
                      priority
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 600px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-400">
                      <Store className="h-12 w-12" aria-hidden />
                    </div>
                  )}
                </div>

                {/* Görsel Üzeri Hafif Karartma Gradyanı */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* 5 Saniyelik Segmentli İlerleme Çizgileri */}
                <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5 pointer-events-none">
                  {items.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden backdrop-blur-xs"
                    >
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          i === activeIndex
                            ? 'w-full bg-amber-400 duration-500'
                            : i < activeIndex
                            ? 'w-full bg-white/80'
                            : 'w-0',
                        )}
                      />
                    </div>
                  ))}
                </div>

                {/* Üst Rozet: FIRSAT & DOĞRULANMIŞ */}
                <div className="absolute top-6 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black tracking-wide shadow-md">
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                    SEÇİLİ FIRSAT
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Doğrulanmış
                  </span>
                </div>

                {/* Alt Detay Kartı (Glassmorphism Katmanı) */}
                <div className="absolute bottom-4 left-4 right-4 z-10 p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-white/20 dark:border-zinc-800 shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-sans text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                        {activeItem?.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                        {activeItem?.description}
                      </p>
                    </div>

                    {/* Detay Butonu */}
                    <Link
                      href={activeHref}
                      className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold px-3.5 py-2.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <span>{activeItem?.ctaLabel || 'İncele'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
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
}: {
  item: MarketItem;
  fold?: boolean;
}) {
  const detailHref = item.linkUrl || `/market/${item.id}`;

  return (
    <Link
      href={detailHref}
      className={cn(
        'group flex h-[5.5rem] gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-2.5',
        'backdrop-blur-md transition duration-200 shadow-sm',
        'hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-md',
        'dark:border-zinc-800 dark:bg-zinc-900/85',
      )}
    >
      <div className="relative h-full w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="72px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            <Store className="h-4 w-4" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pr-0.5">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400">
          Market
        </span>
        <h3 className="line-clamp-1 font-sans text-[13px] font-semibold leading-snug text-foreground">
          {item.title}
        </h3>
        <p className="line-clamp-1 text-[11px] text-muted-foreground">
          {item.description}
        </p>
      </div>
    </Link>
  );
}
