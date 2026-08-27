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

interface ListingFiltersProps {
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

  const availablePositions = useMemo(() => {
    return getAvailablePositions(filters.sector);
  }, [filters.sector]);

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
          {/* 1. Uzmanlık Sektörü / Sektör (A-Z) - BAŞTA! */}
          <div className="w-[180px] sm:w-[210px]">
            <Select
              value={filters.sector ?? ALL_VALUE}
              onValueChange={(val) => {
                const newSector = val === ALL_VALUE ? undefined : val;
                const validPositions = getAvailablePositions(newSector);
                const nextPosition =
                  filters.position && validPositions.includes(filters.position)
                    ? filters.position
                    : undefined;

                onChange({
                  sector: newSector,
                  position: nextPosition,
                });
              }}
            >
              <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder="Sektör seçin" />
              </SelectTrigger>
              <SelectContent themeColor={themeColor}>
                <SelectItem value={ALL_VALUE}>Sektör seçin</SelectItem>
                {CAREER_SECTORS.map((sec) => (
                  <SelectItem key={sec} value={sec}>
                    {sec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Aranan Pozisyon / Açık Pozisyon (Sektöre göre dinamik A-Z) */}
          <div className="w-[180px] sm:w-[210px]">
            <Select
              value={filters.position ?? ALL_VALUE}
              onValueChange={(val) => onChange({ position: val === ALL_VALUE ? undefined : val })}
            >
              <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder="Pozisyon seçin" />
              </SelectTrigger>
              <SelectContent themeColor={themeColor}>
                <SelectItem value={ALL_VALUE}>Pozisyon seçin</SelectItem>
                {availablePositions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Kariyer Seviyesi / Çalışma Şekli (A-Z) */}
          <div className="w-[180px] sm:w-[210px]">
            <Select
              value={filters.careerLevel ?? ALL_VALUE}
              onValueChange={(val) => onChange({ careerLevel: val === ALL_VALUE ? undefined : val })}
            >
              <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder={isSeek ? 'Deneyim seviyesi seçin' : 'Çalışma şekli seçin'} />
              </SelectTrigger>
              <SelectContent themeColor={themeColor}>
                <SelectItem value={ALL_VALUE}>
                  {isSeek ? 'Deneyim seviyesi seçin' : 'Çalışma şekli seçin'}
                </SelectItem>
                {(isSeek ? CAREER_SEEK_LEVELS : CAREER_HIRE_WORK_MODES).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
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
            {MARKETPLACE_CITY_OPTIONS.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
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
