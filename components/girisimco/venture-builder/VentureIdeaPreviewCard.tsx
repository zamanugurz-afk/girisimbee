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
        return { label: 'Kendi Evim / Mutfak (₺0 Kira)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
      case 'garage_workshop':
        return { label: 'Garaj / Özel Atölye (₺0 Kira)', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
      case 'rented_shop':
        return { label: 'Kiralık Dükkan / Butik', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' };
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
        return { label: 'Şahsi Binek Araç Hazır', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
      case 'light_commercial':
        return { label: 'Hafif Ticari / Panelvan Hazır', color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' };
      case 'motorcycle':
        return { label: 'Motosiklet / Kurye Hazır', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
      default:
        return { label: 'Taşıtsız (Kargo / Dijital)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' };
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
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sky-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-md hover:shadow-lg transition-all duration-300',
        className
      )}
    >
      {/* Üst Renkli Gradyan Şerit */}
      <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-emerald-400 via-sky-400 to-indigo-500" />

      <div className="p-6 flex flex-col flex-1">
        {/* Üst Rozetler ve Kategori */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-black tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              Fikrim Var, Bütçem Yok
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <Check className="w-3 h-3 text-emerald-600" />
              Doğrulanmış Model
            </span>
          </div>

          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-slate-200/80 dark:border-zinc-700">
            {draft.category}
          </span>
        </div>

        {/* Fikir Başlığı */}
        <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-snug">
          {displayTitle}
        </h3>

        {/* Tek Cümlelik Açıklama */}
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-300 line-clamp-2 min-h-[40px]">
          {displayOneLiner}
        </p>

        {/* Girişimcinin Masaya Koydukları (Renkli Görsel Haplar) */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2.5">
            Girişimcinin Masaya Koyduğu Özkaynaklar:
          </p>
          <div className="flex flex-wrap gap-2">
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border shadow-2xs', vhData.color)}>
              <Car className="w-3.5 h-3.5" />
              {vhData.label}
            </span>
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border shadow-2xs', wsData.color)}>
              <Home className="w-3.5 h-3.5" />
              {wsData.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              {draft.collateral.hoursPerWeek} Saat / Hafta Emek
            </span>
          </div>
        </div>

        {/* Finansal Metrikler (3'lü Renkli Canlı Kutu) */}
        <div className="mt-5 grid grid-cols-3 gap-2.5 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 dark:from-zinc-800/80 dark:to-zinc-800/40 p-3.5 border border-slate-200/90 dark:border-zinc-700 shadow-inner">
          <div className="text-center">
            <span className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
              Aranan Bütçe
            </span>
            <span className="mt-1 block font-display text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(draft.budget.totalRequiredCapital)}
            </span>
          </div>

          <div className="text-center border-x border-slate-200 dark:border-zinc-700 px-1">
            <span className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
              Aylık Net Kâr
            </span>
            <span className="mt-1 block font-display text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(draft.financials.estimatedMonthlyNetProfit)}
            </span>
          </div>

          <div className="text-center">
            <span className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
              Teklif & Amortisman
            </span>
            <span className="mt-1 block font-display text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 truncate">
              %{draft.financials.offeredInvestorSharePercent} (~{draft.financials.calculatedPaybackMonths} Ay)
            </span>
          </div>
        </div>
      </div>

      {/* Alt Güvence & Lokasyon Barı */}
      <div className="px-6 py-3.5 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          Onaylı Girişimbee Fizibilite Modeli
        </span>
        <span className="text-slate-500 font-semibold">
          {draft.authorCity || 'Türkiye Geneli'}
        </span>
      </div>
    </div>
  );
}
