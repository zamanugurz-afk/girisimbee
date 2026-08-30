'use client';

import { useState } from 'react';
import {
  Coffee,
  Dog,
  Scissors,
  Dumbbell,
  UtensilsCrossed,
  Car,
  Utensils,
  ShoppingBag,
  Cross,
  Flame,
  Shirt,
  Sparkles,
  MapPin,
  CircleDot,
  Trash2,
  Sliders,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  RADAR_CATEGORIES,
  QUICK_LOCATION_PRESETS,
} from '@/features/radar/config/radar.config';
import type { QuickLocationPreset, RadarCategoryKey } from '@/types/radar.types';
import { cn } from '@/lib/utils';

interface RadarControlBarProps {
  selectedCategory: RadarCategoryKey;
  onSelectCategory: (cat: RadarCategoryKey) => void;
  radiusMeters: number;
  onChangeRadius: (r: number) => void;
  selectedLocation: QuickLocationPreset | null;
  onSelectLocation: (loc: QuickLocationPreset) => void;
  onStartDrawCircle: () => void;
  onStartDrawPolygon: () => void;
  onClearDrawing: () => void;
  isDrawingActive: boolean;
  isLoading: boolean;
  competitorCount: number;
  listingsCount: number;
}

const CATEGORY_ICONS: Record<RadarCategoryKey, React.ComponentType<{ className?: string }>> = {
  cafe: Coffee,
  pet_shop: Dog,
  butcher: Flame,
  bakery: UtensilsCrossed,
  market: ShoppingBag,
  hairdresser: Scissors,
  gym: Dumbbell,
  pharmacy: Cross,
  car_wash: Car,
  restaurant: Utensils,
  boutique: Shirt,
  dry_cleaning: Sparkles,
};

export function RadarControlBar({
  selectedCategory,
  onSelectCategory,
  radiusMeters,
  onChangeRadius,
  selectedLocation,
  onSelectLocation,
  onStartDrawCircle,
  onStartDrawPolygon,
  onClearDrawing,
  isDrawingActive,
  isLoading,
  competitorCount,
  listingsCount,
}: RadarControlBarProps) {
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-md backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
      {/* Row 1: Location Preset Picker + Drawing Tools + Live Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Location Selector */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-xl border-slate-200 bg-white text-xs font-semibold shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                <MapPin className="h-3.5 w-3.5 text-rose-500" />
                <span className="font-bold text-foreground">
                  {selectedLocation ? selectedLocation.name : 'Konum Seçin'}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-xl">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Popüler Yatırım Odakları
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {QUICK_LOCATION_PRESETS.map((loc) => (
                <DropdownMenuItem
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className="flex flex-col items-start gap-0.5 cursor-pointer py-2"
                >
                  <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    {loc.name}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground">
                    {loc.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Radius Quick Selector */}
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRadiusSlider((prev) => !prev)}
              className="h-9 gap-1.5 rounded-xl border-slate-200 bg-white text-xs font-semibold shadow-2xs dark:border-zinc-700 dark:bg-zinc-800"
            >
              <Sliders className="h-3.5 w-3.5 text-indigo-500" />
              <span>{radiusMeters}m Yarıçap</span>
            </Button>

            {showRadiusSlider && (
              <div className="absolute left-0 top-11 z-50 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between text-xs font-bold text-foreground mb-2">
                  <span>Çember Yarıçapı</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                    {radiusMeters}m
                  </span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="2000"
                  step="50"
                  value={radiusMeters}
                  onChange={(e) => onChangeRadius(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-zinc-700"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                  <span>150m (Mahalle)</span>
                  <span>1km (Semt)</span>
                  <span>2km</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Map Action Tools */}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            onClick={onStartDrawCircle}
            className={cn(
              'h-9 gap-1.5 rounded-xl text-xs font-bold shadow-2xs transition-all',
              isDrawingActive
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 ring-2 ring-indigo-500/40 ring-offset-1'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
            )}
          >
            <CircleDot className="h-3.5 w-3.5" />
            <span>{isDrawingActive ? 'Çember Çiziliyor...' : 'Çember Çiz'}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onStartDrawPolygon}
            className="h-9 gap-1.5 rounded-xl border-slate-200 bg-white text-xs font-semibold shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800"
            title="Serbest Poligon Alanı Çiz"
          >
            <Layers className="h-3.5 w-3.5 text-slate-600 dark:text-zinc-400" />
            <span className="hidden sm:inline">Poligon Seç</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClearDrawing}
            className="h-9 w-9 p-0 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Çizimi Temizle"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Row 2: Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 scrollbar-none">
        {Object.values(RADAR_CATEGORIES).map((cat) => {
          const isSelected = selectedCategory === cat.key;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              className={cn(
                'group flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 select-none',
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-zinc-950'
                  : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700',
              )}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              {isSelected && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
