'use client';

import Link from 'next/link';
import {
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Target,
  ArrowUpRight,
  PlusCircle,
  Handshake,
  Compass,
  Lightbulb,
} from 'lucide-react';
import type { RadarSpatialResponse } from '@/types/radar.types';
import { RADAR_CATEGORIES } from '@/features/radar/config/radar.config';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RadarAnalysisPanelProps {
  data: RadarSpatialResponse | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export function RadarAnalysisPanel({ data, isLoading }: RadarAnalysisPanelProps) {
  if (isLoading && !data) {
    return <RadarAnalysisSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Compass className="h-7 w-7 animate-pulse" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-foreground">
          Yatırım Alanını Belirleyin
        </h3>
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
          Harita üzerinde dilediğiniz bir noktaya tıklayıp çember çizin veya sol üstten popüler bir lokasyon seçin.
        </p>
      </div>
    );
  }

  const { query, metrics, listingsInRadius, intelligence } = data;
  const categoryMeta = RADAR_CATEGORIES[query.category] ?? RADAR_CATEGORIES.cafe;

  return (
    <div className="space-y-4 pb-6">
      {/* 1. KART: ÇEMBER İÇİNDEKİ AKTİF FIRSATLAR (En Üstte) */}
      {listingsInRadius.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.03] to-transparent p-4 sm:p-5 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
                <Sparkles className="h-4 w-4 fill-white" />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-foreground">
                  Bu Çemberde {listingsInRadius.length} Aktif Girişimbee İlanı Var
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Bölgede hazır müşteri portföyü ve kurulu devir/ortaklık fırsatları
                </p>
              </div>
            </div>
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
              Canlı İlanlar
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {listingsInRadius.map((listing) => (
              <div
                key={listing.id}
                className="group relative flex flex-col justify-between gap-2 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-amber-400 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {listing.categoryLabel}
                      </span>
                      {listing.isSuper && (
                        <span className="inline-flex items-center gap-0.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          <Zap className="h-2.5 w-2.5 fill-rose-500 text-rose-500" />
                          Süper İlan
                        </span>
                      )}
                    </div>
                    <h4 className="font-display text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-600 dark:text-zinc-100 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                      {listing.title}
                    </h4>
                  </div>
                  {listing.price && (
                    <span className="shrink-0 font-display text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {listing.price}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-muted-foreground dark:border-zinc-800">
                  <span>Merkeze {listing.distanceMeters} metre</span>
                  <Link
                    href={listing.href}
                    className="inline-flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400"
                  >
                    <span>İlanı İncele</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* 2. KART: RAKİP & DOYGUNLUK METRİKLERİ */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Target className="h-3.5 w-3.5" />
            </span>
            <h3 className="font-display text-sm font-bold text-foreground">
              {categoryMeta.label} Pazar Analizi
            </h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {query.radiusMeters}m Çap ({metrics.areaKm2} km²)
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Rakip Sayısı */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
            <span className="text-[10.5px] font-medium text-muted-foreground">
              Çember İçi Rakip
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {metrics.competitorCount}
              </span>
              <span className="text-xs text-muted-foreground">İşletme</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 block">
              {metrics.densityPerKm2} adet / km²
            </span>
          </div>

          {/* Doygunluk Oranı */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
            <span className="text-[10.5px] font-medium text-muted-foreground">
              Pazar Doygunluğu
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                className={cn(
                  'font-display text-xl sm:text-2xl font-black',
                  metrics.saturationLevel === 'low'
                    ? 'text-emerald-600'
                    : metrics.saturationLevel === 'moderate'
                      ? 'text-amber-600'
                      : 'text-rose-600',
                )}
              >
                %{metrics.saturationScore}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground truncate block">
              {metrics.saturationLevel === 'low'
                ? 'Düşük Yoğunluk'
                : metrics.saturationLevel === 'moderate'
                  ? 'Dengeli Doygunluk'
                  : 'Yüksek Doygunluk'}
            </span>
          </div>

          {/* Fırsat Skoru */}
          <div className="col-span-2 sm:col-span-1 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/30">
            <span className="text-[10.5px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Fırsat Skoru
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {metrics.opportunityScore}
              </span>
              <span className="text-xs font-bold text-indigo-400">/ 10</span>
            </div>
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 block truncate">
              {metrics.opportunityLabel}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3.5 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="font-medium text-muted-foreground">{metrics.saturationLabel}</span>
            <span className="font-bold text-foreground">%{metrics.saturationScore}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
            <div
              className={cn(
                'h-full transition-all duration-500',
                metrics.saturationLevel === 'low'
                  ? 'bg-emerald-500'
                  : metrics.saturationLevel === 'moderate'
                    ? 'bg-amber-500'
                    : 'bg-rose-500',
              )}
              style={{ width: `${Math.max(5, metrics.saturationScore)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. KART: AI YATIRIMCI TAVSİYESİ & PAZAR AÇIĞI */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
            <TrendingUp className="h-3.5 w-3.5" />
          </span>
          <h3 className="font-display text-sm font-bold text-foreground">
            Bölgesel İstihbarat ve Pazar Açığı
          </h3>
        </div>

        {/* Summary Note */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs leading-relaxed text-slate-800 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200">
          <p>{intelligence.summaryAdvice}</p>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pros */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 space-y-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Fırsat Avantajları
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
              {intelligence.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span className="leading-snug">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-3 space-y-2">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Risk Faktörleri
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
              {intelligence.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span className="leading-snug">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Missing Concepts (Fırsat Avcısı) */}
        {intelligence.missingConcepts && intelligence.missingConcepts.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-3 space-y-2">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Eksik Konseptler (Fırsat Avcısı)
            </span>
            <div className="space-y-1.5">
              {intelligence.missingConcepts.map((concept, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white/70 dark:bg-zinc-800/70 border border-slate-200/50 dark:border-zinc-700/50 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                    <span>{concept.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold">{concept.tag}</span>
                  </div>
                  <p className="text-muted-foreground text-[10.5px] leading-snug">{concept.description}</p>
                  <div className="flex items-center justify-between pt-0.5 text-[9.5px] text-muted-foreground border-t border-slate-200/40 dark:border-zinc-700/40">
                    <span>🎯 {concept.targetAudience}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">%{concept.suitabilityScore} Uyum</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target Demographic & Niche Idea */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-2 text-xs dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground">Hedef Kitle: </span>
              <span className="text-muted-foreground">{intelligence.targetDemographic}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground">Girişim Stratejisi: </span>
              <span className="text-muted-foreground">{intelligence.recommendedEntryStrategy}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. KART: HIZLI AKSİYON BUTONLARI */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Button
            asChild
            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 text-xs shadow-xs"
          >
            <Link
              href={`/ilan/olustur?category=${query.category}&lat=${query.lat}&lng=${query.lng}`}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Bu Çemberde Yeni İlan Ver</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex-1 h-11 rounded-xl border-slate-200 font-bold gap-2 text-xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <Link href={`/kategori/ortak-bul`}>
              <Handshake className="h-4 w-4 text-amber-500" />
              <span>Bu Bölgede Kurucu Ortak Ara</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function RadarAnalysisSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-44 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
      <div className="h-56 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
    </div>
  );
}
