'use client';

import type {
  JobFlowFilter,
  MarketplaceFilterState,
} from '@/features/listings/types/marketplace.types';
import {
  LISTING_SORT_OPTIONS,
  MARKETPLACE_CITY_OPTIONS,
  getAllCategorySlugs,
  resolveCategorySlug,
} from '@/features/listings/config/marketplace.config';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

const HIRE_COLOR = GC_CATEGORY_COLORS['ise-al'];
const SEEK_COLOR = '#0EA5E9';

interface ListingFiltersProps {
  filters: MarketplaceFilterState;
  onChange: (patch: Partial<MarketplaceFilterState>) => void;
  /** Hide category picker when on a category page */
  hideCategory?: boolean;
  /** Show İşe Alıyorum / İş Arıyorum chips (unified /is feed). */
  showJobFlowFilters?: boolean;
  className?: string;
}

function JobFlowFilterChip({
  active,
  color,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  color: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'group relative inline-flex h-9 min-w-[9.75rem] items-center overflow-hidden rounded-lg border bg-white py-1 pl-3 pr-3 text-left',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        'dark:bg-card',
        active ? 'shadow-sm' : 'border-[#E6E8EE] hover:border-[#C7CBD6] dark:border-border',
      )}
      style={
        active
          ? {
              borderColor: `${color}66`,
              backgroundImage: `linear-gradient(90deg, ${color}14 0%, transparent 72%)`,
            }
          : undefined
      }
    >
      <span
        className="absolute inset-y-1.5 left-0 w-[3px] rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="min-w-0 pl-1.5 leading-none">
        <span
          className="block truncate text-[12px] font-semibold tracking-tight"
          style={{ color }}
        >
          {title}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-[#64748B]">{subtitle}</span>
      </span>
    </button>
  );
}

export function ListingFilters({
  filters,
  onChange,
  hideCategory = false,
  showJobFlowFilters = false,
  className,
}: ListingFiltersProps) {
  function toggleJobFlow(next: JobFlowFilter) {
    onChange({ jobFlow: filters.jobFlow === next ? undefined : next });
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {showJobFlowFilters ? (
        <>
          <JobFlowFilterChip
            active={filters.jobFlow === 'hire'}
            color={HIRE_COLOR}
            title="İşe Alıyorum"
            subtitle="Açık pozisyonlar"
            onClick={() => toggleJobFlow('hire')}
          />
          <JobFlowFilterChip
            active={filters.jobFlow === 'seek'}
            color={SEEK_COLOR}
            title="İş Arıyorum"
            subtitle="Kariyer profilleri"
            onClick={() => toggleJobFlow('seek')}
          />
        </>
      ) : null}

      {!hideCategory && (
        <select
          value={filters.categorySlug ?? ''}
          onChange={(e) => onChange({ categorySlug: e.target.value || undefined })}
          className="h-9 rounded-lg border border-[#E6E8EE] bg-white px-3 text-sm text-[#0B1220] dark:border-border dark:bg-card dark:text-foreground"
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
        value={filters.city ?? ''}
        onChange={(e) =>
          onChange({
            city: e.target.value || undefined,
          })
        }
        className="h-9 rounded-lg border border-[#E6E8EE] bg-white px-3 text-sm text-[#0B1220] dark:border-border dark:bg-card dark:text-foreground"
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
        className="h-9 rounded-lg border border-[#E6E8EE] bg-white px-3 text-sm text-[#0B1220] dark:border-border dark:bg-card dark:text-foreground"
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
