'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  Percent,
  MapPin,
  Users,
  Rocket,
  Wrench,
  Store,
  UserCheck,
  ChevronRight,
  Zap,
  CheckCircle2,
  ArrowUpRight,
  Layers,
  X,
  PlusCircle,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { MONTHLY_TREND_IDEAS, PracticalBusinessIdea } from '@/lib/data/monthly-trend-ideas';
import { cn } from '@/lib/utils';

export function HomeTrendBusinessIdeasSection() {
  const [items] = useState<PracticalBusinessIdea[]>(MONTHLY_TREND_IDEAS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState<'showcase' | 'grid'>('showcase');
  const [selectedModalIdea, setSelectedModalIdea] = useState<PracticalBusinessIdea | null>(null);

  // 5 Saniyelik Otomatik Döngü (Hover esnasında duraklar)
  useEffect(() => {
    if (isPaused || items.length <= 1 || viewMode === 'grid') return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length, isPaused, viewMode]);

  const activeItem = items[activeIndex] || items[0];

  const handleSimulateInCockpit = (ideaTitle?: string) => {
    if (selectedModalIdea) setSelectedModalIdea(null);
    window.location.hash = 'assistant-section';
    const el = document.getElementById('assistant-section') || document.getElementById('cockpit-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCheckGrants = () => {
    if (selectedModalIdea) setSelectedModalIdea(null);
    window.location.hash = 'grants-section';
    const el = document.getElementById('grants-section') || document.getElementById('cockpit-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="trend-ideas-section"
      className="relative z-[1] min-w-0 overflow-x-hidden bg-transparent dark:bg-transparent py-8 sm:py-12 lg:py-14"
      aria-labelledby="home-trend-ideas-heading"
    >
      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. EDITORIAL SHOWCASE KATALOG BLOĞU (GİRİŞİMBEE MARKET DÜZENİ)           */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-[2.25rem] bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 sm:p-10 lg:p-14">
          
          {/* Arka Plan Glow Vurguları */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" aria-hidden="true" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* ========================================================================= */}
            {/* SOL ALAN: BAŞLIK, VURGULU ÇİZGİ, AÇIKLAMA VE 4'LÜ KATALOG SEÇİCİ          */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              
              {/* Üst Küçük Rozet */}
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
                  Aylık Niş Konseptler
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  • 2026 Fizibilite Kataloğu
                </span>
              </div>

              {/* Ana Başlık */}
              <h2 id="home-trend-ideas-heading" className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white select-none">
                Trend & Yeni <span className="text-amber-500">İş Fikirleri</span>
              </h2>

              {/* Vurgu Çizgisi */}
              <div className="mt-2.5 mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />

              {/* Kalın Alt Başlık */}
              <h3 className="font-sans text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-snug">
                Sermayesi ve amortismanı doğrulanmış niş modeller
              </h3>

              {/* Açıklama */}
              <div className="mt-3 space-y-2 text-[14px] leading-relaxed text-slate-600 dark:text-zinc-400 font-normal">
                <p>
                  Uçuk teoriler yerine; sermayesi, amortismanı, aylık net kârı ve operasyonel fizibilitesi hesaplanmış uygulanabilir niş modeller.
                </p>
              </div>

              {/* 4 Seçili Fikir Butonları (Katalog Geçiş Butonları) */}
              <div className="mt-5">
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
                          'group text-left px-3.5 py-3 rounded-2xl text-[12.5px] font-bold transition-all duration-300 flex items-center justify-between border relative overflow-hidden cursor-pointer select-none',
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
              <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'showcase' ? 'grid' : 'showcase')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm px-5 py-3 shadow-sm shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>{viewMode === 'showcase' ? 'Tüm İlan Kartlarını Aç' : 'Katalog Vitrinine Dön'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateInCockpit()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 hover:border-slate-300 transition-all cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  <span>İş Kurma Asistanında Simüle Et</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SAĞ ALAN: 5 SN'DE BİR DÖNEN BÜYÜK GÖRSEL KART & KATALOG VİTRİNİ          */}
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

                {/* Görsel Üzeri Karartma Gradyanı */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 pointer-events-none" />

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

                {/* Üst Rozetler: NİŞ KONSEPT & EDİSYON & DOĞRULANMIŞ */}
                <div className="absolute top-8 sm:top-9 left-5 right-5 sm:left-6 sm:right-6 z-10 flex items-center justify-between pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-amber-500/30">
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    SEÇİLİ NİŞ KONSEPT
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-semibold border border-white/15 shadow-md">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {activeItem?.monthEdition}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-semibold border border-white/15 shadow-md">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Doğrulanmış
                    </span>
                  </div>
                </div>

                {/* Alt Detay Kartı (Glassmorphism Katmanı) */}
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-10 p-5 sm:p-6 rounded-[1.6rem] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-white/30 dark:border-zinc-800 shadow-2xl transition-all duration-300">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            {activeItem?.category}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                            {activeItem?.businessModelBadge}
                          </span>
                        </div>
                        <h4 className="font-sans text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-1">
                          {activeItem?.title}
                        </h4>
                        <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 line-clamp-1 leading-relaxed font-normal">
                          {activeItem?.tagline}
                        </p>
                      </div>

                      {/* Fikri İncele / İlan Görünümünde Aç Butonu */}
                      <button
                        type="button"
                        onClick={() => setSelectedModalIdea(activeItem)}
                        className="shrink-0 self-start sm:self-center inline-flex items-center gap-2 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs sm:text-sm font-bold px-4.5 py-3 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <span>İlanı İncele</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 4'lü Finansal KPI Özet Satırı */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100/80 dark:bg-zinc-800/80">
                        <span className="text-[10px] text-muted-foreground block font-semibold">Min. Sermaye</span>
                        <span className="font-black text-slate-900 dark:text-white">₺{activeItem?.financials.minCapital.toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
                        <span className="text-[10px] block font-semibold text-emerald-700 dark:text-emerald-400">Aylık Net Kâr</span>
                        <span className="font-black">₺{activeItem?.financials.monthlyNetProfit.toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100/80 dark:bg-zinc-800/80">
                        <span className="text-[10px] text-muted-foreground block font-semibold">Amortisman</span>
                        <span className="font-black text-slate-900 dark:text-white">{activeItem?.financials.paybackPeriodMonths} Ay</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100/80 dark:bg-zinc-800/80">
                        <span className="text-[10px] text-muted-foreground block font-semibold">Kâr Marjı</span>
                        <span className="font-black text-slate-900 dark:text-white">%{activeItem?.financials.grossMarginPercent}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. İLAN KARTLARI DİZİNİ (İÇİNE GİRİLDİĞİNDE / AÇILDIĞINDA İLAN KARTLARI)   */}
        {/* ========================================================================= */}
        {viewMode === 'grid' && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Üst Başlık & Ekle Butonu */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Eylül 2026 Niş Fikirler Kataloğu
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Doğrulanmış Niş Konsept İlanları
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Her kart detaylı sermaye, ekipman, lokasyon ve 1. ay büyüme stratejisini içerir.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSimulateInCockpit()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all self-start sm:self-center cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Kendi Fikrini Simüle Et</span>
              </button>
            </div>

            {/* İlan Kartları Izgarası (3 Kolonlu Kart Düzeneği + 1 Müsait Reklam Kartı) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((idea, idx) => (
                <div
                  key={idea.id}
                  onClick={() => setSelectedModalIdea(idea)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm transition-all duration-300 hover:border-amber-500/50 hover:shadow-md hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900/90 cursor-pointer"
                >
                  {/* Kart Görseli */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    <Image
                      src={idea.imageUrl}
                      alt={idea.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Görsel Üstü Rozetler */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[10.5px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-400 border border-white/10">
                        NİŞ #{idx + 1}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10">
                        {idea.businessModelBadge}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[11px] font-bold text-amber-300">{idea.category}</div>
                      <div className="text-base font-black truncate">{idea.title}</div>
                    </div>
                  </div>

                  {/* Kart Gövdesi */}
                  <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-4">
                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {idea.tagline}
                    </p>

                    {/* Finansal Matris */}
                    <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-slate-100 dark:border-zinc-800 text-center">
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                        <div className="text-[9.5px] font-bold text-muted-foreground uppercase">Sermaye</div>
                        <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">₺{(idea.financials.minCapital / 1000).toFixed(0)}k</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                        <div className="text-[9.5px] font-bold uppercase">Net Kâr</div>
                        <div className="text-xs font-black mt-0.5">₺{(idea.financials.monthlyNetProfit / 1000).toFixed(0)}k/ay</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                        <div className="text-[9.5px] font-bold text-muted-foreground uppercase">Geri Dönüş</div>
                        <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{idea.financials.paybackPeriodMonths} Ay</div>
                      </div>
                    </div>

                    {/* Alt Link */}
                    <div className="flex items-center justify-between pt-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-500">
                      <span>Detaylı Fizibiliteyi İncele</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              ))}

              {/* 5. Kart: BU ALAN MÜSAİT / YENİ FİKİR ÖNER (Kesikli Çerçeve) */}
              <div
                onClick={() => handleSimulateInCockpit()}
                className="group relative flex flex-col justify-center items-center text-center p-6 rounded-2xl border-2 border-dashed border-amber-400/80 dark:border-amber-500/60 bg-amber-500/[0.03] hover:bg-amber-500/[0.08] transition-all duration-300 cursor-pointer min-h-[320px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 fill-slate-950" />
                </div>
                <div className="text-[11px] font-black tracking-wider uppercase text-amber-600 dark:text-amber-400">
                  BU ALAN MÜSAİT
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Kendi Niş Fikrini Öner & Simüle Et
                </h4>
                <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">
                  Girişimbee asistanında sermayeni gir, m², kira ve personel maliyetlerini 1 dakikada otomatik hesapla.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  <span>Hemen Başlayın</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. İLAN DETAY MODALI / GENİŞ KAPSAMLI FİZİBİLİTE GÖRÜNÜMÜ                  */}
      {/* ========================================================================= */}
      {selectedModalIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={() => setSelectedModalIdea(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Başlık & Görsel */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950">
                  {selectedModalIdea.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  {selectedModalIdea.businessModelBadge}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-muted-foreground">
                  📅 {selectedModalIdea.monthEdition} Edisyonu
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {selectedModalIdea.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {selectedModalIdea.tagline}
                </p>
              </div>

              {/* Görsel */}
              <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-md">
                <Image
                  src={selectedModalIdea.imageUrl}
                  alt={selectedModalIdea.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>

            {/* 4'lü Finansal Matris */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80">
                <div className="text-[10.5px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                  Min. Sermaye
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  ₺{selectedModalIdea.financials.minCapital.toLocaleString('tr-TR')}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                <div className="text-[10.5px] uppercase font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Aylık Net Kâr
                </div>
                <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  ₺{selectedModalIdea.financials.monthlyNetProfit.toLocaleString('tr-TR')}
                </div>
                <div className="text-[10.5px] text-muted-foreground">₺{selectedModalIdea.financials.monthlyAvgRevenue.toLocaleString('tr-TR')} Ciro</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80">
                <div className="text-[10.5px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Amortisman
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {selectedModalIdea.financials.paybackPeriodMonths} Ay
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80">
                <div className="text-[10.5px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-sky-500" />
                  Kâr Marjı
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  %{selectedModalIdea.financials.grossMarginPercent}
                </div>
              </div>
            </div>

            {/* Pazar Gerçeği & Büyüme */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-3">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Neden Tutar? (Pazar İçgörüsü)</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{selectedModalIdea.marketReality.whyItWorks}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200/50 dark:border-amber-900/30 text-xs">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900 dark:text-white">İdeal Lokasyon:</strong> {selectedModalIdea.marketReality.idealLocationProfile}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900 dark:text-white">Hedef Kitle:</strong> {selectedModalIdea.marketReality.targetCustomer}</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5 pt-2 border-t border-amber-200/50 dark:border-amber-900/30 text-xs">
                <Rocket className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">1. Ay Büyüme Planı:</strong> {selectedModalIdea.marketReality.firstMonthTractionPlan}</span>
              </div>
            </div>

            {/* Alan, Personel & Ekipmanlar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <Store className="w-4 h-4 text-slate-500" />
                  Alan: {selectedModalIdea.setupProfile.minimumSpaceM2 === 0 ? 'Dükkansız (Mobil / Seyyar)' : `${selectedModalIdea.setupProfile.minimumSpaceM2} m²`}
                </span>
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  Personel: {selectedModalIdea.setupProfile.requiredStaffCount === 0 ? 'Personelsiz (Tam Otomat)' : `${selectedModalIdea.setupProfile.requiredStaffCount} Kişi`}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/70 dark:border-zinc-700/70">
                <div className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1 mb-2">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  Gerekli Temel Ekipman ve Demirbaşlar
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedModalIdea.setupProfile.coreEquipments.map((eq) => (
                    <span
                      key={eq}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-xs font-semibold border border-slate-200 dark:border-zinc-700 shadow-xs"
                    >
                      ✓ {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Alt Aksiyonları */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleCheckGrants}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                🏛️ Bu Model İçin KOSGEB & Teşvikleri Sorgula →
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedModalIdea(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateInCockpit(selectedModalIdea.title)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer transition-all hover:scale-105"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>İş Kurma Asistanında Simüle Et</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

export default HomeTrendBusinessIdeasSection;
