'use client';

import type { MarketplaceFilterState } from '@/features/listings/types/marketplace.types';
import {
  LISTING_SORT_OPTIONS,
  MARKETPLACE_CITY_OPTIONS,
  getUserDiscoverableCategorySlugs,
  resolveCategorySlug,
} from '@/features/listings/config/marketplace.config';
import { getAllTaxonomyPositions } from '@/features/candidates/taxonomy/career-taxonomy';
import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';
import { JobFlowFilters } from '@/components/girisimco/marketplace/job-flow-filters';
import { PartnershipFlowFilters } from '@/components/girisimco/marketplace/partnership-flow-filters';
import { cn } from '@/lib/utils';

const CAREER_POSITIONS = getAllTaxonomyPositions()
  .filter((p) => !p.includes('Diğer'))
  .sort((a, b) => a.localeCompare(b, 'tr-TR'));

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
          {/* 1. Aranan Pozisyon / Açık Pozisyon (A-Z) */}
          <select
            value={filters.query ?? ''}
            onChange={(e) => onChange({ query: e.target.value || undefined })}
            className="h-10 rounded-lg border border-[#E6E8EE] bg-white px-3 text-sm text-[#0B1220] dark:border-border dark:bg-card dark:text-foreground max-w-[200px]"
            aria-label={isSeek ? 'Aranan Pozisyon' : 'Açık Pozisyon'}
          >
            <option value="">{isSeek ? 'Tüm Pozisyonlar' : 'Tüm Açık Pozisyonlar'}</option>
            {CAREER_POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>

          {/* 2. Uzmanlık Sektörü / Sektör (A-Z) */}
          <select
            value={filters.query ?? ''}
            onChange={(e) => onChange({ query: e.target.value || undefined })}
            className="h-10 rounded-lg border border-[#E6E8EE] bg-white px-3 text-sm text-[#0B1220] dark:border-border dark:bg-card dark:text-foreground max-w-[200px]"
            aria-label={isSeek ? 'Uzmanlık Sektörü' : 'Sektör'}
          >
            <option value="">{isSeek ? 'Tüm Uzmanlık Sektörleri' : 'Tüm Sektörler'}</option>
            {CAREER_SECTORS.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>

          {/* 3. Kariyer Seviyesi / Çalışma Şekli (A-Z) */}
          <select
            value={filters.query ?? ''}
            onChange={(e) => onChange({ query: e.target.value || undefined })}
            className="h-10 rounded-lg border border-[#E6E8EE] bg-white px-3 text-sm text-[#0B1220] dark:border-border dark:bg-card dark:text-foreground max-w-[200px]"
            aria-label={isSeek ? 'Kariyer Seviyesi' : 'Çalışma Şekli'}
          >
            <option value="">{isSeek ? 'Tüm Kariyer Seviyeleri' : 'Tüm Çalışma Şekilleri'}</option>
            {(isSeek ? CAREER_SEEK_LEVELS : CAREER_HIRE_WORK_MODES).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </>
      ) : null}

      {!hideCategory && !isCareer && (
        <select
          value={filters.categorySlug ?? ''}
          onChange={(e) => onChange({ categorySlug: e.target.value || undefined })}
          className="h-10 rounded-lg border border-[#E6E8EE] bg-white px-3 text-sm text-[#0B1220] dark:border-border dark:bg-card dark:text-foreground"
          aria-label="Kategori"
        >
          <option value="">Tüm Kategoriler</option>
          {getUserDiscoverableCategorySlugs().map((slug) => {
            const meta = resolveCategorySlug(slug);
            return (
              <option key={slug} value={slug}>
                {meta?.label}
              </option>
            );
          })}
        </select>
      )}

      {/* 4. Şehir */}
      <select
        value={filters.city ?? ''}
        onChange={(e) =>
          onChange({
            city: e.target.value || undefined,
          })
        }
        className="h-10 rounded-lg border border-[#E6E8EE] bg-white px-3 text-sm text-[#0B1220] dark:border-border dark:bg-card dark:text-foreground"
        aria-label="Şehir"
      >
        <option value="">Tüm Şehirler</option>
        {MARKETPLACE_CITY_OPTIONS.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      {/* 5. Sıralama */}
      <select
        value={filters.sortBy}
        onChange={(e) => {
          const selectedSort = e.target.value as MarketplaceFilterState['sortBy'];
          onChange({ sortBy: selectedSort });
        }}
        className="h-10 rounded-lg border border-[#E6E8EE] bg-white px-3 text-sm text-[#0B1220] dark:border-border dark:bg-card dark:text-foreground"
        aria-label="Sıralama"
      >
        {LISTING_SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
