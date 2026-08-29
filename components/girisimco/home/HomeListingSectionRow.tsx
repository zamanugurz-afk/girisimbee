'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  ChevronRight,
  Flame,
  Calendar,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  MapPin,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import type { ContentItem } from '@/features/categories/types/category.types';
import type { HomeListingSectionConfig } from '@/features/home/config/home-sections.config';
import type { HomeListingSectionState } from '@/features/home/types/home-section.types';
import { resolveContextualListingImage } from '@/features/listings/services/contextual-listing-image-resolver';
import { listingHref } from '@/features/listings/services/listing.service';
import { cn } from '@/lib/utils';

interface HomeListingSectionRowProps {
  config: HomeListingSectionConfig;
  state: HomeListingSectionState;
}

const DESKTOP_LIMIT = 4;

interface SectionTheming {
  badgeText: string;
  badgeBg: string;
  glowLeft: string;
  glowRight: string;
  gradientLine: string;
  titlePrefix: string;
  titleHighlight: string;
  highlightClass: string;
  subtitle: string;
  editorialText1: string;
  editorialText2: string;
  ctaBtnGradient: string;
  ctaBtnLabel: string;
  secondaryBtnLabel: string;
  secondaryBtnHref: string;
}

const THEME_MAP: Record<string, SectionTheming> = {
  urgent: {
    badgeText: 'SÜPER İLAN',
    badgeBg: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white',
    glowLeft: 'bg-rose-500/10',
    glowRight: 'bg-amber-500/10',
    gradientLine: 'bg-gradient-to-r from-rose-500 to-amber-500',
    titlePrefix: 'Süper',
    titleHighlight: 'İlanlar',
    highlightClass: 'text-rose-500',
    subtitle: 'Öncelikli vitrin, acil devir ve hızlandırılmış fırsatlar',
    editorialText1:
      'Girişim ekosisteminde süper paket avantajıyla öne çıkarılan, acil değerlendirilmesi gereken ve karar vericileri aktif olan seçili fırsatlar.',
    editorialText2:
      'Her ilan doğrulanmış yetkililer tarafından yönetilir; anında doğrudan iletişim kurarak süreci hızlandırabilirsiniz.',
    ctaBtnGradient: 'from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white',
    ctaBtnLabel: 'Tüm Süper İlanlar',
    secondaryBtnLabel: 'İlanını Öne Çıkar',
    secondaryBtnHref: '/ilan/olustur',
  },
  today: {
    badgeText: 'BUGÜN YAYINDA',
    badgeBg: 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white',
    glowLeft: 'bg-sky-500/10',
    glowRight: 'bg-emerald-500/10',
    gradientLine: 'bg-gradient-to-r from-sky-400 to-emerald-500',
    titlePrefix: 'Bugünün',
    titleHighlight: 'İlanları',
    highlightClass: 'text-sky-500',
    subtitle: 'Son 24 saatte platforma eklenen en taze fırsatlar',
    editorialText1:
      'Ekosistemde bugün yayına giren yeni ortaklıklar, açık iş ilanları, franchise ve devir fırsatları tek bir vitrinde toplanıyor.',
    editorialText2:
      'Yeni eklenen fırsatları ilk keşfeden siz olun; ilk başvuran ve ilk görüşen olma avantajını hemen yakalayın.',
    ctaBtnGradient: 'from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white',
    ctaBtnLabel: 'Bugünün Tüm İlanları',
    secondaryBtnLabel: 'Bugün İlan Ver',
    secondaryBtnHref: '/ilan/olustur',
  },
  most_viewed: {
    badgeText: 'EN ÇOK İZLENEN',
    badgeBg: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
    glowLeft: 'bg-purple-500/10',
    glowRight: 'bg-indigo-500/10',
    gradientLine: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    titlePrefix: 'En Çok',
    titleHighlight: 'Görüntülenenler',
    highlightClass: 'text-purple-500',
    subtitle: 'Topluluk tarafından en fazla ilgi gören ve incelenen vitrinler',
    editorialText1:
      'Girişimciler, yatırımcılar ve yetenekler arasında en yüksek etkileşim, görüntüleme ve başvuru hacmine sahip popüler ilanlar.',
    editorialText2:
      'Piyasa trendlerini ve ekosistemde en çok talep gören iş modellerini keşfederek stratejinizi belirleyin.',
    ctaBtnGradient: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white',
    ctaBtnLabel: 'Tüm Popüler İlanlar',
    secondaryBtnLabel: 'Tümünü Keşfet',
    secondaryBtnHref: '/kesfet',
  },
};

