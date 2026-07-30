'use client';

import type { MarketplaceFilterState } from '@/features/listings/types/marketplace.types';
import {
  LISTING_SORT_OPTIONS,
  MARKETPLACE_CITY_OPTIONS,
  REMOTE_POLICY_OPTIONS,
  getAllCategorySlugs,
  resolveCategorySlug,
} from '@/features/listings/config/marketplace.config';
import { cn } from '@/lib/utils';

interface ListingFiltersProps {
  filters: MarketplaceFilterState;
  onChange: (patch: Partial<MarketplaceFilterState>) => void;
  /** Hide category picker when on a category page */
  hideCategory?: boolean;
  className?: string;
}

export function ListingFilters({
  filters,
  onChange,
  hideCategory = false,
  className,
}: ListingFiltersProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {!hideCategory && (
        <select
          value={filters.categorySlug ?? ''}
          onChange={(e) => onChange({ categorySlug: e.target.value || undefined })}
          className="h-9 rounded-lg border border-border/80 bg-white px-3 text-sm text-foreground dark:border-white/10 dark:bg-background dark:text-white"
          aria-label="Kategori"
        >
          <option value="">Tüm Kategoriler</option>
          {getAllCategorySlugs().map((slug) => {
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
        value={filters.remotePolicy === 'remote' && !filters.city ? 'remote-city' : (filters.city ?? '')}
        onChange={(e) => {
          if (e.target.value === 'remote-city') {
            onChange({ city: undefined, remotePolicy: 'remote' });
          } else {
            onChange({
              city: e.target.value || undefined,
              remotePolicy: e.target.value ? undefined : filters.remotePolicy,
            });
          }
        }}
        className="h-9 rounded-lg border border-border/80 bg-white px-3 text-sm dark:border-white/10 dark:bg-background"
        aria-label="Şehir"
      >
        <option value="">Tüm Şehirler</option>
        {MARKETPLACE_CITY_OPTIONS.map((city) => (
          <option key={city} value={city === 'Remote' ? 'remote-city' : city}>
            {city}
          </option>
        ))}
      </select>

      <select
        value={filters.remotePolicy ?? ''}
        onChange={(e) =>
          onChange({
            remotePolicy: (e.target.value || undefined) as MarketplaceFilterState['remotePolicy'],
          })
        }
        className="h-9 rounded-lg border border-border/80 bg-white px-3 text-sm dark:border-white/10 dark:bg-background"
        aria-label="Çalışma modeli"
      >
        <option value="">Çalışma Modeli</option>
        {REMOTE_POLICY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border/80 bg-white px-3 text-sm dark:border-white/10 dark:bg-background">
        <input
          type="checkbox"
          checked={Boolean(filters.isVerified)}
          onChange={(e) => onChange({ isVerified: e.target.checked || undefined })}
          className="rounded border-border/80"
        />
        Doğrulanmış
      </label>

      <select
        value={filters.sortBy}
        onChange={(e) =>
          onChange({ sortBy: e.target.value as MarketplaceFilterState['sortBy'] })
        }
        className="ml-auto h-9 rounded-lg border border-border/80 bg-white px-3 text-sm dark:border-white/10 dark:bg-background"
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
