'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Radar, 
  Compass, 
  MapPin, 
  Users, 
  TrendingUp, 
  Flame, 
  ArrowRight, 
  Sparkles, 
  Search,
  Layers,
  Building2,
  CheckCircle2,
  Store,
  Users2
} from 'lucide-react';
import type {
  QuickLocationPreset,
  RadarCategoryKey,
  RadarSpatialResponse,
} from '@/types/radar.types';
import {
  RADAR_CATEGORIES,
  QUICK_LOCATION_PRESETS,
  RADAR_DEFAULT_CENTER,
  RADAR_DEFAULT_RADIUS_METERS,
} from '@/features/radar/config/radar.config';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Dynamic SSR-safe Leaflet Map
const InvestmentRadarMap = dynamic(
  () => import('@/components/radar/InvestmentRadarMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[460px] lg:min-h-[540px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-100/70 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
          <Compass className="h-6 w-6 animate-spin" />
        </div>
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          Mekânsal Radar Haritası Yükleniyor...
        </p>
      </div>
    ),
  },
);

const RADIUS_OPTIONS = [
  { label: '250m', value: 250 },
  { label: '500m', value: 500 },
  { label: '1 km', value: 1000 },
  { label: '2 km', value: 2000 },
];

export function HomeInvestmentRadarSection() {
  const [selectedCategory, setSelectedCategory] = useState<RadarCategoryKey>('pet_shop');
  const [centerLat, setCenterLat] = useState<number>(RADAR_DEFAULT_CENTER.lat);
  const [centerLng, setCenterLng] = useState<number>(RADAR_DEFAULT_CENTER.lng);
  const [zoom, setZoom] = useState<number>(RADAR_DEFAULT_CENTER.zoom);
  const [radiusMeters, setRadiusMeters] = useState<number>(RADAR_DEFAULT_RADIUS_METERS);
  const [selectedLocation, setSelectedLocation] = useState<QuickLocationPreset | null>(
    QUICK_LOCATION_PRESETS[0] || null,
  );
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const [radarData, setRadarData] = useState<RadarSpatialResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch Spatial Intelligence
  const fetchSpatialData = useCallback(
    async (lat: number, lng: number, radius: number, category: RadarCategoryKey, locName?: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          lat: lat.toString(),
          lng: lng.toString(),
          radius: radius.toString(),
          category,
          ...(locName ? { locationName: locName } : {}),
        });

        const res = await fetch(`/api/radar/spatial-query?${queryParams.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('Mekânsal sorgu yanıt vermedi');
        }

        const json = await res.json();
        if (json.ok && json.data) {
          setRadarData(json.data);
        } else {
          throw new Error(json.error || 'Veri alınamadı');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('[radar-home] Fetch error:', err);
          setError(err.message || 'Mekânsal analiz yüklenemedi.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Initial and reactive fetch
  useEffect(() => {
    fetchSpatialData(
      centerLat,
      centerLng,
      radiusMeters,
      selectedCategory,
      selectedLocation?.name || 'Seçili Bölge',
    );
  }, [centerLat, centerLng, radiusMeters, selectedCategory, selectedLocation, fetchSpatialData]);

  // Handle Location selection
  const handleLocationSelect = (presetId: string) => {
    const preset = QUICK_LOCATION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedLocation(preset);
    setCenterLat(preset.lat);
    setCenterLng(preset.lng);
    setZoom(preset.zoom);
  };

  // Handle Map circle dragging or redrawing
  const handleCircleChanged = (lat: number, lng: number, radius: number) => {
    setCenterLat(lat);
    setCenterLng(lng);
    setRadiusMeters(radius);
    setSelectedLocation(null);
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const list = Object.values(RADAR_CATEGORIES);
    if (!categorySearchQuery.trim()) return list;
    const q = categorySearchQuery.toLowerCase();
    return list.filter((c) => c.label.toLowerCase().includes(q));
  }, [categorySearchQuery]);

  // Demographic mock stats based on area
  const demographicStats = useMemo(() => {
    const popEst = Math.round((Math.PI * Math.pow(radiusMeters / 1000, 2)) * 12500);
    return {
      population: popEst > 0 ? popEst.toLocaleString('tr-TR') : '32.400',
      ageProfile: 'Genç & Çalışan (%58)',
      sesGroup: 'A / B Grubu',
      footTraffic: '8.9 / 10 (Yoğun)',
    };
  }, [radiusMeters]);

  return (
    <section className="relative mx-auto w-full max-w-[1280px] px-5 lg:px-8 py-8 sm:py-12">
      {/* 1. BAŞLIK VE ÜST AÇIKLAMA */}
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-3 shadow-xs">
            <Radar className="w-3.5 h-3.5 animate-spin" />
            <span>LOKASYON & YATIRIM İSTİHBARATI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
            Yatırım ve Lokasyon Radarı
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            İş kolunuzu seçin, haritada dilediğiniz alanı çemberle tarayın. Bölgenin demografik yapısını, rakip yoğunluğunu ve haritada yanıp sönen aktif <strong className="text-slate-900 dark:text-white">devir & ortaklık fırsatlarını</strong> anlık analiz edin.
          </p>
        </div>

        {/* Hızlı İlan Ver / Tüm Radarı Aç Linkleri */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/radar"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-200 hover:border-amber-500/40 hover:text-amber-600 transition-all shadow-xs"
          >
            <span>Tam Ekran Radar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/ilan/olustur"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs sm:text-sm font-bold text-slate-950 shadow-sm shadow-amber-500/20 transition-all"
          >
            <span>Bu Bölgede İlan Ver</span>
          </Link>
        </div>
      </div>

      {/* 2. ANA RADAR KOKPİTİ (3 ENTEGRE SÜTUN) */}
      <div className="relative rounded-3xl border-2 border-slate-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-4 sm:p-5 lg:p-6 shadow-xl backdrop-blur-md overflow-hidden ring-1 ring-slate-100 dark:ring-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* ========================================================================= */}
          {/* A. SOL SÜTUN: İŞ KOLLARI & LOKASYON SEÇİCİ (~280px - lg:col-span-3)       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/70 dark:border-zinc-800/80 pb-5 lg:pb-0 lg:pr-5">
            <div>
              {/* Lokasyon Seçimi Dropdown */}
              <div className="mb-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  1. Bölge / Lokasyon Seçin
                </label>
                <Select
                  value={selectedLocation?.id || ''}
                  onValueChange={handleLocationSelect}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 px-3 text-xs font-semibold">
                    <SelectValue placeholder="Bölge seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {QUICK_LOCATION_PRESETS.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs font-medium">
                        {p.city} — {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* İş Kolları Başlığı ve Arama */}
              <div className="mb-2.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  2. Hedef İş Kolu / Sektör
                </label>
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="İş kolu ara (örn: petshop, kasap)..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              {/* Dikey İş Kolları Listesi (Kaydırılabilir) */}
              <div className="max-h-[340px] sm:max-h-[380px] lg:max-h-[420px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-800">
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedCategory(cat.key)}
                      className={cn(
                        'w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 group border',
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/40 text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'bg-white/60 dark:bg-zinc-900/40 border-slate-200/60 dark:border-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/40 font-medium',
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0">{cat.emoji}</span>
                        <span className="text-xs truncate">{cat.label}</span>
                      </div>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sol Alt Bilgi Kartı */}
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 text-[11px] text-muted-foreground leading-relaxed">
              💡 Haritada çemberi sürükleyerek veya tıklayarak analiz yarıçapını değiştirebilirsiniz.
            </div>
          </div>

          {/* ========================================================================= */}
          {/* B. ORTA SÜTUN: İNTERAKTİF HARİTA & ÇEMBER RADAR (~500px - lg:col-span-6)    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
            {/* Harita Üst Barı: Yarıçap & Canlı Durum */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Yarıçap:</span>
                <div className="inline-flex rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-800/80 p-0.5">
                  {RADIUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRadiusMeters(opt.value)}
                      className={cn(
                        'px-2 py-0.5 text-[11px] font-bold rounded-md transition-all',
                        radiusMeters === opt.value
                          ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canlı İlan Gösterge Rozeti */}
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{radarData?.listingsInRadius.length || 0} Aktif Fırsat Sinyali</span>
              </div>
            </div>

            {/* İnteraktif Harita Tuvali */}
            <div className="relative w-full h-[400px] sm:h-[460px] lg:h-[500px] rounded-2xl overflow-hidden shadow-inner border border-slate-200/80 dark:border-zinc-800">
              <InvestmentRadarMap
                centerLat={centerLat}
                centerLng={centerLng}
                zoom={zoom}
                radiusMeters={radiusMeters}
                competitors={radarData?.competitors || []}
                listings={radarData?.listingsInRadius || []}
                onCircleChanged={handleCircleChanged}
              />
            </div>

            {/* Harita Alt Lejantı (Pin Açıklamaları) */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground pt-1 px-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
                  <span className="font-medium text-slate-700 dark:text-zinc-300">Devir / Ortaklık İlanları (Sinyal)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                  <span className="font-medium text-slate-700 dark:text-zinc-300">Mevcut Rakipler ({radarData?.competitors.length || 0})</span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground/80">© CARTO / OSM Verisi</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* C. SAĞ SÜTUN: DEMOGRAFİ, AI SKORU & İLAN LİSTESİ (~340px - lg:col-span-3)   */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200/70 dark:border-zinc-800/80 pt-5 lg:pt-0 lg:pl-5">
            <div className="space-y-4">
              
              {/* 1. YAPAY ZEKA YATIRIM FIRSAT SKORU */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Yatırım Fırsat Skoru
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
                    {radarData?.metrics.opportunityLabel || 'Yüksek Fırsat'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
                    {radarData ? (radarData.metrics.opportunityScore / 10).toFixed(1) : '8.8'}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">/ 10</span>
                </div>
                
                {/* Pazar Doygunluk Barı */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Pazar Doygunluğu</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{radarData?.metrics.saturationScore ?? 34}% (Düşük Rekabet)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, radarData?.metrics.saturationScore ?? 34)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. DEMOGRAFİK YAPI VE NÜFUS ÖZETİ */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/60 space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span>Bölgesel Demografi & Nüfus</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800">
                    <span className="text-[10px] text-muted-foreground block">Kapsanan Nüfus</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{demographicStats.population}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800">
                    <span className="text-[10px] text-muted-foreground block">Gelir Seviyesi</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{demographicStats.sesGroup}</strong>
                  </div>
                  <div className="col-span-2 p-2 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Kitle Profili:</span>
                    <strong className="text-slate-900 dark:text-white font-semibold text-[11px]">{demographicStats.ageProfile}</strong>
                  </div>
                </div>
              </div>

              {/* 3. BÖLGEDEKİ AKTİF DEVİR VE ORTAKLIK İLANLARI */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-amber-500" />
                    <span>Bölgedeki Aktif Fırsatlar</span>
                  </h4>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {radarData?.listingsInRadius.length || 0} İlan
                  </span>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                  {radarData && radarData.listingsInRadius.length > 0 ? (
                    radarData.listingsInRadius.slice(0, 3).map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="block p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:border-amber-500/50 transition-all group"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">
                            {item.tag || item.categoryLabel}
                          </span>
                          {item.price && (
                            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                              {item.price}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {item.title}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="p-3 text-center rounded-xl bg-slate-50 dark:bg-zinc-800/30 text-[11px] text-muted-foreground">
                      Bu çemberde henüz aktif devir/ortaklık ilanı yok.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rapor İncele Butonu */}
            <div className="pt-2">
              <Link
                href={`/radar?lat=${centerLat}&lng=${centerLng}&category=${selectedCategory}`}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100/80 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-900 dark:text-white text-center flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Detaylı İstihbarat Raporunu Aç</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
export default HomeInvestmentRadarSection;
