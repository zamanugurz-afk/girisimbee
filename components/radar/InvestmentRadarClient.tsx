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
  Store,
  Navigation,
  Loader2,
  X,
  FileText,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Target
} from 'lucide-react';
import type {
  RadarCategoryKey,
  RadarSpatialResponse,
} from '@/types/radar.types';
import {
  RADAR_CATEGORIES,
  RADAR_DEFAULT_CENTER,
  RADAR_DEFAULT_RADIUS_METERS,
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
      <div className="flex h-full min-h-[460px] lg:min-h-[520px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-100/70 dark:border-zinc-800 dark:bg-zinc-900/50">
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

interface LocationSearchResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city?: string;
  district?: string;
}

// Popular Turkish District Index for sub-millisecond instant search
const TURKEY_POPULAR_DISTRICTS: LocationSearchResult[] = [
  { id: 'ist-kartal-cevizli', name: 'İstanbul, Kartal — Cevizli Mah.', lat: 40.9125, lng: 29.1764, city: 'İstanbul', district: 'Kartal' },
  { id: 'ist-maltepe-cevizli', name: 'İstanbul, Maltepe — Cevizli Mah.', lat: 40.9198, lng: 29.1523, city: 'İstanbul', district: 'Maltepe' },
  { id: 'ist-kadikoy-moda', name: 'İstanbul, Kadıköy — Moda / Caferağa', lat: 40.9875, lng: 29.0289, city: 'İstanbul', district: 'Kadıköy' },
  { id: 'ist-besiktas-carsi', name: 'İstanbul, Beşiktaş — Çarşı / Sinanpaşa', lat: 41.0428, lng: 29.0069, city: 'İstanbul', district: 'Beşiktaş' },
  { id: 'ist-sisli-nisantasi', name: 'İstanbul, Şişli — Nişantaşı / Teşvikiye', lat: 41.0531, lng: 28.9928, city: 'İstanbul', district: 'Şişli' },
  { id: 'ist-atasehir-batin', name: 'İstanbul, Ataşehir — Batı Ataşehir', lat: 40.9923, lng: 29.1147, city: 'İstanbul', district: 'Ataşehir' },
  { id: 'ist-uskudar-merkez', name: 'İstanbul, Üsküdar — Merkez / Mimar Sinan', lat: 41.0267, lng: 29.0167, city: 'İstanbul', district: 'Üsküdar' },
  { id: 'ist-bakirkoy-atakoy', name: 'İstanbul, Bakırköy — Ataköy', lat: 40.9821, lng: 28.8712, city: 'İstanbul', district: 'Bakırköy' },
  { id: 'ank-cankaya-tunali', name: 'Ankara, Çankaya — Tunalı Hilmi / Kavaklıdere', lat: 39.9022, lng: 32.8601, city: 'Ankara', district: 'Çankaya' },
  { id: 'ank-cankaya-bahceli', name: 'Ankara, Çankaya — Bahçelievler / 7. Cadde', lat: 39.9214, lng: 32.8236, city: 'Ankara', district: 'Çankaya' },
  { id: 'ank-yenimahalle-batikent', name: 'Ankara, Yenimahalle — Batıkent', lat: 39.9678, lng: 32.7321, city: 'Ankara', district: 'Yenimahalle' },
  { id: 'izm-karsiyaka-carsi', name: 'İzmir, Karşıyaka — Çarşı / Bostanlı', lat: 38.4593, lng: 27.1124, city: 'İzmir', district: 'Karşıyaka' },
  { id: 'izm-konak-alsancak', name: 'İzmir, Konak — Alsancak / Kordon', lat: 38.4382, lng: 27.1436, city: 'İzmir', district: 'Konak' },
  { id: 'izm-bornova-kucukpark', name: 'İzmir, Bornova — Küçükpark', lat: 38.4632, lng: 27.2189, city: 'İzmir', district: 'Bornova' },
  { id: 'bur-nilufer-ozluce', name: 'Bursa, Nilüfer — Özlüce / Ertuğrul', lat: 40.2198, lng: 28.9189, city: 'Bursa', district: 'Nilüfer' },
  { id: 'ant-muratpasa-lara', name: 'Antalya, Muratpaşa — Lara / Şirinyalı', lat: 36.8584, lng: 30.7588, city: 'Antalya', district: 'Muratpaşa' },
  { id: 'ant-konyaalti-liman', name: 'Antalya, Konyaaltı — Liman / Sahil', lat: 36.8341, lng: 30.6012, city: 'Antalya', district: 'Konyaaltı' },
  { id: 'esk-tepebasi-baglar', name: 'Eskişehir, Tepebaşı — Bağlar / Üniversite Cad.', lat: 39.7824, lng: 30.5098, city: 'Eskişehir', district: 'Tepebaşı' },
  { id: 'koc-izmit-yahyakaptan', name: 'Kocaeli, İzmit — Yahya Kaptan', lat: 40.7654, lng: 29.9682, city: 'Kocaeli', district: 'İzmit' },
];

