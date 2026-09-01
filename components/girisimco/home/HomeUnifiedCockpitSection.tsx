'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { HomeInvestmentRadarSection } from '@/components/girisimco/home/HomeInvestmentRadarSection';
import { HomeBusinessSetupAssistantSection } from '@/components/girisimco/home/HomeBusinessSetupAssistantSection';
import { HomeLegalAssistantSection } from '@/components/girisimco/legal-assistant/HomeLegalAssistantSection';
import { HomeGrantsIncentivesSection } from '@/components/girisimco/grants-incentives/HomeGrantsIncentivesSection';
import {
  UnifiedCockpitProvider,
  useUnifiedCockpit,
} from '@/features/common/context/UnifiedCockpitContext';
import { getRegulatoryBadgeText } from '@/features/common/config/market-version.config';
import { cn } from '@/lib/utils';

export type CockpitTab = 'radar' | 'assistant' | 'legal' | 'grants';

interface HomeUnifiedCockpitSectionProps {
  defaultTab?: CockpitTab;
}

function UnifiedCockpitInner({ defaultTab = 'radar' }: HomeUnifiedCockpitSectionProps) {
  const [activeTab, setActiveTab] = useState<CockpitTab>(defaultTab);
  const { selectedCity, selectedDistrict, selectedSectorId } = useUnifiedCockpit();

  // Hash / Link dinleyici: #radar-section, #assistant-section, #legal-section veya #grants-section
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#radar-section') {
        setActiveTab('radar');
      } else if (hash === '#assistant-section') {
        setActiveTab('assistant');
      } else if (hash === '#legal-section') {
        setActiveTab('legal');
      } else if (hash === '#grants-section') {
        setActiveTab('grants');
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global event dinleyici
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
      } else if (href === '#grants-section') {
        setActiveTab('grants');
      }
    };

    document.addEventListener('click', handleCustomScroll);
    return () => document.removeEventListener('click', handleCustomScroll);
  }, []);

  return (
    <div id="cockpit-container" className="relative w-full">
      {/* ========================================================================= */}
      {/* 1. ÜST SEGMENTED SEKME ÇUBUĞU (4'LÜ FULL-WIDTH DÜZEN)                    */}
      {/* ========================================================================= */}
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-3 pb-2 space-y-2">
        <div className="p-1.5 rounded-2xl bg-slate-100/90 dark:bg-zinc-800/90 border border-slate-200/90 dark:border-zinc-700/80 shadow-xs backdrop-blur-md">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
            {/* 1. Sekme: Lokasyon Radarı */}
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none',
                activeTab === 'radar'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50',
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0 transition-colors',
                  activeTab === 'radar' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400',
                )}
              />
              <span className="flex items-center gap-1.5">
                <span>📍</span>
                <span>Lokasyon Radarı</span>
              </span>
              {activeTab === 'radar' && (
                <span className="hidden sm:inline-block text-[10.5px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Canlı Pazar
                </span>
              )}
            </button>

            {/* 2. Sekme: İş Kurma Asistanı */}
            <button
              type="button"
              onClick={() => setActiveTab('assistant')}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none',
                activeTab === 'assistant'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50',
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0 transition-colors',
                  activeTab === 'assistant' ? 'bg-sky-500 animate-pulse' : 'bg-slate-400',
                )}
              />
              <span className="flex items-center gap-1.5">
                <span>🤖</span>
                <span>İş Kurma Asistanı</span>
              </span>
              {activeTab === 'assistant' && (
                <span className="hidden sm:inline-block text-[10.5px] font-semibold text-sky-800 dark:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-md">
                  Bütçe Robotu
                </span>
              )}
            </button>

            {/* 3. Sekme: Resmi Başvuru & Hukuk */}
            <button
              type="button"
              onClick={() => setActiveTab('legal')}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none',
                activeTab === 'legal'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50',
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0 transition-colors',
                  activeTab === 'legal' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400',
                )}
              />
              <span className="flex items-center gap-1.5">
                <span>⚖️</span>
                <span>Resmi Başvuru & Hukuk</span>
              </span>
              {activeTab === 'legal' && (
                <span className="hidden sm:inline-block text-[10.5px] font-semibold text-indigo-800 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                  Mevzuat 2026
                </span>
              )}
            </button>

            {/* 4. Sekme: Hibe & Teşvik Radarı */}
            <button
              type="button"
              onClick={() => setActiveTab('grants')}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none',
                activeTab === 'grants'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50',
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0 transition-colors',
                  activeTab === 'grants' ? 'bg-teal-500 animate-pulse' : 'bg-slate-400',
                )}
              />
              <span className="flex items-center gap-1.5">
                <span>🏛️</span>
                <span>Hibe & Teşvik Radarı</span>
              </span>
              {activeTab === 'grants' && (
                <span className="hidden sm:inline-block text-[10.5px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-md">
                  2026 Teşvikleri
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bilgilendirme ve Aylık Güncelleme Onay Satırı */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-2 text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              {activeTab === 'radar' && 'Harita üzerinden rakip yoğunluğunu ve demografiyi analiz edin'}
              {activeTab === 'assistant' && '32 sektörde m², kira, demirbaş maliyeti ve başabaş ciro simülasyonu'}
              {activeTab === 'legal' && 'Resmi kurum izinleri, evrak kontrol listeleri ve 2026 harçlarını inceleyin'}
              {activeTab === 'grants' && 'KOSGEB hibeleri, NACE kodları, genç girişimci vergi muafiyeti ve SGK teşviklerini hesaplayın'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{getRegulatoryBadgeText()}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEÇİLİ KOKPİT BİLEŞENİ (STATE KORUNUMLU GEÇİŞ)                          */}
      {/* ========================================================================= */}
      <div className="relative w-full">
        <div className={cn(activeTab === 'radar' ? 'block' : 'hidden')}>
          <HomeInvestmentRadarSection />
        </div>

        <div className={cn(activeTab === 'assistant' ? 'block' : 'hidden')}>
          <HomeBusinessSetupAssistantSection />
        </div>

        <div className={cn(activeTab === 'legal' ? 'block' : 'hidden')}>
          <HomeLegalAssistantSection />
        </div>

        <div className={cn(activeTab === 'grants' ? 'block' : 'hidden')}>
          <HomeGrantsIncentivesSection />
        </div>
      </div>
    </div>
  );
}

export function HomeUnifiedCockpitSection(props: HomeUnifiedCockpitSectionProps) {
  return (
    <UnifiedCockpitProvider>
      <UnifiedCockpitInner {...props} />
    </UnifiedCockpitProvider>
  );
}

export default HomeUnifiedCockpitSection;
