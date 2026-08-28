'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Radar, Compass, RefreshCw, Layers } from 'lucide-react';
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
import { RadarControlBar } from '@/components/radar/RadarControlBar';
import { RadarAnalysisPanel } from '@/components/radar/RadarAnalysisPanel';
import { Button } from '@/components/ui/button';

// Dynamic SSR-safe Leaflet Map
const InvestmentRadarMap = dynamic(
  () => import('@/components/radar/InvestmentRadarMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[520px] lg:min-h-[660px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100/70 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Compass className="h-6 w-6 animate-spin" />
        </div>
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          Harita ve Mekânsal Radar Yükleniyor...
        </p>
      </div>
    ),
  },
);

export function InvestmentRadarClient() {
  const [selectedCategory, setSelectedCategory] = useState<RadarCategoryKey>('cafe');
  const [centerLat, setCenterLat] = useState<number>(RADAR_DEFAULT_CENTER.lat);
  const [centerLng, setCenterLng] = useState<number>(RADAR_DEFAULT_CENTER.lng);
  const [zoom, setZoom] = useState<number>(RADAR_DEFAULT_CENTER.zoom);
  const [radiusMeters, setRadiusMeters] = useState<number>(RADAR_DEFAULT_RADIUS_METERS);
  const [selectedLocation, setSelectedLocation] = useState<QuickLocationPreset | null>(
    QUICK_LOCATION_PRESETS[0] || null,
  );

  const [radarData, setRadarData] = useState<RadarSpatialResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);

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
          console.error('[radar-client] Fetch error:', err);
          setError(err.message || 'Mekânsal analiz yüklenemedi.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Trigger spatial query on parameter changes
  useEffect(() => {
    fetchSpatialData(
      centerLat,
      centerLng,
      radiusMeters,
      selectedCategory,
      selectedLocation?.name,
    );
  }, [centerLat, centerLng, radiusMeters, selectedCategory, selectedLocation, fetchSpatialData]);

  // Handle map circle update (user clicks or draws on map)
  const handleCircleChanged = useCallback((newLat: number, newLng: number, newRadius: number) => {
    setCenterLat(newLat);
    setCenterLng(newLng);
    setRadiusMeters(newRadius);
    setIsDrawingMode(false);
  }, []);

  // Handle Preset Selection
  const handleSelectLocation = useCallback((loc: QuickLocationPreset) => {
    setSelectedLocation(loc);
    setCenterLat(loc.lat);
    setCenterLng(loc.lng);
    setZoom(loc.zoom);
  }, []);

  const handleSelectCategory = useCallback((cat: RadarCategoryKey) => {
    setSelectedCategory(cat);
  }, []);

  const handleChangeRadius = useCallback((r: number) => {
    setRadiusMeters(r);
  }, []);

  const handleStartDrawCircle = useCallback(() => {
    setIsDrawingMode((prev) => !prev);
  }, []);

  const handleStartDrawPolygon = useCallback(() => {
    setIsDrawingMode(true);
  }, []);

  const handleClearDrawing = useCallback(() => {
    setRadiusMeters(RADAR_DEFAULT_RADIUS_METERS);
    setCenterLat(RADAR_DEFAULT_CENTER.lat);
    setCenterLng(RADAR_DEFAULT_CENTER.lng);
    setSelectedLocation(QUICK_LOCATION_PRESETS[0] || null);
    setIsDrawingMode(false);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              Canlı İstihbarat ve Çember Analizi
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
            <span className="text-xs text-muted-foreground hidden sm:inline font-medium">
              OpenStreetMap POI + Girişimbee Eşleştirmesi
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Radar className="h-7 w-7 text-rose-500" />
            <span>Yatırım Radarı</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Haritada çember çizin; seçtiğiniz yarıçaptaki tüm rakipleri, pazar doygunluğunu, AI yatırım tavsiyelerini ve çember içindeki hazır Girişimbee fırsatlarını anında görüntüleyin.
          </p>
        </div>

        {/* Live Metrics Header Chip */}
        {radarData && (
          <div className="flex items-center gap-3 self-start md:self-auto rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Girişimbee Fırsat Skoru
              </p>
              <p className="font-display text-lg font-black text-indigo-600 dark:text-indigo-400">
                {radarData.metrics.opportunityScore} / 10
              </p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-zinc-800" />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Bulunan Rakip
              </p>
              <p className="font-display text-lg font-black text-slate-900 dark:text-foreground">
                {radarData.metrics.competitorCount} İşletme
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Harita & Kontroller - 7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Floating Control Bar */}
          <RadarControlBar
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            radiusMeters={radiusMeters}
            onChangeRadius={handleChangeRadius}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onStartDrawCircle={handleStartDrawCircle}
            onStartDrawPolygon={handleStartDrawPolygon}
            onClearDrawing={handleClearDrawing}
            isDrawingActive={isDrawingMode}
            isLoading={isLoading}
            competitorCount={radarData?.metrics.competitorCount ?? 0}
            listingsCount={radarData?.listingsInRadius.length ?? 0}
          />

          {/* Interactive Map */}
          <div className="relative h-[540px] lg:h-[680px] w-full">
            <InvestmentRadarMap
              centerLat={centerLat}
              centerLng={centerLng}
              zoom={zoom}
              radiusMeters={radiusMeters}
              competitors={radarData?.competitors ?? []}
              listings={radarData?.listingsInRadius ?? []}
              onCircleChanged={handleCircleChanged}
              isDrawingMode={isDrawingMode}
            />

            {/* Map Legend Floating Pill */}
            <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Rakipler (POI)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-amber-400 border border-amber-600 flex items-center justify-center text-[8px] text-white font-bold">★</span>
                <span>Girişimbee İlanı</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                <span>Radar Merkezi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (İstihbarat Paneli - 5 cols) */}
        <div className="lg:col-span-5">
          <RadarAnalysisPanel
            data={radarData}
            isLoading={isLoading}
            onRefresh={() =>
              fetchSpatialData(
                centerLat,
                centerLng,
                radiusMeters,
                selectedCategory,
                selectedLocation?.name,
              )
            }
          />
        </div>
      </div>
    </div>
  );
}