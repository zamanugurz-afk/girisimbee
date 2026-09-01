'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Scale, MapPin, Bot } from 'lucide-react';
import { HomeInvestmentRadarSection } from '@/components/girisimco/home/HomeInvestmentRadarSection';
import { HomeBusinessSetupAssistantSection } from '@/components/girisimco/home/HomeBusinessSetupAssistantSection';
import { HomeLegalAssistantSection } from '@/components/girisimco/legal-assistant/HomeLegalAssistantSection';
import { cn } from '@/lib/utils';

export type CockpitTab = 'radar' | 'assistant' | 'legal';

interface HomeUnifiedCockpitSectionProps {
  defaultTab?: CockpitTab;
}

export function HomeUnifiedCockpitSection({
  defaultTab = 'radar',
}: HomeUnifiedCockpitSectionProps) {
  const [activeTab, setActiveTab] = useState<CockpitTab>(defaultTab);

  // Hash / Link dinleyici: #radar-section, #assistant-section veya #legal-section tıklandığında sekmeyi otomatik değiştir
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#radar-section') {
        setActiveTab('radar');
      } else if (hash === '#assistant-section') {
        setActiveTab('assistant');
      } else if (hash === '#legal-section') {
        setActiveTab('legal');
      }
    };

    // İlk yüklemede kontrol et
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global event dinleyici (Hero slider veya sayfa butonlarına doğrudan tıklandığında)
  useEffect(() => {
    const handleCustomScroll = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href === '#radar-section') {
        setActiveTab('radar');
      } else if (href === '#assistant-section') {
        setActiveTab('assistant');
      } else if (href === '#legal-section') {
        setActiveTab('legal');
      }
    };

    document.addEventListener('click', handleCustomScroll);
    return () => document.removeEventListener('click', handleCustomScroll);
  }, []);

  return (
    <div id="cockpit-container" className="relative w-full">
      {/* ========================================================================= */}
      {/* 1. ÜST SEGMENTED SEKME ÇUBUĞU (3'LÜ MODERN PILL SWITCHER)                  */}
      {/* ========================================================================= */}
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
          {/* Sol 3'lü Sekme Anahtarı */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100/90 dark:bg-zinc-800/90 border border-slate-200/90 dark:border-zinc-700/80 shadow-xs backdrop-blur-md overflow-x-auto max-w-full no-scrollbar">
            {/* 1. Sekme: Lokasyon Radarı */}
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={cn(
                'relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none whitespace-nowrap',
                activeTab === 'radar'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white',
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full transition-colors shrink-0',
                  activeTab === 'radar' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400',
                )}
              />
              <span className="flex items-center gap-1.5">
                <span>📍</span>
                <span>Lokasyon Radarı</span>
              </span>
              {activeTab === 'radar' && (
                <span className="hidden sm:inline-block text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md ml-1">
                  Canlı Pazar
                </span>
              )}
            </button>

            {/* 2. Sekme: İş Kurma Asistanı */}
            <button
              type="button"
              onClick={() => setActiveTab('assistant')}
              className={cn(
                'relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none whitespace-nowrap',
                activeTab === 'assistant'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white',
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full transition-colors shrink-0',
                  activeTab === 'assistant' ? 'bg-sky-500 animate-pulse' : 'bg-slate-400',
                )}
              />
              <span className="flex items-center gap-1.5">
                <span>🤖</span>
                <span>İş Kurma Asistanı</span>
              </span>
              {activeTab === 'assistant' && (
                <span className="hidden sm:inline-block text-[11px] font-semibold text-sky-800 dark:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-md ml-1">
                  Bütçe Robotu
                </span>
              )}
            </button>

            {/* 3. Sekme: Resmi Başvuru & Hukuk Asistanı */}
            <button
              type="button"
              onClick={() => setActiveTab('legal')}
              className={cn(
                'relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none whitespace-nowrap',
                activeTab === 'legal'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white',
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full transition-colors shrink-0',
                  activeTab === 'legal' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400',
                )}
              />
              <span className="flex items-center gap-1.5">
                <span>⚖️</span>
                <span>Resmi Başvuru & Hukuk</span>
              </span>
              {activeTab === 'legal' && (
                <span className="hidden sm:inline-block text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md ml-1">
                  Mevzuat 2026
                </span>
              )}
            </button>
          </div>

          {/* Sağ Bilgi Notu */}
          <div className="text-[11.5px] text-muted-foreground flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              {activeTab === 'radar' && 'Harita üzerinden rakip yoğunluğunu ve demografiyi analiz edin'}
              {activeTab === 'assistant' && '25 sektörde m², kira ve demirbaş maliyetlerini simüle edin'}
              {activeTab === 'legal' && 'Resmi kurum izinleri, evrak kontrol listeleri ve 2026 harçlarını inceleyin'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEÇİLİ KOKPİT BİLEŞENİ (STATE KORUNUMLU GEÇİŞ)                          */}
      {/* ========================================================================= */}
      <div className="relative w-full">
        {/* Tüm bileşenler state kaybını önlemek için DOM'da tutulur, display ile geçiş yapılır */}
        <div className={cn(activeTab === 'radar' ? 'block' : 'hidden')}>
          <HomeInvestmentRadarSection />
        </div>

        <div className={cn(activeTab === 'assistant' ? 'block' : 'hidden')}>
          <HomeBusinessSetupAssistantSection />
        </div>

        <div className={cn(activeTab === 'legal' ? 'block' : 'hidden')}>
          <HomeLegalAssistantSection />
        </div>
      </div>
    </div>
  );
}

export default HomeUnifiedCockpitSection;
