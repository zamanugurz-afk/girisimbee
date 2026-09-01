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

  const getWorkspaceLabel = () => {
    switch (draft.collateral.workspaceType) {
      case 'home':
        return 'Ev / Mutfak / Oda';
      case 'garage_workshop':
        return 'Garaj / Özel Atölye';
      case 'rented_shop':
        return 'Kiralık Dükkan';
      case 'virtual_mobile':
        return 'Sanal / Dükkansız';
      case 'client_location':
        return 'Müşteri Yerinde / Sahada';
      default:
        return 'Esnek Alan';
    }
  };

  const getVehicleLabel = () => {
    switch (draft.collateral.vehicleType) {
      case 'personal_car':
        return 'Şahsi Binek Araç';
      case 'light_commercial':
        return 'Hafif Ticari / Panelvan';
      case 'motorcycle':
        return 'Motosiklet / Kurye';
      default:
        return 'Taşıtsız (Kargo/Dijital)';
    }
  };

  const displayTitle = draft.title.trim() || 'Yeni Nesil Niş Girişim Fikri';
  const displayOneLiner =
    draft.oneLiner.trim() ||
    'Fikir ve operasyonel emek hazır; sermaye ve büyüme desteği için yatırımcı/ortak aranıyor.';

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm hover:shadow-md transition-all duration-300',
        className
      )}
    >
      {/* Üst Vurgu Çizgisi */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-teal-400 to-indigo-500" />

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Üst Rozetler ve Kategori */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11.5px] font-bold border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            💡 Fikrim Var, Bütçem Yok
          </span>

          <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
            {draft.category}
          </span>
        </div>

        {/* Fikir Başlığı */}
        <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-foreground leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {displayTitle}
        </h3>

        {/* Tek Cümlelik Açıklama */}
        <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-zinc-300 line-clamp-2 min-h-[36px]">
          {displayOneLiner}
        </p>

        {/* Girişimcinin Masaya Koydukları (Özkaynak Hapları) */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
            Girişimcinin Masaya Koydukları:
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
              <Car className="w-3 h-3 text-emerald-600" />
              {getVehicleLabel()}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40">
              <Home className="w-3 h-3 text-sky-600" />
              {getWorkspaceLabel()}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
              <Clock className="w-3 h-3 text-purple-600" />
              {draft.collateral.hoursPerWeek}s / Hafta
            </span>
          </div>
        </div>

        {/* Finansal Metrikler (3'lü Kompakt Kutu) */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50/90 dark:bg-zinc-800/60 p-2.5 border border-slate-100 dark:border-zinc-800">
          <div className="text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Aranan Bütçe
            </span>
            <span className="mt-0.5 block font-display text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400">
              {formatCurrency(draft.budget.totalRequiredCapital)}
            </span>
          </div>

          <div className="text-center border-x border-slate-200/80 dark:border-zinc-700">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Aylık Net Kâr
            </span>
            <span className="mt-0.5 block font-display text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(draft.financials.estimatedMonthlyNetProfit)}
            </span>
          </div>

          <div className="text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Teklif & Dönüş
            </span>
            <span className="mt-0.5 block font-display text-xs sm:text-[13px] font-extrabold text-indigo-600 dark:text-indigo-400 truncate">
              %{draft.financials.offeredInvestorSharePercent} ({draft.financials.calculatedPaybackMonths} Ay)
            </span>
          </div>
        </div>
      </div>

      {/* Alt Aksiyon Çubuğu */}
      <div className="px-5 py-3 bg-slate-50/50 dark:bg-zinc-800/30 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          Fizibilite Taslağı
        </span>
        <span className="text-[11px] text-slate-400 font-normal">
          {draft.authorCity || 'Türkiye Geneli'}
        </span>
      </div>
    </div>
  );
}
