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
  Users2,
  Navigation,
  Loader2,
  X,
  Target
} from 'lucide-react';
import type {
  QuickLocationPreset,
  RadarCategoryKey,
  RadarSpatialResponse,
  CompetitorPoi,
} from '@/types/radar.types';
import {
  RADAR_CATEGORIES,
  QUICK_LOCATION_PRESETS,
  RADAR_DEFAULT_CENTER,
  RADAR_DEFAULT_RADIUS_METERS,
  TURKEY_POPULAR_DISTRICTS,
  type LocationSearchResult,
} from '@/features/radar/config/radar.config';
import { resolveDemographicProfile } from '@/features/radar/lib/spatial-calculator';
import { Button } from '@/components/ui/button';
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
  { label: '1km', value: 1000 },
  { label: '2km', value: 2000 },
  { label: '3km', value: 3000 },
  { label: '5km', value: 5000 },
];

function normalizeTrText(str: string): string {
  return (str || '')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .trim();
}

const CLIENT_RADAR_CACHE = new Map<string, RadarSpatialResponse>();

export function HomeInvestmentRadarSection() {
  const [selectedCategories, setSelectedCategories] = useState<RadarCategoryKey[]>([]);
  const [centerLat, setCenterLat] = useState<number>(RADAR_DEFAULT_CENTER.lat);
  const [centerLng, setCenterLng] = useState<number>(RADAR_DEFAULT_CENTER.lng);
  const [zoom, setZoom] = useState<number>(RADAR_DEFAULT_CENTER.zoom);
  const [radiusMeters, setRadiusMeters] = useState<number>(RADAR_DEFAULT_RADIUS_METERS);
  const [activeLocationTitle, setActiveLocationTitle] = useState<string>('İstanbul — Kadıköy / Moda');

  // Location search states
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  // Category search states
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [selectedPoi, setSelectedPoi] = useState<CompetitorPoi | null>(null);

  const [radarData, setRadarData] = useState<RadarSpatialResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isReportBtnPulsing, setIsReportBtnPulsing] = useState(false);

  const isInitialMount = useRef(true);
  const hasTriggeredFirstPulse = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const locationSearchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Sadece İLK seçimde (harita veya sol menüden ilk kez işlem yapıldığında) 10 saniye yanıp sönme efekti
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!hasTriggeredFirstPulse.current) {
      hasTriggeredFirstPulse.current = true;
      setIsReportBtnPulsing(true);
      const timer = setTimeout(() => {
        setIsReportBtnPulsing(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [selectedCategories, centerLat, centerLng, radiusMeters]);

  // Click outside and Escape key listener to close location dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLocationDropdownOpen(false);
      }
    };

    if (isLocationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLocationDropdownOpen]);

  // Helper to fetch IP-based location from server
  const fetchIpLocation = async () => {
    try {
      const res = await fetch('/api/radar/user-location');
      if (res.ok) {
        const data = await res.json();
        if (data && data.lat && data.lng) {
          setCenterLat(data.lat);
          setCenterLng(data.lng);
          setZoom(15);
          if (data.locationTitle) {
            setActiveLocationTitle(data.locationTitle);
          }
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  };

  // 1. AUTO IP & BROWSER GEOLOCATION ON MOUNT
  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted) return;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCenterLat(lat);
          setCenterLng(lng);
          setZoom(15);
          setActiveLocationTitle('Mevcut Konumunuz');
        },
        async () => {
          // If browser GPS permission denied/ignored, seamlessly load from IP location!
          if (!isMounted) return;
          await fetchIpLocation();
        },
        { timeout: 3500, maximumAge: 60000 },
      );
    } else {
      fetchIpLocation();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. LOCATION SEARCH AUTOCOMPLETE (DEBOUNCED)
  useEffect(() => {
    if (!locationSearchQuery.trim()) {
      setLocationSearchResults([]);
      setIsSearchingLocation(false);
      return;
    }

    if (locationSearchDebounceRef.current) {
      clearTimeout(locationSearchDebounceRef.current);
    }

    locationSearchDebounceRef.current = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const localMatches = TURKEY_POPULAR_DISTRICTS.filter((d) =>
          normalizeTrText(d.name).includes(normalizeTrText(locationSearchQuery)),
        );

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=tr&limit=5&q=${encodeURIComponent(
            locationSearchQuery,
          )}`,
          { headers: { 'Accept-Language': 'tr' } },
        );
        const geoResults = await res.json();

        const formattedGeo: LocationSearchResult[] = geoResults.map((item: any) => ({
          name: item.display_name.split(',').slice(0, 3).join(', '),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          isDistrictWide: item.type === 'administrative' || item.type === 'city',
        }));

        const merged = [...localMatches, ...formattedGeo].slice(0, 6);
        setLocationSearchResults(merged);
      } catch (e) {
        console.error('Location search failed', e);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 280);

    return () => {
      if (locationSearchDebounceRef.current) clearTimeout(locationSearchDebounceRef.current);
    };
  }, [locationSearchQuery]);

  // 3. FETCH SPATIAL INTELLIGENCE (Supports Single or Dual Category Parallel Query)
  const fetchSpatialData = useCallback(
    async (lat: number, lng: number, radius: number, categories: RadarCategoryKey[], locName?: string) => {
      const roundedLat = Math.round(lat * 1000) / 1000;
      const roundedLng = Math.round(lng * 1000) / 1000;
      const catKeyStr = categories.length === 0 ? 'all' : [...categories].sort().join(',');
      const cacheKey = `${roundedLat}-${roundedLng}-${radius}-${catKeyStr}`;
      const masterKey = `${roundedLat}-${roundedLng}-${radius}-all`;

      const cached = CLIENT_RADAR_CACHE.get(cacheKey);
      if (cached) {
        setRadarData(cached);
        setIsLoading(false);
        return;
      }

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
          category: catKeyStr,
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
          CLIENT_RADAR_CACHE.set(cacheKey, json.data);
          if (catKeyStr === 'all') {
            CLIENT_RADAR_CACHE.set(masterKey, json.data);
          }
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

  // Trigger query on parameter changes
  useEffect(() => {
    fetchSpatialData(
      centerLat,
      centerLng,
      radiusMeters,
      selectedCategories,
      activeLocationTitle,
    );
  }, [centerLat, centerLng, radiusMeters, selectedCategories, activeLocationTitle, fetchSpatialData]);

  // Handle Category Toggle (Max 2 sectors selection)
  const handleCategoryToggle = (catKey: RadarCategoryKey) => {
    setSelectedPoi(null);
    if (catKey === 'all') {
      setSelectedCategories([]);
      return;
    }

    setSelectedCategories((prev) => {
      if (prev.includes(catKey)) {
        // Deselect
        return prev.filter((k) => k !== catKey);
      }
      if (prev.length >= 2) {
        // Replace 2nd category
        return [prev[0], catKey];
      }
      // Add as 2nd category
      return [...prev, catKey];
    });
  };

  // Handle Location Select
  const handleSelectLocationResult = (loc: LocationSearchResult) => {
    setCenterLat(loc.lat);
    setCenterLng(loc.lng);
    if (loc.isDistrictWide || loc.name.includes('Tüm İlçe') || loc.name.includes('İlçe Geneli')) {
      setRadiusMeters(3000);
      setZoom(13);
    } else {
      setZoom(15);
    }
    setActiveLocationTitle(loc.name);
    setLocationSearchQuery('');
    setIsLocationDropdownOpen(false);
  };

  // Handle GPS / IP Locate Me button
  const handleFindMyLocation = async () => {
    setIsLocatingUser(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCenterLat(lat);
          setCenterLng(lng);
          setZoom(15);
          setActiveLocationTitle('Mevcut Konumunuz');
          setIsLocatingUser(false);
        },
        async () => {
          await fetchIpLocation();
          setIsLocatingUser(false);
        },
        { timeout: 5000 },
      );
    } else {
      await fetchIpLocation();
      setIsLocatingUser(false);
    }
  };

  // Handle Map circle dragging or clicking
  const handleCircleChanged = (lat: number, lng: number, radius: number) => {
    setCenterLat(lat);
    setCenterLng(lng);
    setRadiusMeters(radius);

    // Look for nearby named district
    const closest = TURKEY_POPULAR_DISTRICTS.find(
      (d) => Math.abs(d.lat - lat) < 0.02 && Math.abs(d.lng - lng) < 0.02,
    );
    if (closest) {
      setActiveLocationTitle(closest.name);
    } else {
      // Async reverse geocoding to retrieve actual neighborhood/district
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`, {
        headers: { 'Accept-Language': 'tr' },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.display_name) {
            const shortName = data.display_name.split(',').slice(0, 3).join(', ');
            setActiveLocationTitle(shortName);
          }
        })
        .catch(() => {
          setActiveLocationTitle(`Seçili Alan (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
        });
    }
  };

  // Dynamic Categories: Sorted with sectors present in circle first, then other popular sectors
  const displayedCategories = useMemo(() => {
    const allCategories = Object.values(RADAR_CATEGORIES);
    if (categorySearchQuery.trim()) {
      const q = normalizeTrText(categorySearchQuery);
      return allCategories.filter((c) =>
        normalizeTrText(c.label).includes(q) ||
        c.searchKeywords?.some((k) => normalizeTrText(k).includes(q))
      );
    }

    return [...allCategories].sort((a, b) => {
      const countA = radarData?.availableSectors?.[a.key] ?? 0;
      const countB = radarData?.availableSectors?.[b.key] ?? 0;
      if (countA !== countB) {
        return countB - countA;
      }
      if (a.isPopularTop8 && !b.isPopularTop8) return -1;
      if (!a.isPopularTop8 && b.isPopularTop8) return 1;
      return 0;
    });
  }, [categorySearchQuery, radarData?.availableSectors]);

  // Master area POIs across all categories for instant brand-level search (e.g. 'bim', 'şok', 'starbucks', 'komagene')
  const visibleCompetitors = useMemo(() => {
    const rawPois = radarData?.competitors ?? [];
    if (!categorySearchQuery.trim()) return rawPois;

    const q = normalizeTrText(categorySearchQuery);
    const roundedLat = Math.round(centerLat * 1000) / 1000;
    const roundedLng = Math.round(centerLng * 1000) / 1000;
    const masterKey = `${roundedLat}-${roundedLng}-${radiusMeters}-all`;
    const masterData = CLIENT_RADAR_CACHE.get(masterKey);
    const pool = (masterData?.competitors && masterData.competitors.length > rawPois.length)
      ? masterData.competitors
      : rawPois;

    return pool.filter((p) => {
      const name = normalizeTrText(p.name);
      const catLabel = normalizeTrText(p.categoryLabel);
      const catKey = normalizeTrText(p.category);
      const brand = normalizeTrText(p.brand || '');
      return name.includes(q) || catLabel.includes(q) || catKey.includes(q) || brand.includes(q);
    });
  }, [radarData?.competitors, categorySearchQuery, centerLat, centerLng, radiusMeters]);

  const totalAreaBusinesses = useMemo(() => {
    if (categorySearchQuery.trim()) {
      return visibleCompetitors.length;
    }
    if (radarData?.availableSectors) {
      const sum = Object.values(radarData.availableSectors).reduce((a, b) => a + b, 0);
      if (sum > 0) return sum;
    }
    return radarData?.competitors.length ?? 0;
  }, [radarData, categorySearchQuery, visibleCompetitors]);

  // Real-time dynamic demographic calculation based on exact coordinates and radius
  const demographicStats = useMemo(() => {
    return resolveDemographicProfile(centerLat, centerLng, radiusMeters, activeLocationTitle);
  }, [radiusMeters, activeLocationTitle, centerLat, centerLng]);

  return (
    <section id="radar-section" className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* 2. ANA RADAR KOKPİTİ (3 ENTEGRE SÜTUN) */}
      <div className="relative rounded-3xl border-2 border-slate-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-4 sm:p-5 lg:p-6 shadow-xl backdrop-blur-md overflow-hidden ring-1 ring-slate-100 dark:ring-white/5">
        {/* Animated Loading Shimmer Bar */}
        {isLoading && (
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400/20 via-amber-500 to-amber-400/20 animate-pulse z-30 shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* ========================================================================= */}
          {/* A. SOL SÜTUN: LOKASYON SEÇİMİ & İŞ KOLLARI (~280px - lg:col-span-3)       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/70 dark:border-zinc-800/80 pb-5 lg:pb-0 lg:pr-5">
            <div>
              {/* Lokasyon Seçimi & Canlı Arama */}
              <div ref={locationDropdownRef} className="mb-3.5 relative">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Lokasyon Seçimi
                </label>

                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Adres veya ilçe ara (örn: Maltepe, Kadıköy)..."
                    value={locationSearchQuery}
                    onChange={(e) => {
                      setLocationSearchQuery(e.target.value);
                      setIsLocationDropdownOpen(true);
                    }}
                    onFocus={() => setIsLocationDropdownOpen(true)}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 pl-8 pr-8 text-xs font-semibold text-foreground placeholder:text-muted-foreground placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  {locationSearchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLocationSearchQuery('');
                        setIsLocationDropdownOpen(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFindMyLocation}
                      title="Mevcut Konumumu Bul"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400 hover:scale-110 transition-transform"
                    >
                      {isLocatingUser ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Navigation className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {/* Canlı Lokasyon Arama Sonuçları Açılır Paneli (Input'un hemen altında) */}
                  {isLocationDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                      {isSearchingLocation ? (
                        <div className="p-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                          <span>Konum aranıyor...</span>
                        </div>
                      ) : locationSearchResults.length > 0 ? (
                        <div className="p-1 space-y-0.5">
                          {locationSearchResults.map((loc) => (
                            <button
                              key={loc.id}
                              type="button"
                              onClick={() => handleSelectLocationResult(loc)}
                              className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs hover:bg-amber-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="font-medium truncate text-slate-900 dark:text-zinc-100">
                                {loc.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : locationSearchQuery.trim() ? (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                          Sonuç bulunamadı. Lütfen farklı bir ilçe/mahalle adı deneyin.
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                            Popüler Lokasyonlar & İlçeler
                          </p>
                          {TURKEY_POPULAR_DISTRICTS.slice(0, 6).map((loc) => (
                            <button
                              key={loc.id}
                              type="button"
                              onClick={() => handleSelectLocationResult(loc)}
                              className="w-full flex items-center gap-2 p-1.5 rounded-lg text-left text-xs hover:bg-amber-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate text-slate-800 dark:text-zinc-200 font-medium">
                                {loc.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Hedef İş Kolu & Sektör Arama */}
              <div className="mb-2.5 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Hedef İş Kolu / Sektör
                </label>
                
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Sektör ara (örn: Kafe)..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 pl-8 pr-8 text-xs font-semibold text-foreground placeholder:text-muted-foreground placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  {categorySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCategorySearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dikey İş Kolları ve Eşleşen İşletmeler Listesi */}
              <div className="h-[480px] lg:h-[530px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-800">
                
                {/* Arama Yapıldığında: EŞLEŞEN BİREYSEL İŞLETMELER (BİM, ŞOK, Starbucks vb.) */}
                {categorySearchQuery && visibleCompetitors.length > 0 && (
                  <div className="space-y-1.5 p-2 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <span>📍 Eşleşen İşletmeler</span>
                      </span>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        {visibleCompetitors.length} Adet
                      </span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-amber-400">
                      {visibleCompetitors.map((poi) => {
                        const isPoiSelected = selectedPoi?.id === poi.id;
                        return (
                          <button
                            key={poi.id}
                            type="button"
                            onClick={() => {
                              setSelectedPoi(poi);
                              if (poi.category && !selectedCategories.includes(poi.category as RadarCategoryKey)) {
                                setSelectedCategories([]);
                              }
                            }}
                            className={cn(
                              'w-full flex items-center justify-between p-2 rounded-xl text-left transition-all group border',
                              isPoiSelected
                                ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-xs'
                                : 'bg-white/85 dark:bg-zinc-800/80 hover:bg-amber-500/20 text-slate-800 dark:text-zinc-200 border-slate-200/80 dark:border-zinc-700/80'
                            )}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-bold truncate group-hover:text-amber-600">
                                {poi.name}
                              </p>
                              <p className="text-[10px] opacity-75 truncate">{poi.categoryLabel}</p>
                            </div>
                            <span className={cn(
                              'text-[10px] font-extrabold shrink-0 px-1.5 py-0.5 rounded-md',
                              isPoiSelected
                                ? 'bg-slate-950 text-white'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                            )}>
                              {poi.distanceMeters}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Arama Sonucu Bulunamadı Uyarısı */}
                {categorySearchQuery && visibleCompetitors.length === 0 && displayedCategories.length === 0 && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                      &ldquo;{categorySearchQuery}&rdquo; ile eşleşen işletme bulunamadı.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCategorySearchQuery('')}
                      className="text-xs font-bold text-amber-600 hover:underline"
                    >
                      Aramayı Temizle
                    </button>
                  </div>
                )}

                {/* 1. TÜM İŞLETMELER SEÇENEĞİ */}
                {!categorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedPoi(null);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 group border',
                      selectedCategories.length === 0
                        ? 'bg-amber-500/15 border-amber-500/50 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'bg-white/80 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/50 font-medium',
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">🌐</span>
                      <span className="text-xs truncate">Tüm Sektörler & İşletmeler</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {totalAreaBusinesses > 0 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                          {totalAreaBusinesses} Toplam
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold text-muted-foreground bg-slate-100 dark:bg-zinc-800">
                          0
                        </span>
                      )}
                      {selectedCategories.length === 0 && (
                        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </div>
                  </button>
                )}

                {/* Sektör Başlığı (Arama esnasında) */}
                {categorySearchQuery && displayedCategories.length > 0 && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 pt-1">
                    İlgili Sektörler
                  </p>
                )}

                {displayedCategories.map((cat) => {
                  const catIndex = selectedCategories.indexOf(cat.key);
                  const isCat1 = catIndex === 0;
                  const isCat2 = catIndex === 1;
                  const isSelected = isCat1 || isCat2;
                  const sectorCount = radarData?.availableSectors?.[cat.key] ?? 0;

                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.key)}
                      className={cn(
                        'w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 group border',
                        isCat1
                          ? 'bg-red-500/10 dark:bg-red-500/20 border-red-500/60 ring-1 ring-red-500/40 text-slate-900 dark:text-white font-bold shadow-xs'
                          : isCat2
                          ? 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/60 ring-1 ring-blue-500/40 text-slate-900 dark:text-white font-bold shadow-xs'
                          : 'bg-white/60 dark:bg-zinc-900/40 border-slate-200/60 dark:border-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/40 font-medium',
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{cat.emoji}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs truncate">{cat.label}</span>
                          {isCat1 && (
                            <span className="text-[9px] font-extrabold text-red-600 dark:text-red-400">
                              1. Sektör (Kırmızı)
                            </span>
                          )}
                          {isCat2 && (
                            <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400">
                              2. Sektör (Mavi)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {sectorCount > 0 ? (
                          <span
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-full font-bold border',
                              isCat1
                                ? 'bg-red-500/20 text-red-800 dark:text-red-200 border-red-500/40'
                                : isCat2
                                ? 'bg-blue-500/20 text-blue-800 dark:text-blue-200 border-blue-500/40'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
                            )}
                          >
                            {sectorCount}
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold text-muted-foreground bg-slate-100 dark:bg-zinc-800">
                            0
                          </span>
                        )}
                        {isCat1 && (
                          <span className="h-2.5 w-2.5 rounded-full bg-red-600 shrink-0 ring-2 ring-red-300" />
                        )}
                        {isCat2 && (
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0 ring-2 ring-blue-300" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sol Alt Bilgi Kartı */}
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 text-[11px] text-muted-foreground leading-relaxed space-y-1">
              <div>💡 <strong>Çift Sektör Analizi:</strong> En fazla 2 sektör seçerek haritada aynı anda (🔴 Kırmızı & 🔵 Mavi) karşılaştırabilirsiniz.</div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* B. ORTA SÜTUN: İNTERAKTİF HARİTA & ÇEMBER RADAR (~500px - lg:col-span-6)    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
            {/* Harita Üst Barı: Girişimbee Market Tarzı Vurgulu Başlık & Özet */}
            <div className="flex flex-col pb-0.5 space-y-1">
              <div className="inline-flex items-baseline gap-2">
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white select-none">
                  Lokasyon <span className="text-amber-500">Radarı</span>
                </h2>
              </div>
              <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-teal-400 to-amber-500" />
              <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed pt-0.5">
                Canlı harita ve yapay zeka verileriyle bölgedeki ticari yoğunluğu, demografiyi ve yatırım fırsatlarını anlık analiz edin.
              </p>
            </div>

            {/* İnteraktif Harita Tuvali */}
            <div className="relative w-full h-[400px] sm:h-[460px] lg:h-[500px] rounded-2xl overflow-hidden shadow-inner border border-slate-200/80 dark:border-zinc-800">
              {/* Visible Loading Bar on Top of Map Canvas */}
              {isLoading && (
                <div className="absolute top-0 left-0 right-0 h-1.5 z-40 bg-amber-500/25 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 w-full animate-radar-progress shadow-[0_0_12px_rgba(245,158,11,1)]" />
                </div>
              )}

              {/* On-Map Scanning Pill */}
              {isLoading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-zinc-900/95 border border-amber-500/50 shadow-lg text-xs font-bold text-slate-800 dark:text-zinc-100 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                    <span>Harita taranıyor...</span>
                  </div>
                </div>
              )}

              {/* Active Search Query Filter Badge Over Map */}
              {categorySearchQuery && (
                <div className="absolute top-3.5 left-3.5 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 dark:bg-zinc-900/90 text-white text-xs font-bold shadow-lg border border-amber-500/50 backdrop-blur-md">
                  <span>🔍 &ldquo;{categorySearchQuery}&rdquo; filtresi:</span>
                  <span className="text-amber-400 font-extrabold">{visibleCompetitors.length} işletme</span>
                  <button
                    type="button"
                    onClick={() => setCategorySearchQuery('')}
                    className="ml-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <InvestmentRadarMap
                centerLat={centerLat}
                centerLng={centerLng}
                zoom={zoom}
                radiusMeters={radiusMeters}
                competitors={visibleCompetitors}
                listings={radarData?.listingsInRadius || []}
                onCircleChanged={handleCircleChanged}
                selectedPoi={selectedPoi}
                primaryCategory={selectedCategories[0] || null}
                secondaryCategory={selectedCategories[1] || null}
              />
            </div>

            {/* Harita Alt Barı: Yarıçap Seçici & Lejant */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1.5">
              {/* Yarıçap Seçici Buton Grubu (Haritanın Altında) */}
              <div className="inline-flex items-center rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-slate-100/90 dark:bg-zinc-800/80 p-0.5 shadow-2xs shrink-0">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRadiusMeters(opt.value)}
                    className={cn(
                      'px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap leading-none',
                      radiusMeters === opt.value
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Lejant (Pin Açıklamaları) */}
              <div className="flex flex-wrap items-center gap-3.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs animate-pulse" />
                  <span className="font-medium text-slate-700 dark:text-zinc-300">
                    Devir & Ortaklık ({radarData?.listingsInRadius.length || 0})
                  </span>
                </div>
                {selectedCategories.length === 2 ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-xs" />
                      <span className="font-medium text-red-600 dark:text-red-400 font-bold">
                        {RADAR_CATEGORIES[selectedCategories[0]]?.label || '1. Sektör'} ({visibleCompetitors.filter(p => p.category === selectedCategories[0] || (selectedCategories[0] === 'restaurant' && p.category === 'donerci') || (selectedCategories[0] === 'dry_cleaning' && p.category === 'terzi')).length})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs" />
                      <span className="font-medium text-blue-600 dark:text-blue-400 font-bold">
                        {RADAR_CATEGORIES[selectedCategories[1]]?.label || '2. Sektör'} ({visibleCompetitors.filter(p => p.category === selectedCategories[1] || (selectedCategories[1] === 'restaurant' && p.category === 'donerci') || (selectedCategories[1] === 'dry_cleaning' && p.category === 'terzi')).length})
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-xs" />
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {categorySearchQuery
                        ? `Eşleşen İşletmeler (${visibleCompetitors.length})`
                        : selectedCategories.length === 1
                        ? `${RADAR_CATEGORIES[selectedCategories[0]]?.label || 'Mevcut'} (${visibleCompetitors.length})`
                        : `Mevcut Rakipler (${radarData?.competitors.length || 0})`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* C. SAĞ SÜTUN: DEMOGRAFİ & AI SKORU (~340px - lg:col-span-3)              */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-3.5 border-t lg:border-t-0 lg:border-l border-slate-200/70 dark:border-zinc-800/80 pt-4 lg:pt-0 lg:pl-5">
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              
              {/* 1. YAPAY ZEKA YATIRIM PUANI */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-slate-50 dark:to-zinc-900 border border-amber-500/30 space-y-2.5 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    AI Yatırım Puanı
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                      {radarData ? radarData.metrics.opportunityScore.toFixed(1) : '8.8'}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">/ 10</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/35 text-amber-900 dark:text-amber-200 text-center leading-tight max-w-[62%]">
                    {radarData?.metrics.opportunityLabel || 'Yüksek Ticari Potansiyel'}
                  </span>
                </div>
                
                {/* Pazar Doygunluk Çubuğu */}
                <div className="space-y-1 pt-1.5 border-t border-amber-500/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Pazar Doygunluğu</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      %{radarData?.metrics.saturationScore ?? 28}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        (radarData?.metrics.saturationScore ?? 28) < 40
                          ? "bg-emerald-500"
                          : (radarData?.metrics.saturationScore ?? 28) < 70
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      )}
                      style={{ width: `${Math.min(100, radarData?.metrics.saturationScore ?? 28)}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground leading-snug pt-0.5">
                    {radarData?.metrics.saturationLabel ?? 'Düşük Rekabet — Yüksek Büyüme Fırsatı'}
                  </p>
                </div>
              </div>

              {/* 3. BÖLGESEL DEMOGRAFİ VE TİCARİ ÇEVRE */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    Bölgesel Demografi
                  </span>
                </div>
                
                {/* 2 Temel Metrik: Hedef Kitle & Mevcut Rakipler */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-muted-foreground block font-medium">Hedef Kitle (Çember)</span>
                    <strong className="text-slate-900 dark:text-white text-xs sm:text-sm font-bold block mt-0.5">
                      {demographicStats.population} Kişi
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-muted-foreground block font-medium">Mevcut Rakipler</span>
                    <strong className="text-slate-900 dark:text-white text-xs sm:text-sm font-bold block mt-0.5">
                      {radarData?.competitors.length || 0} İşletme
                    </strong>
                  </div>
                </div>

                {/* Demografik Göstergeler Listesi */}
                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <div className="flex items-center justify-between py-0.5 border-b border-slate-100 dark:border-zinc-800/60">
                    <span className="text-[11px] text-muted-foreground font-medium">Gelir Seviyesi (SES):</span>
                    <span className="font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-900 dark:text-amber-300 text-[11px]">
                      {demographicStats.sesGroup}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-0.5 border-b border-slate-100 dark:border-zinc-800/60">
                    <span className="text-[11px] text-muted-foreground font-medium">Gündüz Sirkülasyonu:</span>
                    <strong className="text-slate-900 dark:text-white font-semibold text-xs">
                      {demographicStats.daytimeTraffic}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-0.5 border-b border-slate-100 dark:border-zinc-800/60">
                    <span className="text-[11px] text-muted-foreground font-medium">Resmi Mahalle (TÜİK):</span>
                    <strong className="text-slate-900 dark:text-white font-semibold text-xs">
                      {demographicStats.officialNeighborhoodPop}
                    </strong>
                  </div>

                  <div className="flex items-start justify-between py-0.5 gap-2">
                    <span className="text-[11px] text-muted-foreground font-medium shrink-0 pt-0.5">Kitle Profili:</span>
                    <strong className="text-slate-900 dark:text-white font-semibold text-xs text-right leading-snug">
                      {demographicStats.ageProfile}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. GİRİŞİM STRATEJİSİ & SEPET BEKLENTİSİ (Resim 2) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Girişim Stratejisi
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 truncate max-w-[55%]">
                    {radarData?.intelligence?.recommendedEntryStrategy?.split('(')[0]?.trim() || 'Sıfırdan Yeni Konsept Açılışı'}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11.5px] leading-relaxed">
                  {radarData?.intelligence?.strategyRationale || 'Bölgede ciddi arz açığı bulunduğundan ilk giren güçlü marka olma avantajıyla pazar payının %40+\'ını hızla konsolide edebilirsiniz.'}
                </p>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <span className="text-muted-foreground font-medium">Tahmini Sepet:</span>
                  <strong className="text-slate-900 dark:text-white font-bold text-xs">
                    {radarData?.intelligence?.estimatedTicketSize || '180₺ – 300₺ / Kişi (Dengeli Fiyat-Performans)'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Rapor İncele Butonu */}
            <div className="pt-1">
              <Link
                href={`/radar?lat=${centerLat}&lng=${centerLng}&radius=${radiusMeters}&category=${selectedCategories.join(',') || 'all'}${activeLocationTitle ? `&title=${encodeURIComponent(activeLocationTitle)}` : ''}${categorySearchQuery ? `&q=${encodeURIComponent(categorySearchQuery)}` : ''}`}
                className={cn(
                  "w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs sm:text-sm font-bold text-slate-950 text-center flex items-center justify-center gap-2 transition-all shadow-sm shadow-amber-500/20 hover:shadow-md",
                  isReportBtnPulsing && "animate-pulse ring-4 ring-amber-400/80 shadow-lg shadow-amber-500/50 scale-[1.02]"
                )}
              >
                <span>Detaylı İstihbarat Raporunu Aç</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
export default HomeInvestmentRadarSection;