const CLIENT_RADAR_CACHE = new Map<string, RadarSpatialResponse>();

export function InvestmentRadarClient() {
  const [selectedCategory, setSelectedCategory] = useState<RadarCategoryKey>('all');
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

  // Report tab view (Overview vs Detailed Strategy)
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy'>('overview');

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
  }, [selectedCategory, centerLat, centerLng, radiusMeters]);

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

  // Read URL search params or auto-detect IP / GPS location on mount
  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLat = params.get('lat');
      const urlLng = params.get('lng');
      const urlCategory = params.get('category') as RadarCategoryKey | null;

      if (urlLat && urlLng) {
        const parsedLat = parseFloat(urlLat);
        const parsedLng = parseFloat(urlLng);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          setCenterLat(parsedLat);
          setCenterLng(parsedLng);
        }
      } else if ('geolocation' in navigator) {
        // Auto Geolocation: GPS first, then IP fallback
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!isMounted) return;
            setCenterLat(pos.coords.latitude);
            setCenterLng(pos.coords.longitude);
            setZoom(15);
            setActiveLocationTitle('Mevcut Konumunuz');
          },
          async () => {
            if (!isMounted) return;
            await fetchIpLocation();
          },
          { timeout: 3500, maximumAge: 60000 },
        );
      } else {
        fetchIpLocation();
      }

      if (urlCategory && RADAR_CATEGORIES[urlCategory]) {
        setSelectedCategory(urlCategory);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Live Location Search (Nominatim + Turkish index)
  useEffect(() => {
    if (!locationSearchQuery.trim()) {
      setLocationSearchResults([]);
      setIsSearchingLocation(false);
      return;
    }

    if (locationSearchDebounceRef.current) {
      clearTimeout(locationSearchDebounceRef.current);
    }

    const q = locationSearchQuery.toLowerCase().trim();

    // Instant local match
    const localMatches = TURKEY_POPULAR_DISTRICTS.filter((loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.city?.toLowerCase().includes(q) ||
      loc.district?.toLowerCase().includes(q),
    );

    setLocationSearchResults(localMatches);
    setIsSearchingLocation(true);

    // Online Nominatim query
    locationSearchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=tr&limit=5&q=${encodeURIComponent(
            q + ' türkiye',
          )}`,
          { headers: { 'Accept-Language': 'tr' } },
        );
        if (res.ok) {
          const data = await res.json();
          const onlineResults: LocationSearchResult[] = data.map((item: any) => ({
            id: `nom-${item.place_id}`,
            name: item.display_name.split(',').slice(0, 3).join(', '),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }));

          const combined = [...localMatches];
          for (const item of onlineResults) {
            if (!combined.some((c) => Math.abs(c.lat - item.lat) < 0.005 && Math.abs(c.lng - item.lng) < 0.005)) {
              combined.push(item);
            }
          }
          setLocationSearchResults(combined);
        }
      } catch (err) {
        console.error('[location-search] error:', err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 350);

    return () => {
      if (locationSearchDebounceRef.current) clearTimeout(locationSearchDebounceRef.current);
    };
  }, [locationSearchQuery]);

  // Fetch Spatial Data
  const fetchSpatialData = useCallback(
    async (lat: number, lng: number, radius: number, category: RadarCategoryKey, locName?: string) => {
      const roundedLat = Math.round(lat * 1000) / 1000;
      const roundedLng = Math.round(lng * 1000) / 1000;
      const cacheKey = `${roundedLat}-${roundedLng}-${radius}-${category}`;

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
          CLIENT_RADAR_CACHE.set(cacheKey, json.data);
          setRadarData(json.data);
        } else {
          throw new Error(json.error || 'Veri alınamadı');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('[radar-page] Fetch error:', err);
          setError(err.message || 'Mekânsal analiz yüklenemedi.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchSpatialData(
      centerLat,
      centerLng,
      radiusMeters,
      selectedCategory,
      activeLocationTitle,
    );
  }, [centerLat, centerLng, radiusMeters, selectedCategory, activeLocationTitle, fetchSpatialData]);

  // Handle Location Select
  const handleSelectLocationResult = (loc: LocationSearchResult) => {
    setCenterLat(loc.lat);
    setCenterLng(loc.lng);
    setZoom(15);
    setActiveLocationTitle(loc.name);
    setLocationSearchQuery('');
    setIsLocationDropdownOpen(false);
  };

  // Handle GPS / IP Locate Me
  const handleFindMyLocation = async () => {
    setIsLocatingUser(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenterLat(pos.coords.latitude);
          setCenterLng(pos.coords.longitude);
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

  // Handle Map circle click / drag
  const handleCircleChanged = (lat: number, lng: number, radius: number) => {
    setCenterLat(lat);
    setCenterLng(lng);
    setRadiusMeters(radius);

    const closest = TURKEY_POPULAR_DISTRICTS.find(
      (d) => Math.abs(d.lat - lat) < 0.02 && Math.abs(d.lng - lng) < 0.02,
    );
    if (closest) {
      setActiveLocationTitle(closest.name);
    } else {
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
      const q = categorySearchQuery.toLowerCase().trim();
      return allCategories.filter((c) =>
        c.label.toLowerCase().includes(q) ||
        c.searchKeywords?.some((k) => k.toLowerCase().includes(q)),
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

  const totalAreaBusinesses = useMemo(() => {
    if (radarData?.availableSectors) {
      const sum = Object.values(radarData.availableSectors).reduce((a, b) => a + b, 0);
      if (sum > 0) return sum;
    }
    return radarData?.competitors.length ?? 0;
  }, [radarData]);

  const activeCategoryMeta = selectedCategory === 'all'
    ? { key: 'all' as RadarCategoryKey, label: 'Tüm Sektörler & İşletmeler', emoji: '🌐', accent: 'amber' }
    : (RADAR_CATEGORIES[selectedCategory] || RADAR_CATEGORIES.cafe);

  // Real-time demographic calculation based on exact coordinates and radius
  const demographicStats = useMemo(() => {
    return resolveDemographicProfile(centerLat, centerLng, radiusMeters, activeLocationTitle);
  }, [radiusMeters, activeLocationTitle, centerLat, centerLng]);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      {/* 1. ÜST BAŞLIK VE KONTROL BUTONLARI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Radar className="w-7 h-7 text-amber-500" />
            <span>Yatırım ve Lokasyon Radarı</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            İş kolunuzu seçin, haritada dilediğiniz alanı çemberle tarayın. Bölgenin demografik yapısını, rakip yoğunluğunu ve aktif devir & ortaklık fırsatlarını anlık analiz edin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/ilan/olustur"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs sm:text-sm font-bold text-slate-950 shadow-sm shadow-amber-500/20 transition-all"
          >
            <span>Bu Bölgede İlan Ver</span>
          </Link>
        </div>
      </div>

      {/* 2. TEK SAYFA BİRLEŞİK KOKPİT (3 ENTEGRE SÜTUN) */}
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
                    placeholder="Adres, ilçe veya mahalle ara (örn: Cevizli)..."
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
                </div>

                {/* Canlı Lokasyon Arama Sonuçları Açılır Paneli */}
                {isLocationDropdownOpen && (
                  <div className="absolute left-0 right-0 top-[46px] z-50 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
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
                        Sonuç bulunamadı. Farklı bir ilçe/mahalle deneyin.
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                          Popüler Lokasyonlar
                        </p>
                        {TURKEY_POPULAR_DISTRICTS.slice(0, 5).map((loc) => (
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

              {/* Dikey İş Kolları Listesi */}
              <div className="h-[480px] lg:h-[530px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-800">
                {/* 1. TÜM İŞLETMELER SEÇENEĞİ */}
                {!categorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={cn(
                      'w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 group border',
                      selectedCategory === 'all'
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
                      {selectedCategory === 'all' && (
                        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </div>
                  </button>
                )}

                {displayedCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  const sectorCount = radarData?.availableSectors?.[cat.key] ?? (isSelected ? (radarData?.competitors.length ?? 0) : 0);
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
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{cat.emoji}</span>
                        <span className="text-xs truncate">{cat.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {sectorCount > 0 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            {sectorCount}
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold text-muted-foreground bg-slate-100 dark:bg-zinc-800">
                            0
                          </span>
                        )}
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}

                {displayedCategories.length === 0 && (
                  <div className="p-3 text-center rounded-xl bg-slate-50 dark:bg-zinc-800/30 text-xs text-muted-foreground">
                    Bu çember alanında kayıtlı sektör bulunamadı. &ldquo;Tümü&rdquo; butonuna tıklayarak istediğiniz sektörü seçebilirsiniz.
                  </div>
                )}
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
            {/* Harita Üst Barı: Başlık & Açıklama */}
            <div className="pb-1">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                Lokasyon Radarı
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
                İş kolunuzu seçin, çemberle tarayın. Demografi, rakip yoğunluğu ve aktif devir & ortaklık fırsatlarını anlık analiz edin.
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

            {/* Harita Alt Barı: Yarıçap Seçimi & Lejant */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Yarıçap Seçici */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Yarıçap:</span>
                <div className="inline-flex rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-800/80 p-0.5">
                  {RADIUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRadiusMeters(opt.value)}
                      className={cn(
                        'px-2.5 py-1 text-xs font-bold rounded-md transition-all',
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

              {/* Lejant (Pin Açıklamaları) */}
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs animate-pulse" />
                  <span className="font-medium text-slate-700 dark:text-zinc-300">
                    Devir & Ortaklık ({radarData?.listingsInRadius.length || 0})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                  <span className="font-medium text-slate-700 dark:text-zinc-300">
                    Mevcut Rakipler ({radarData?.competitors.length || 0})
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground/80 hidden sm:inline">© OpenStreetMap</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* C. SAĞ SÜTUN: DEMOGRAFİ & AI SKORU (~340px - lg:col-span-3)              */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-3.5 border-t lg:border-t-0 lg:border-l border-slate-200/70 dark:border-zinc-800/80 pt-4 lg:pt-0 lg:pl-5">
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              
              {/* Sekme Butonları (Tabs) */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={cn(
                    'flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all',
                    activeTab === 'overview'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Genel Bakış
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('strategy')}
                  className={cn(
                    'flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1',
                    activeTab === 'strategy'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Fırsat Avcısı & Strateji</span>
                </button>
              </div>

              {activeTab === 'overview' ? (
                <>
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

                  {/* 2. BÖLGESEL DEMOGRAFİ VE TİCARİ ÇEVRE */}
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

                  {/* 3. TÜİK BİLGİLENDİRME ŞERİDİ (BOŞ ALANDA) */}
                  <div className="flex items-center justify-center py-1.5 px-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-center">
                    <span className="text-[11px] font-medium text-amber-900 dark:text-amber-300">
                      Demografi verileri <strong>TÜİK</strong> resmi kayıtları ile modellenmiştir.
                    </span>
                  </div>
                </>
              ) : (
                /* AI STRATEJİ & FIRSAT AVCISI RAPORU SEKME GÖRÜNÜMÜ */
                <div className="space-y-2.5 text-xs">
                  {radarData?.intelligence ? (
                    <>
                      {/* 1. STRATEJİK BÖLGE DEĞERLENDİRMESİ */}
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-500/35 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                            Stratejik Bölge Değerlendirmesi
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-zinc-200 text-xs sm:text-[12.5px] leading-relaxed font-medium">
                          {radarData.intelligence.summaryAdvice}
                        </p>
                      </div>

                      {/* 2. TESPİT EDİLEN PAZAR AÇIĞI */}
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                              Tespit Edilen Pazar Açığı
                            </span>
                          </div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shrink-0">
                            %{radarData.intelligence.marketGapScore || 72} Fırsat Açığı
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                          {radarData.intelligence.marketGapSummary}
                        </p>
                      </div>

                      {/* 3. BÖLGEYE ÖZEL EKSİK KONSEPTLER (FIRSAT AVCISI) */}
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            Eksik Konseptler (Ne Yapılabilir?)
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {radarData.intelligence.missingConcepts?.map((concept, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1"
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <strong className="text-slate-900 dark:text-white font-bold text-[11.5px] leading-tight">
                                  {concept.title}
                                </strong>
                                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25 shrink-0">
                                  {concept.tag}
                                </span>
                              </div>
                              <p className="text-muted-foreground text-[11px] leading-snug">
                                {concept.description}
                              </p>
                              <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-600 dark:text-zinc-400 border-t border-slate-200/50 dark:border-zinc-700/50">
                                <span className="truncate max-w-[70%]">🎯 {concept.targetAudience}</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">%{concept.suitabilityScore} Uyum</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. GİRİŞİM STRATEJİSİ & SEPET BEKLENTİSİ */}
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Girişim Stratejisi
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 truncate max-w-[55%]">
                            {radarData.intelligence.recommendedEntryStrategy.split('(')[0].trim()}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-snug">
                          {radarData.intelligence.strategyRationale}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800 text-[11px]">
                          <span className="text-muted-foreground font-medium">Tahmini Sepet:</span>
                          <strong className="text-slate-900 dark:text-white font-bold text-xs">
                            {radarData.intelligence.estimatedTicketSize}
                          </strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground text-xs">
                      Fırsat Avcısı strateji raporu hesaplanıyor...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Alt Eylem Butonu */}
            <div className="pt-1">
              <Link
                href="/ilan/olustur"
                className={cn(
                  "w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs sm:text-sm font-bold text-slate-950 text-center flex items-center justify-center gap-2 transition-all shadow-sm shadow-amber-500/20 hover:shadow-md",
                  isReportBtnPulsing && "animate-pulse ring-4 ring-amber-400/80 shadow-lg shadow-amber-500/50 scale-[1.02]"
                )}
              >
                <span>Bu Bölgede Yeni İlan Oluştur</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
export default InvestmentRadarClient;