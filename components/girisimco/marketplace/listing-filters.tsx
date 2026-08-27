'use client';

import { useMemo } from 'react';
import type { MarketplaceFilterState } from '@/features/listings/types/marketplace.types';
import {
  LISTING_SORT_OPTIONS,
  MARKETPLACE_CITY_OPTIONS,
  getUserDiscoverableCategorySlugs,
  resolveCategorySlug,
} from '@/features/listings/config/marketplace.config';
import {
  getAllTaxonomyPositions,
  getPositionsForSector,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';
import { JobFlowFilters } from '@/components/girisimco/marketplace/job-flow-filters';
import { PartnershipFlowFilters } from '@/components/girisimco/marketplace/partnership-flow-filters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ALL_VALUE = '__all__';

function getAvailablePositions(sector?: string): string[] {
  const raw = sector ? getPositionsForSector(sector) : getAllTaxonomyPositions();
  return raw
    .filter((p) => !p.includes('Diğer') && !p.includes('Kendim'))
    .sort((a, b) => a.localeCompare(b, 'tr-TR'));
}

const CAREER_SECTORS = [...JOB_SECTOR_OPTIONS]
  .filter((s) => !s.includes('Diğer'))
  .sort((a, b) => a.localeCompare(b, 'tr-TR'));

const CAREER_SEEK_LEVELS = [
  'Başlangıç Seviyesi (0-1 Yıl)',
  'Direktör / Üst Düzey Yönetici',
  'Giriş Seviyesi',
  'Junior (1-2 Yıl)',
  'Kıdemli / Senior (5+ Yıl)',
  'Mid (2-4 Yıl)',
  'Orta Düzey Yönetici',
  'Stajyer',
  'Takım Lideri',
  'Uzman (3-5 Yıl)',
  'Yeni Mezun',
  'Yönetici',
].sort((a, b) => a.localeCompare(b, 'tr-TR'));

const CAREER_HIRE_WORK_MODES = [
  'Dönemsel / Proje Bazlı',
  'Hibrit',
  'Stajyer',
  'Tam Zamanlı',
  'Uzaktan (Remote)',
  'Yarı Zamanlı',
].sort((a, b) => a.localeCompare(b, 'tr-TR'));

interface CountOption {
  value: string;
  count: number;
}

function getOptionsByCount(
  items: ContentItem[],
  extractor: (item: ContentItem) => string | undefined,
): CountOption[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const val = extractor(item)?.trim();
    if (val && !val.includes('Diğer') && !val.includes('Kendim') && val !== 'Türkiye') {
      map.set(val, (map.get(val) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'tr-TR'));
}

interface ListingFiltersProps {
  items?: ContentItem[];
  filters: MarketplaceFilterState;
  onChange: (patch: Partial<MarketplaceFilterState>) => void;
  /** Hide category picker when on a category page */
  hideCategory?: boolean;
  /** Show İşe Alıyorum / İş Arıyorum chips (unified /is feed). */
  showJobFlowFilters?: boolean;
  /** Show Ortak Arıyorum / Ortak Olmak İstiyorum / İşletme Devri chips. */
  showVentureFlowFilters?: boolean;
  className?: string;
}

export function ListingFilters({
  items = [],
  filters,
  onChange,
  hideCategory = false,
  showJobFlowFilters = false,
  showVentureFlowFilters = false,
  className,
}: ListingFiltersProps) {
  const isCareer = Boolean(
    filters.jobFlow ||
      filters.categorySlug === 'ise-al' ||
      filters.categorySlug === 'is-ariyorum' ||
      filters.categorySlug === 'is-bul',
  );
  const isSeek = filters.jobFlow === 'seek' || filters.categorySlug === 'is-ariyorum' || filters.categorySlug === 'is-bul';
  const themeColor = isCareer ? (isSeek ? 'sky' : 'emerald') : 'blue';

  // 1. Sektörler: YALNIZCA var olan ilanlardaki sektörler, ilan sayısına göre azalan sırada
  const availableSectors = useMemo(() => {
    return getOptionsByCount(items, (item) => item.sector);
  }, [items]);

  // 2. Pozisyonlar: Seçilen sektöre göre var olan ilanlardaki pozisyonlar, ilan sayısına göre azalan sırada
  const availablePositions = useMemo(() => {
    const filteredItems = filters.sector
      ? items.filter((item) => item.sector?.toLowerCase() === filters.sector?.toLowerCase())
      : items;

    return getOptionsByCount(filteredItems, (item) => item.position || (isSeek ? item.title : undefined));
  }, [items, filters.sector, isSeek]);

  // 3. Deneyim Seviyeleri: Seçilen sektör ve pozisyona göre var olan ilanlardaki deneyimler
  const availableLevels = useMemo(() => {
    const filteredItems = items.filter((item) => {
      if (filters.sector && item.sector?.toLowerCase() !== filters.sector.toLowerCase()) return false;
      if (filters.position && (item.position || item.title)?.toLowerCase() !== filters.position.toLowerCase()) return false;
      return true;
    });

    return getOptionsByCount(filteredItems, (item) => item.experienceLevel);
  }, [items, filters.sector, filters.position]);

  // 4. Şehirler: Seçilen kriterlere göre var olan ilanlardaki şehirler
  const availableCities = useMemo(() => {
    const filteredItems = items.filter((item) => {
      if (filters.sector && item.sector?.toLowerCase() !== filters.sector.toLowerCase()) return false;
      if (filters.position && (item.position || item.title)?.toLowerCase() !== filters.position.toLowerCase()) return false;
      if (filters.careerLevel && item.experienceLevel?.toLowerCase() !== filters.careerLevel.toLowerCase()) return false;
      return true;
    });

    return getOptionsByCount(filteredItems, (item) => item.city || item.location?.split(',')[0]?.trim());
  }, [items, filters.sector, filters.position, filters.careerLevel]);

  return (
    <div className={cn('flex flex-wrap items-center gap-2.5', className)}>
      {showJobFlowFilters ? (
        <JobFlowFilters
          value={filters.jobFlow}
          onChange={(jobFlow) => onChange({ jobFlow })}
        />
      ) : null}

      {showVentureFlowFilters ? (
        <PartnershipFlowFilters
          categorySlug={filters.categorySlug}
          partnershipIntent={filters.partnershipIntent}
          onChange={(patch) => onChange(patch)}
        />
      ) : null}

      {isCareer ? (
        <>
          {/* 1. Uzmanlık Sektörü / Sektör (İlan sayısına göre azalan) - BAŞTA! */}
          <div className="w-[180px] sm:w-[210px]">
            <Select
              value={filters.sector ?? ALL_VALUE}
              onValueChange={(val) => {
                const newSector = val === ALL_VALUE ? undefined : val;
                const filteredForNewSector = newSector
                  ? items.filter((item) => item.sector?.toLowerCase() === newSector.toLowerCase())
                  : items;
                const validPositions = getOptionsByCount(
                  filteredForNewSector,
                  (item) => item.position || (isSeek ? item.title : undefined),
                );
                const isPosValid =
                  filters.position && validPositions.some((p) => p.value === filters.position);

                onChange({
                  sector: newSector,
                  position: isPosValid ? filters.position : undefined,
                  careerLevel: undefined,
                  city: undefined,
                });
              }}
            >
              <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder="Sektör seçin" />
              </SelectTrigger>
              <SelectContent themeColor={themeColor}>
                <SelectItem value={ALL_VALUE}>Sektör seçin</SelectItem>
                {availableSectors.map((sec) => (
                  <SelectItem key={sec.value} value={sec.value}>
                    {sec.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Aranan Pozisyon / Açık Pozisyon (Sektöre göre dinamik, ilan sayısına göre azalan) */}
          <div className="w-[180px] sm:w-[210px]">
            <Select
              value={filters.position ?? ALL_VALUE}
              onValueChange={(val) =>
                onChange({
                  position: val === ALL_VALUE ? undefined : val,
                  careerLevel: undefined,
                  city: undefined,
                })
              }
            >
              <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder="Pozisyon seçin" />
              </SelectTrigger>
              <SelectContent themeColor={themeColor}>
                <SelectItem value={ALL_VALUE}>Pozisyon seçin</SelectItem>
                {availablePositions.map((pos) => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Kariyer Seviyesi / Çalışma Şekli (Dinamik, ilan sayısına göre azalan) */}
          <div className="w-[180px] sm:w-[210px]">
            <Select
              value={filters.careerLevel ?? ALL_VALUE}
              onValueChange={(val) =>
                onChange({
                  careerLevel: val === ALL_VALUE ? undefined : val,
                  city: undefined,
                })
              }
            >
              <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder={isSeek ? 'Deneyim seviyesi seçin' : 'Çalışma şekli seçin'} />
              </SelectTrigger>
              <SelectContent themeColor={themeColor}>
                <SelectItem value={ALL_VALUE}>
                  {isSeek ? 'Deneyim seviyesi seçin' : 'Çalışma şekli seçin'}
                </SelectItem>
                {availableLevels.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : null}

      {!hideCategory && !isCareer && (
        <div className="w-[180px] sm:w-[210px]">
          <Select
            value={filters.categorySlug ?? ALL_VALUE}
            onValueChange={(val) => onChange({ categorySlug: val === ALL_VALUE ? undefined : val })}
          >
            <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent themeColor={themeColor}>
              <SelectItem value={ALL_VALUE}>Kategori seçin</SelectItem>
              {getUserDiscoverableCategorySlugs().map((slug) => {
                const meta = resolveCategorySlug(slug);
                return (
                  <SelectItem key={slug} value={slug}>
                    {meta?.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 4. Şehir */}
      <div className="w-[150px] sm:w-[170px]">
        <Select
          value={filters.city ?? ALL_VALUE}
          onValueChange={(val) => onChange({ city: val === ALL_VALUE ? undefined : val })}
        >
          <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
            <SelectValue placeholder="Şehir seçin" />
          </SelectTrigger>
          <SelectContent themeColor={themeColor}>
            <SelectItem value={ALL_VALUE}>Şehir seçin</SelectItem>
            {availableCities.map((city) => (
              <SelectItem key={city.value} value={city.value}>
                {city.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 5. Sıralama */}
      <div className="w-[150px] sm:w-[170px]">
        <Select
          value={filters.sortBy ?? 'newest'}
          onValueChange={(val) => onChange({ sortBy: val as MarketplaceFilterState['sortBy'] })}
        >
          <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
            <SelectValue placeholder="Sıralama seçin" />
          </SelectTrigger>
          <SelectContent themeColor={themeColor}>
            {LISTING_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
