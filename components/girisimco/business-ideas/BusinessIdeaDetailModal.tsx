'use client';

import React from 'react';
import {
  X,
  Coins,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Wrench,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { BusinessIdea } from '@/features/business-ideas/types/business-ideas.types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BusinessIdeaDetailModalProps {
  idea: BusinessIdea | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessIdeaDetailModal({
  idea,
  isOpen,
  onClose,
}: BusinessIdeaDetailModalProps) {
  if (!isOpen || !idea) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalToolCost = idea.requiredTools.reduce(
    (acc, curr) => acc + curr.estimatedCost,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Başlığı */}
        <div className="relative p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors shadow-xs"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4 pr-10">
            <span className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-3xl flex items-center justify-center shrink-0 shadow-xs">
              {idea.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  {idea.categoryLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-800 dark:text-blue-300 text-xs font-bold">
                  {idea.workStyleLabel}
                </span>
                {idea.trendBadge && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    {idea.trendBadge}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                {idea.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-snug">
                {idea.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Gövdesi (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-zinc-200">
          {/* 3'lü Özet Metrik Panosu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> Gerekli Sermaye
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 block">
                {idea.capitalRange.formatted}
              </span>
              <span className="text-[10.5px] text-muted-foreground mt-0.5 block">
                İlk gelir: {idea.timeToFirstIncome}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Aylık Gelir Potansiyeli
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300 mt-1 block">
                {idea.potentialMonthlyEarnings.formatted}
              </span>
              <span className="text-[10.5px] text-muted-foreground mt-0.5 block">
                Ortalama %{idea.profitMarginPercent} kâr marjı
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
              <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Kazanç Modeli
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 block">
                {idea.revenueFrequencyLabel}
              </span>
              <span className="text-[10.5px] text-muted-foreground mt-0.5 block">
                Zorluk: {idea.difficultyLevel}
              </span>
            </div>
          </div>

          {/* Günlük Kazanç Örneği Vurgusu */}
          {idea.dailyRevenueExample && (
            <div className="p-3.5 rounded-2xl bg-slate-900 dark:bg-zinc-800 text-white flex items-center gap-3">
              <span className="text-2xl shrink-0">💡</span>
              <div className="text-xs leading-relaxed">
                <strong className="text-amber-400 font-bold block mb-0.5">
                  Örnek Günlük Kazanç Hesabı:
                </strong>
                {idea.dailyRevenueExample}
              </div>
            </div>
          )}

          {/* İşin Özeti */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> İşin Özeti & Fırsat
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
              {idea.summaryDescription}
            </p>
          </div>

          {/* Hedef Müşteri Kitlesi */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-500" /> Kimlere Satacaksınız? (Hedef Kitle)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {idea.targetCustomers.map((customer, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 flex items-center gap-2 text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200">
                    {customer}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gerekli Temel Alet & Ekipman Listesi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-600" /> Gerekli Temel Alet & Ekipman Listesi
              </h3>
              <span className="text-[11px] font-bold text-muted-foreground">
                Toplam Tahmini: {formatCurrency(totalToolCost)}
              </span>
            </div>
            <div className="space-y-2">
              {idea.requiredTools.map((tool, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-zinc-100">
                        {tool.name}
                      </span>
                      {tool.isMandatory && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[9.5px] font-bold">
                          Temel Alet
                        </span>
                      )}
                    </div>
                    {tool.description && (
                      <p className="text-[11px] text-muted-foreground">
                        {tool.description}
                      </p>
                    )}
                  </div>
                  <span className="font-black text-slate-900 dark:text-zinc-100 whitespace-nowrap text-xs">
                    {tool.estimatedCost === 0 ? 'Mevcut / 0 ₺' : formatCurrency(tool.estimatedCost)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Adım Adım Nasıl Başlanır? */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-500" /> Adım Adım Nasıl Başlanır? (Yol Haritası)
            </h3>
            <div className="space-y-2.5">
              {idea.executionSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 flex items-start gap-3 text-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    {step.stepNumber}
                  </span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-zinc-100">
                      {step.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Püf Noktaları ve Yaygın Hatalar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-emerald-600" /> Püf Noktaları (Pro Tips)
              </h4>
              <ul className="space-y-1.5 text-[11px] text-emerald-950 dark:text-emerald-200">
                {idea.proTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-500/20 space-y-2">
              <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Dikkat Edilmesi Gerekenler
              </h4>
              <ul className="space-y-1.5 text-[11px] text-rose-950 dark:text-rose-200">
                {idea.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold shrink-0">⚠️</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Alt Kısım / Kapat Butonu */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex items-center justify-between shrink-0">
          <span className="text-xs text-muted-foreground">
            💡 Kendi işinizin patronu olmak için bugün ilk adımı atın.
          </span>
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-5"
          >
            Anladım & Kapat
          </Button>
        </div>
      </div>
    </div>
  );
}