export function HomeListingSectionRow({
  config,
  state,
}: HomeListingSectionRowProps) {
  const visibleItems = state.items.slice(0, DESKTOP_LIMIT);
  const theme = THEME_MAP[config.id] || THEME_MAP.urgent;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 5 Saniyelik Otomatik Döngü (Hover esnasında duraklar)
  useEffect(() => {
    if (isPaused || visibleItems.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % visibleItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [visibleItems.length, isPaused]);

  if (state.isLoading) {
    return (
      <div className="relative overflow-hidden rounded-[2.25rem] bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800/80 p-8 sm:p-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="h-10 w-48 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
            <div className="h-2 w-16 bg-slate-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-6 w-72 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-20 w-full bg-slate-100 dark:bg-zinc-800/50 rounded-xl" />
            <div className="grid grid-cols-2 gap-2.5 pt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-zinc-800 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 h-[420px] bg-slate-200 dark:bg-zinc-800 rounded-[2.25rem]" />
        </div>
      </div>
    );
  }

  if (visibleItems.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[2.25rem] bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800/80 p-10 text-center text-slate-500">
        {config.emptyMessage}
      </div>
    );
  }

  const activeItem = visibleItems[activeIndex] || visibleItems[0];
  const activeHref = activeItem.href ?? (activeItem.listingId ? listingHref(activeItem.id) : activeItem.id ? `/ilan/${activeItem.id}` : '#');
  const typeLabel = activeItem.listingTypeLabel ?? activeItem.listingGroupLabel ?? 'İlan';
  const displayImage = resolveContextualListingImage({
    title: activeItem.title,
    description: activeItem.description || activeItem.detail,
    categorySlug: activeItem.listingGroupLabel || activeItem.tag,
    categoryName: typeLabel,
    sector: activeItem.sector,
    imageUrl: activeItem.imageUrl,
    coverUrl: activeItem.coverUrl,
  });

  return (
    <section
      id={`section-${config.id}`}
      className="relative overflow-hidden rounded-[2.25rem] bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 sm:p-10 lg:p-12"
      aria-labelledby={`home-section-heading-${config.id}`}
    >
      {/* Subtle Ambient Glows inside card */}
      <div className={cn('pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl', theme.glowRight)} aria-hidden="true" />
      <div className={cn('pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full blur-3xl', theme.glowLeft)} aria-hidden="true" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* ========================================================================= */}
        {/* SOL ALAN: EDITORIAL BAŞLIK, VURGULU ÇİZGİ, AÇIKLAMA VE İLAN LİSTESİ       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          
          {/* Bölüm Başlığı */}
          <div className="inline-flex items-baseline gap-2">
            <h2 id={`home-section-heading-${config.id}`} className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white select-none">
              {theme.titlePrefix} <span className={theme.highlightClass}>{theme.titleHighlight}</span>
            </h2>
          </div>

          {/* Vurgu Çizgisi */}
          <div className={cn('mt-2.5 mb-5 h-1.5 w-16 rounded-full', theme.gradientLine)} />

          {/* Alt Başlık */}
          <h3 className="font-sans text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-snug">
            {theme.subtitle}
          </h3>

          {/* Gövde Metinleri */}
          <div className="mt-4 space-y-3 text-[14px] sm:text-[15px] leading-relaxed text-slate-600 dark:text-zinc-400 font-normal">
            <p>{theme.editorialText1}</p>
            <p>{theme.editorialText2}</p>
          </div>

          {/* 4 Seçili İlan Butonları (Interaktif Seçici) */}
          <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {visibleItems.map((item, idx) => {
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
              href={config.viewAllHref}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r font-bold text-sm px-5 py-3 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]',
                theme.ctaBtnGradient,
              )}
            >
              <span>{theme.ctaBtnLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href={theme.secondaryBtnHref}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4.5 py-3 text-sm font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 hover:border-slate-300 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{theme.secondaryBtnLabel}</span>
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
            <div key={activeItem.id} className="absolute inset-0 transition-opacity duration-700 animate-fade-in">
              <Image
                src={displayImage}
                alt={activeItem.title}
                fill
                priority
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 800px"
                unoptimized
              />
            </div>

            {/* Görsel Üzeri Hafif Karartma Gradyanı */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20 pointer-events-none" />

            {/* 5 Saniyelik Segmentli İlerleme Çizgileri */}
            <div className="absolute top-4 left-5 right-5 sm:left-6 sm:right-6 z-20 flex gap-2 pointer-events-none">
              {visibleItems.map((_, i) => (
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

            {/* Üst Rozet: BÖLÜM ROZETİ & DOĞRULANMIŞ */}
            <div className="absolute top-8 sm:top-9 left-5 right-5 sm:left-6 sm:right-6 z-10 flex items-center justify-between pointer-events-none">
              <span className={cn('inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide shadow-lg', theme.badgeBg)}>
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                {theme.badgeText}
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
                  
                  {/* Kategori & Şirket Satırı */}
                  <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                      {typeLabel}
                    </span>
                    {activeItem.companyName ? (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {activeItem.companyName}
                      </span>
                    ) : activeItem.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {activeItem.location}
                      </span>
                    ) : null}
                  </div>

                  <h4 className="font-sans text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-1">
                    {activeItem.title}
                  </h4>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                    {activeItem.description || activeItem.detail}
                  </p>
                </div>

                {/* Detay Butonu */}
                <Link
                  href={activeHref}
                  className="shrink-0 self-start sm:self-center inline-flex items-center gap-2 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs sm:text-sm font-bold px-4.5 py-3 shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <span>İncele</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
