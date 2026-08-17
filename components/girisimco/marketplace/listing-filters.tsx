'use client';

import type { MarketplaceFilterState } from '@/features/listings/types/marketplace.types';
import {
  LISTING_SORT_OPTIONS,
  MARKETPLACE_CITY_OPTIONS,
  getUserDiscoverableCategorySlugs,
  resolveCategorySlug,
} from '@/features/listings/config/marketplace.config';
import { JobFlowFilters } from '@/components/girisimco/marketplace/job-flow-filters';
import { cn } from '@/lib/utils';

interface ListingFiltersProps {
  filters: MarketplaceFilterState;
  onChange: (patch: Partial<MarketplaceFilterState>) => void;
  /** Hide category picker when on a category page */
  hideCategory?: boolean;
  /** Show İşe Alıyorum / İş Arıyorum chips (unified /is feed). */
  showJobFlowFilters?: boolean;
  className?: string;
}

export function ListingFilters({
  filters,
  onChange,
  hideCategory = false,
  showJobFlowFilters = false,
  className,
}: ListingFiltersProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {showJobFlowFilters ? (
        <JobFlowFilters
          value={filters.jobFlow}
          onChange={(jobFlow) => onChange({ jobFlow })}
        />
      ) : null}

      {!hideCategory && (
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
