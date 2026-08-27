'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Users2, 
  Store, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import { BrandMarkSlot } from '@/components/girisimco/brand-mark-slot';
import { useHeroStats } from '@/features/home';

export function HeroInteractiveFlow() {
  const { counts, isLoading } = useHeroStats();

  return (
    <div className="relative w-full max-w-7xl mx-auto my-auto py-3 select-none overflow-visible">
      
      {/* LOKAL ARKA PLAN DERİNLİK KÜRELERİ */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
        <div style={{ position: 'absolute', left: '-10px', top: '5px', width: '280px', height: '120px', background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)', filter: 'blur(28px)' }} />
        <div style={{ position: 'absolute', left: '33%', top: '5px', width: '320px', height: '120px', background: 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)', filter: 'blur(32px)' }} />
        <div style={{ position: 'absolute', right: '-10px', top: '0px', width: '280px', height: '130px', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(59,130,246,0.18) 50%, transparent 70%)', filter: 'blur(32px)' }} />
        <div style={{ position: 'absolute', right: '90px', top: '10px', width: '26px', height: '26px', background: 'rgba(147,197,253,0.5)', borderRadius: '50%', filter: 'blur(4px)' }} />
        <div style={{ position: 'absolute', right: '25px', top: '35px', width: '40px', height: '40px', background: 'rgba(196,181,253,0.45)', borderRadius: '50%', filter: 'blur(8px)' }} />
      </div>

      {/* 135PX PROFESYONEL AKIŞ ALANI */}
      <div className="relative w-full h-[135px] hidden md:block z-10">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 1200 135" fill="none" preserveAspectRatio="none">
          <defs>
            {/* Canlı Degrade Geçişi */}
            <linearGradient id="flowProGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="26%" stopColor="#10B981" />
              <stop offset="48%" stopColor="#F59E0B" />
              <stop offset="72%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>

            {/* Arka Işıma Filtresi */}
            <filter id="flowGlowFilter" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Katman 1: Yumuşak Arka Işıma Şeridi (Son Kartın Sağ Altından Çıkıp Sağ Üste Kavis Alır) */}
          <path
            d="M 140 40 
               C 220 30, 260 22, 280 22 
               C 370 22, 410 98, 540 98 
               C 670 98, 720 18, 840 18 
               C 940 18, 990 70, 1050 78 
               C 1110 85, 1150 82, 1170 72 
               C 1185 62, 1195 45, 1202 32"
            stroke="url(#flowProGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.22"
            filter="url(#flowGlowFilter)"
          />

          {/* Katman 2: Kesintisiz Profesyonel Noktalı / Kesikli Akış Çizgisi */}
          <path
            d="M 140 40 
               C 220 30, 260 22, 280 22 
               C 370 22, 410 98, 540 98 
               C 670 98, 720 18, 840 18 
               C 940 18, 990 70, 1050 78 
               C 1110 85, 1150 82, 1170 72 
               C 1185 62, 1195 45, 1202 32"
            stroke="url(#flowProGrad)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeDasharray="6 7"
            className="animate-flow-dash"
          />

          {/* Katman 3: Dalga Tepe ve Taban Noktalarındaki Işıltılı Mikro Düğümler */}
          <circle cx="540" cy="98" r="3.5" fill="#F59E0B" className="animate-pulse" />
          <circle cx="840" cy="18" r="3.5" fill="#3B82F6" className="animate-pulse" />
          <circle cx="1050" cy="78" r="3.5" fill="#8B5CF6" className="animate-pulse" />
        </svg>

        {/* Çizginin En Ucunda Süzülen Girişimbee Arı Maskotu */}
        <div className="absolute top-[16px] -right-[6px] z-20 transform hover:scale-110 transition-transform duration-300 animate-float-1 drop-shadow-md">
          <BrandMarkSlot size={36} priority />
        </div>

        {/* 1. MİKRO KART */}
        <div className="absolute top-[12px] left-[35px] z-10 w-[215px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3 shadow-lg shadow-zinc-900/5 animate-float-1">
          <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Senior Frontend Developer</h5>
          <p className="text-[10.5px] text-zinc-500 mt-0.5">İstanbul · Tam Zamanlı</p>
          <div className="mt-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 text-[10px] font-bold">Yeni</span>
          </div>
        </div>

        {/* 2. MİKRO KART: "Girişim Teknoloji Ortağı" + "Acil" Rozeti */}
        <div className="absolute top-[50px] left-[345px] z-10 w-[215px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3 shadow-lg shadow-zinc-900/5 animate-float-2">
          <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">Girişim Teknoloji Ortağı</h5>
          <p className="text-[10.5px] text-zinc-500 mt-0.5">Fintech · Seri A</p>
          <div className="mt-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 text-[10px] font-bold">Acil</span>
          </div>
        </div>

        {/* 3. MİKRO KART */}
        <div className="absolute top-[10px] left-[640px] z-10 w-[205px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3 shadow-lg shadow-zinc-900/5 animate-float-3">
          <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Bayilik Fırsatı</h5>
          <p className="text-[10.5px] text-zinc-500 mt-0.5">Türkiye Geneli</p>
          <div className="mt-2">
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 text-[10px] font-bold">Popüler</span>
          </div>
        </div>

        {/* 4. MİKRO KART */}
        <div className="absolute top-[44px] right-[40px] z-10 w-[210px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3 shadow-lg shadow-zinc-900/5 animate-float-4">
          <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">AI Destekli Satış Asistanı</h5>
          <p className="text-[10.5px] text-zinc-500 mt-0.5">SaaS · Bulut Tabanlı</p>
          <div className="mt-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 text-[10px] font-bold">Yeni</span>
          </div>
        </div>
      </div>

      {/* 3. ALTTAKİ 4'LÜ BENTO KARTLARI (ORİJİNAL VE DENGELİ FORMATTA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5 mt-5 mb-1">
        {/* Kariyer */}
        <div className="group relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4.5 sm:p-5 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between cursor-pointer">
          <Link href="/is" className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40" aria-label="Kariyer ve İş Fırsatları" />
          <div className="relative z-1 pointer-events-none">
            <div className="flex items-center justify-between mb-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Briefcase className="w-4 h-4" /></span>
              <span aria-hidden className="inline-flex">
                <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
              </span>
            </div>
            <h4 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">Kariyer ve İş Fırsatları</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed min-h-[32px]">Yeteneklerinizi sergileyin, doğru iş fırsatlarıyla buluşun.</p>
          </div>
          <div className="relative z-1 pointer-events-none mt-3.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-medium text-zinc-600 dark:text-zinc-300">● {isLoading ? '—' : counts.jobs} Aktif İlan</span>
          </div>
        </div>

        {/* Ortaklık ve Devir */}
        <div className="group relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4.5 sm:p-5 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all flex flex-col justify-between cursor-pointer">
          <Link href="/girisim-ortaklik" className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40" aria-label="Ortaklık ve Devir" />
          <div className="relative z-1 pointer-events-none">
            <div className="flex items-center justify-between mb-2.5">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><Users2 className="w-4 h-4" /></span>
              <span aria-hidden className="inline-flex">
                <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
              </span>
            </div>
            <h4 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">Ortaklık ve Devir</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed min-h-[32px]">Ortaklık ve işletme devri fırsatlarını keşfedin veya kendi fırsatınızı yayınlayın.</p>
          </div>
          <div className="relative z-1 pointer-events-none mt-3.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-medium text-zinc-600 dark:text-zinc-300">● {isLoading ? '—' : counts.partners} Aktif İlan</span>
          </div>
        </div>

        {/* Franchise ve Bayilik */}
        <div className="group relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4.5 sm:p-5 shadow-sm hover:shadow-md hover:border-rose-500/40 transition-all flex flex-col justify-between cursor-pointer">
          <Link href="/franchise/buy" className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40" aria-label="Franchise ve Bayilik" />
          <div className="relative z-1 pointer-events-none">
            <div className="flex items-center justify-between mb-2.5">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400"><Store className="w-4 h-4" /></span>
              <span aria-hidden className="inline-flex">
                <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 transition-colors" />
              </span>
            </div>
            <h4 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">Franchise ve Bayilik</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed min-h-[32px]">Kanıtlanmış iş modelleriyle kendi işletmenizi kurun veya markanızı büyütün.</p>
          </div>
          <div className="relative z-1 pointer-events-none mt-3.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-medium text-zinc-600 dark:text-zinc-300">● {isLoading ? '—' : counts.franchise} Aktif Fırsat</span>
          </div>
        </div>

        {/* 4. Slot (Yeni Kategori Alanı - Çok Yakında / Rezerve Alan) */}
        {/* Not: Eski 'Dijital ve Startup Çözümler' kartı components/archive/DigitalStartupCardArchive.tsx içinde saklanmaktadır. */}
        <div className="group relative bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-dashed border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4.5 sm:p-5 shadow-2xs transition-all flex flex-col justify-between select-none opacity-85 hover:opacity-100">
          <div className="relative z-1 pointer-events-none">
            <div className="flex items-center justify-between mb-2.5">
              <span className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700/60">
                Yakında
              </span>
            </div>
            <h4 className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300">Yeni Fırsat Alanı</h4>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed min-h-[32px]">
              Girişim ekosistemine eklenecek yeni kategori çok yakında burada olacak.
            </p>
          </div>
          <div className="relative z-1 pointer-events-none mt-3.5 pt-2.5 border-t border-slate-100/80 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-medium text-zinc-500 dark:text-zinc-400">● Hazırlanıyor</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes floatK1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
        @keyframes floatK2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(5px); } }
        @keyframes floatK3 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        @keyframes floatK4 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(4px); } }
        @keyframes flowDashAnim { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -130; } }

        .animate-float-1 { animation: floatK1 4s ease-in-out infinite; }
        .animate-float-2 { animation: floatK2 4.6s ease-in-out infinite 0.4s; }
        .animate-float-3 { animation: floatK3 4.2s ease-in-out infinite 0.8s; }
        .animate-float-4 { animation: floatK4 5s ease-in-out infinite 1.2s; }
        .animate-flow-dash { animation: flowDashAnim 14s linear infinite; }
      `}</style>
    </div>
  );
}

export default HeroInteractiveFlow;
