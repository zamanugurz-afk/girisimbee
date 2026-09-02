'use client';

import React from 'react';
import {
  Sparkles,
  Car,
  Home,
  Clock,
  Briefcase,
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  DollarSign,
  Award,
  Zap,
  Check,
} from 'lucide-react';
import { VentureIdeaDraft } from '@/lib/types/venture-builder';
import { cn } from '@/lib/utils';

export function VentureIdeaPreviewCard({
  draft,
  className,
}: {
  draft: VentureIdeaDraft;
  className?: string;
}) {
  const formatCurrency = (val?: number) => {
    if (!val) return '₺0';
    if (val >= 1000000) return `₺${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `₺${Math.round(val / 1000)}k`;
    return `₺${val}`;
  };

  const getWorkspaceData = () => {
    switch (draft.collateral.workspaceType) {
      case 'home':
        return { label: 'Kendi Evim (₺0 Kira)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
      case 'garage_workshop':
        return { label: 'Garaj / Atölye (₺0 Kira)', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
      case 'rented_shop':
        return { label: 'Kiralık Dükkan', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' };
      case 'virtual_mobile':
        return { label: 'Tamamen Dijital / Sanal', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' };
      case 'client_location':
        return { label: 'Müşteri Sahası / Yerinde', color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' };
      default:
        return { label: 'Esnek Alan', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getVehicleData = () => {
    switch (draft.collateral.vehicleType) {
      case 'personal_car':
        return { label: 'Şahsi Binek Araç', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
      case 'light_commercial':
        return { label: 'Hafif Ticari Panelvan', color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' };
      case 'motorcycle':
        return { label: 'Motosiklet / Kurye', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
      default:
        return { label: 'Taşıtsız (Kargo/Dijital)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' };
    }
  };

  const wsData = getWorkspaceData();
  const vhData = getVehicleData();

  const displayTitle = draft.title.trim() || 'Yeni Nesil Niş Girişim Fikri';
  const displayOneLiner =
    draft.oneLiner.trim() ||
    'Fikir ve operasyonel emek hazır; sermaye ve büyüme desteği için yatırımcı/ortak aranıyor.';

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-sky-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-all duration-200',
        className
      )}
    >
      {/* Üst Renkli Gradyan Şerit */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-400 via-sky-400 to-indigo-500" />

      <div className="p-4 sm:p-4.5 flex flex-col flex-1">
        {/* Üst Rozetler ve Kategori */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10.5px] font-black tracking-wide">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              Fikrim Var, Bütçem Yok
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10.5px] font-bold border border-emerald-200 dark:border-emerald-800">
              <Check className="w-2.5 h-2.5 text-emerald-600" />
              Doğrulanmış Model
            </span>
          </div>

          <span className="text-[10.5px] font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700">
            {draft.category}
          </span>
        </div>

        {/* Fikir Başlığı */}
        <h3 className="font-display text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          {displayTitle}
        </h3>

        {/* Tek Cümlelik Açıklama */}
        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-zinc-300 line-clamp-2">
          {displayOneLiner}
        </p>

        {/* Girişimcinin Masaya Koydukları */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex flex-wrap gap-1.5">
            <span className={cn('inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-lg border', vhData.color)}>
              <Car className="w-3 h-3" />
              {vhData.label}
            </span>
            <span className={cn('inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-lg border', wsData.color)}>
              <Home className="w-3 h-3" />
              {wsData.label}
            </span>
          </div>
        </div>

        {/* Finansal Metrikler (3'lü Kompakt Kutu) */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 p-2 border border-slate-200/80 dark:border-zinc-700">
          <div className="text-center">
            <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">
              Aranan Bütçe
            </span>
            <span className="mt-0.5 block font-display text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(draft.budget.totalRequiredCapital)}
            </span>
          </div>

          <div className="text-center border-x border-slate-200 dark:border-zinc-700 px-0.5">
            <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">
              Aylık Net Kâr
            </span>
            <span className="mt-0.5 block font-display text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(draft.financials.estimatedMonthlyNetProfit)}
            </span>
          </div>

          <div className="text-center">
            <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">
              Teklif & Süre
            </span>
            <span className="mt-0.5 block font-display text-[11px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 truncate">
              %{draft.financials.offeredInvestorSharePercent} (~{draft.financials.calculatedPaybackMonths} Ay)
            </span>
          </div>
        </div>
      </div>

      {/* Alt Güvence & Lokasyon Barı */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-zinc-300">
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Onaylı Fizibilite Modeli
        </span>
        <span className="text-slate-500 font-semibold text-[10.5px]">
          {draft.authorCity || 'Türkiye Geneli'}
        </span>
      </div>
    </div>
  );
}
