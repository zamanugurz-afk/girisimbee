'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Bot, Compass, Calculator, Sparkles } from 'lucide-react';
import { HomeInvestmentRadarSection } from '@/components/girisimco/home/HomeInvestmentRadarSection';
import { HomeBusinessSetupAssistantSection } from '@/components/girisimco/home/HomeBusinessSetupAssistantSection';
import { cn } from '@/lib/utils';

export type CockpitTab = 'radar' | 'assistant';

interface HomeUnifiedCockpitSectionProps {
  defaultTab?: CockpitTab;
}

export function HomeUnifiedCockpitSection({
  defaultTab = 'radar',
}: HomeUnifiedCockpitSectionProps) {
  const [activeTab, setActiveTab] = useState<CockpitTab>(defaultTab);

  // Hash / Link dinleyici: #radar-section veya #assistant-section tıklandığında sekmeyi otomatik değiştir
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#radar-section') {
        setActiveTab('radar');
      } else if (hash === '#assistant-section') {
        setActiveTab('assistant');
      }
    };

    // İlk yüklemede kontrol et
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global event dinleyici (Hero slider butonlarına doğrudan tıklandığında)
  useEffect(() => {
    const handleCustomScroll = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href === '#radar-section') {
        setActiveTab('radar');
      } else if (href === '#assistant-section') {
        setActiveTab('assistant');
      }
    };

    document.addEventListener('click', handleCustomScroll);
    return () => document.removeEventListener('click', handleCustomScroll);
  }, []);

  return (
    <div id="cockpit-container" className="relative w-full">
      {/* ========================================================================= */}
      {/* 1. ÜST SEGMENTED SEKME ÇUBUĞU (MODERN PILL SWITCHER)                       */}
      {/* ========================================================================= */}
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
          {/* Sol Sekme Anahtarı */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100/90 dark:bg-zinc-800/90 border border-slate-200/90 dark:border-zinc-700/80 shadow-xs backdrop-blur-md">
            {/* 1. Sekme: Lokasyon Radarı */}
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={cn(
                'relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none',
                activeTab === 'radar'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white',
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  activeTab === 'radar' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400',
                )}
              />
              <span className="flex items-center gap-1.5">
                <span>📍</span>
                <span>Lokasyon Radarı</span>
              </span>
              {activeTab === 'radar' && (
                <span className="hidden md:inline-block text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md ml-1">
                  Canlı Pazar
                </span>
              )}
            </button>

            {/* 2. Sekme: İş Kurma Asistanı */}
            <button
              type="button"
              onClick={() => setActiveTab('assistant')}
              className={cn(
                'relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none',
                activeTab === 'assistant'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white',
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  activeTab === 'assistant' ? 'bg-sky-500 animate-pulse' : 'bg-slate-400',
                )}
              />
              <span className="flex items-center gap-1.5">
                <span>🤖</span>
                <span>İş Kurma Asistanı</span>
              </span>
              {activeTab === 'assistant' && (
                <span className="hidden md:inline-block text-[11px] font-semibold text-sky-800 dark:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-md ml-1">
                  Maliyet & Fizibilite
                </span>
              )}
            </button>
          </div>

          {/* Sağ Bilgi Notu */}
          <div className="text-[11.5px] text-muted-foreground flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {activeTab === 'radar'
                ? 'Harita üzerinden rakip yoğunluğunu ve demografiyi analiz edin'
                : '25 sektörde m², kira ve demirbaş maliyetlerini hesaplayın'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEÇİLİ KOKPİT BİLEŞENİ (YUMUŞAK ANİMASYONLU GEÇİŞ)                       */}
      {/* ========================================================================= */}
      <div className="relative w-full">
        {/* Her iki bileşen de state kaybını önlemek için DOM'da tutulur, display ile geçiş yapılır */}
        <div className={cn(activeTab === 'radar' ? 'block' : 'hidden')}>
          <HomeInvestmentRadarSection />
        </div>

        <div className={cn(activeTab === 'assistant' ? 'block' : 'hidden')}>
          <HomeBusinessSetupAssistantSection />
        </div>
      </div>
    </div>
  );
}

export default HomeUnifiedCockpitSection;
