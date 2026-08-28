'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Users2, 
  Store, 
  Wrench,
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import { PlatformHero } from '@/components/girisimco/hero/PlatformHero';
import { useHeroStats } from '@/features/home';
import {
  HomeFeaturedSection,
  HomeListingsProvider,
  HomeRestSections,
} from '@/components/girisimco/home/HomeListingsModule';
import { HomeMarketSection } from '@/components/girisimco/home/HomeMarketSection';

export function PlatformHome() {
  const { counts, isLoading } = useHeroStats();

  return (
    <HomeListingsProvider>
      <div className="gc-header-offset relative bg-slate-50/50 dark:bg-background">
        
        {/* ========================================================================= */}
        {/* 1. EKRAN / HERO BÖLÜMÜ (STANDART 1280PX GRID İLE MÜKEMMEL HİZALANMIŞ)     */}
        {/* ========================================================================= */}
        <div className="relative min-h-[calc(100vh-var(--gc-header-height,3.75rem))] flex flex-col justify-between overflow-hidden py-6 sm:py-8 lg:py-10">
          
          {/* ARKA PLAN RENK IŞIMALARI (GLOW MESH 1. KATMAN - ULTRA SOFT & DIFUZ) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
            {/* Sol Üst Kehribar Glow */}
            <div 
              className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full" 
              style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.11) 0%, transparent 70%)', filter: 'blur(100px)' }} 
            />
            {/* Sağ Orta Mor/Mavi Glow */}
            <div 
              className="absolute top-1/4 right-0 w-[550px] h-[550px] rounded-full" 
              style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.09) 0%, rgba(96,165,250,0.06) 50%, transparent 70%)', filter: 'blur(100px)' }} 
            />
            {/* Alt Orta Yumuşak Yeşil/Turkuaz Glow */}
            <div 
              className="absolute -bottom-10 left-1/3 w-[550px] h-[320px] rounded-full" 
              style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.10) 0%, transparent 70%)', filter: 'blur(100px)' }} 
            />
          </div>

          {/* 1. ÜST ALAN: BÜYÜTÜLMÜŞ HERO ALANI (BAŞLIK, ÇEMBER/YÖRÜNGE, SAYAÇLAR) */}
          <div className="relative z-10 shrink-0 my-auto w-full">
            <PlatformHero className="min-h-0" />
          </div>

          {/* 2. ALT ALAN: 4'LÜ BENTO KARTLARI (TAM STANDART 1280PX GRID ÇİZGİSİNE HİZALI & SOLA GÖRE ORTALANMIŞ) */}
          <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 lg:px-8 shrink-0 mt-8 sm:mt-10 lg:mt-12 mb-3 sm:mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Kariyer */}
              <div className="group relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer">
                <Link href="/is" className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40" aria-label="Kariyer ve İş Fırsatları" />
                <div className="relative z-1 pointer-events-none">
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-300"><Briefcase className="w-4 h-4" /></span>
                    <span aria-hidden className="inline-flex">
                      <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-300" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">Kariyer ve İş Fırsatları</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed min-h-[34px]">Yeteneklerinizi sergileyin, doğru iş fırsatlarıyla buluşun.</p>
                  </div>
                </div>
                <div className="relative z-1 pointer-events-none mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">● {isLoading ? '—' : counts.jobs} Aktif İlan</span>
                </div>
              </div>

              {/* Ortaklık ve Devir */}
              <div className="group relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer">
                <Link href="/girisim-ortaklik" className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40" aria-label="Ortaklık ve Devir" />
                <div className="relative z-1 pointer-events-none">
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform duration-300"><Users2 className="w-4 h-4" /></span>
                    <span aria-hidden className="inline-flex">
                      <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-300" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">Ortaklık ve Devir</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed min-h-[34px]">Ortaklık ve işletme devri fırsatlarını keşfedin veya kendi fırsatınızı yayınlayın.</p>
                  </div>
                </div>
                <div className="relative z-1 pointer-events-none mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">● {isLoading ? '—' : counts.partners} Aktif İlan</span>
                </div>
              </div>

              {/* Franchise ve Bayilik */}
              <div className="group relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-rose-500/40 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer">
                <Link href="/franchise/buy" className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40" aria-label="Franchise ve Bayilik" />
                <div className="relative z-1 pointer-events-none">
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform duration-300"><Store className="w-4 h-4" /></span>
                    <span aria-hidden className="inline-flex">
                      <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-300" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors duration-200">Franchise ve Bayilik</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed min-h-[34px]">Kanıtlanmış iş modelleriyle kendi işletmenizi kurun veya markanızı büyütün.</p>
                  </div>
                </div>
                <div className="relative z-1 pointer-events-none mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">● {isLoading ? '—' : counts.franchise} Aktif Fırsat</span>
                </div>
              </div>

              {/* Esnaf ve Hizmetler */}
              <div className="group relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer">
                <Link href="/kategori/hizmetler" className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40" aria-label="Esnaf ve Hizmetler" />
                <div className="relative z-1 pointer-events-none">
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-300">
                      <Wrench className="w-4 h-4" />
                    </span>
                    <span aria-hidden className="inline-flex">
                      <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-300" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      Esnaf ve Hizmetler
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed min-h-[34px]">
                      Temizlikten tesisata, nakliyeden tadilata aradığınız tüm yerel usta ve hizmetleri keşfedin.
                    </p>
                  </div>
                </div>
                <div className="relative z-1 pointer-events-none mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    ● {isLoading ? '—' : (counts.services ?? 5)} Aktif Hizmet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. EKRAN / DOĞAL GEÇİŞLİ MARKET & VİTRİNLER SAYFASI (TAMAMLAYICI PALET)   */}
        {/* ========================================================================= */}
        <div className="relative z-10 pt-4 pb-24 overflow-hidden">
          
          {/* 2. SAYFA DOĞAL GEÇİŞLİ AMBİYANS IŞIMA KATMANI (DIFUZ & GÖZ YORMAYAN SOFT MESH) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
            {/* Market Alanı / Sağ Üst: Çok Hafif Ilık Şeftali & Kehribar */}
            <div 
              className="absolute top-10 right-0 w-[550px] h-[450px] rounded-full" 
              style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.06) 0%, rgba(245,158,11,0.04) 60%, transparent 70%)', filter: 'blur(100px)' }} 
            />

            {/* Öne Çıkanlar / Sol Orta: Çok Hafif Mint & Zümrüt Yeşili */}
            <div 
              className="absolute top-[480px] left-0 w-[520px] h-[480px] rounded-full" 
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', filter: 'blur(100px)' }} 
            />

            {/* Alt Bölümler: Çok Hafif Pastel Lavanta & Gök Mavisi */}
            <div 
              className="absolute bottom-20 right-5 w-[500px] h-[450px] rounded-full" 
              style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, rgba(14,165,233,0.04) 50%, transparent 70%)', filter: 'blur(100px)' }} 
            />
          </div>

          {/* İÇERİK BİLEŞENLERİ (GİRİŞİMBEE MARKET, ÖNE ÇIKAN İLANLAR, DİĞER KATEGORİLER) */}
          <div className="relative z-10 space-y-4">
            <HomeMarketSection />
            <HomeFeaturedSection />
            <HomeRestSections />
          </div>
        </div>
      </div>
    </HomeListingsProvider>
  );
}

export default PlatformHome;
