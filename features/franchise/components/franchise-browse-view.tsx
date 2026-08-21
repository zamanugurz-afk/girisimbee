import Link from 'next/link';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { FranchiseFlow } from '@/features/franchise/types/franchise-listing.types';
import { listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
import { ListingFeed } from '@/components/girisimco/marketplace/listing-feed';
import { LISTING_CARD_GROUP_COLORS } from '@/features/listings/utils/listing-card-display';
import {
  FRANCHISE_BROWSE_DESCRIPTION,
  FRANCHISE_BROWSE_TITLE,
  FRANCHISE_CLEAR_FILTERS_LABEL,
  FRANCHISE_EMPTY_BACK_CTA,
  FRANCHISE_EMPTY_DESCRIPTION,
  FRANCHISE_EMPTY_FILTERED_DESCRIPTION,
  FRANCHISE_EMPTY_FILTERED_TITLE,
  FRANCHISE_EMPTY_TITLE,
} from '@/features/franchise/presentation/franchise-copy';
import { FRANCHISE_CITY_OPTIONS, FRANCHISE_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';

interface FranchiseBrowseViewProps {
  flow: FranchiseFlow;
  listings: Listing[];
  title?: string;
  description?: string;
  filters: {
    city?: string;
    district?: string;
    sector?: string;
  };
}

export function FranchiseBrowseView({
  flow,
  listings,
  title = FRANCHISE_BROWSE_TITLE,
  description = FRANCHISE_BROWSE_DESCRIPTION,
  filters,
}: FranchiseBrowseViewProps) {
  const basePath = `/franchise/${flow}`;
  const accent = LISTING_CARD_GROUP_COLORS.franchise;
  const hasFilters = Boolean(filters.city || filters.district || filters.sector);

  const items = listingsToContentItems(listings).map((item) => ({
    ...item,
    href: `/franchise/${flow}/${item.id}`,
  }));

  const selectClass =
    'h-10 w-full min-w-0 max-w-full rounded-2xl border border-border/80 bg-background px-3 text-sm text-foreground';

  return (
    <div className="gc-header-offset min-w-0 overflow-x-hidden bg-background">
      <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-b from-card/60 to-background backdrop-blur-md">
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full blur-[120px] opacity-[0.035] dark:opacity-[0.05]"
          style={{ backgroundColor: accent }}
        />
        <div className="relative mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
            style={{
              color: accent,
              backgroundColor: `${accent}10`,
              border: `1px solid ${accent}25`,
            }}
          >
            Ortaklık ve Devir
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>

          <form method="get" className="mt-6 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="min-w-0 space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Şehir</span>
              <select name="city" defaultValue={filters.city ?? ''} className={selectClass} aria-label="Şehir">
                <option value="">Tümü</option>
                {FRANCHISE_CITY_OPTIONS.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0 space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">İlçe</span>
              <input
                name="district"
                defaultValue={filters.district ?? ''}
                placeholder="İlçe"
                className={selectClass}
                aria-label="İlçe"
              />
            </label>
            <label className="min-w-0 space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Sektör</span>
              <select name="sector" defaultValue={filters.sector ?? ''} className={selectClass} aria-label="Sektör">
                <option value="">Tümü</option>
                {FRANCHISE_SECTOR_OPTIONS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex min-w-0 items-end gap-2">
              <button
                type="submit"
                className="h-10 w-full rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Filtrele
              </button>
            </div>
          </form>
          {hasFilters ? (
            <Link
              href={basePath}
              className="mt-3 inline-flex text-sm text-muted-foreground hover:text-foreground"
            >
              {FRANCHISE_CLEAR_FILTERS_LABEL}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mx-auto min-w-0 max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
        <p className="mb-4 text-xs text-muted-foreground">
          {listings.length.toLocaleString('tr-TR')} fırsat
        </p>

        <ListingFeed
          items={items}
          accent={accent}
          emptyMessage={hasFilters ? FRANCHISE_EMPTY_FILTERED_TITLE : FRANCHISE_EMPTY_TITLE}
          emptyDescription={hasFilters ? FRANCHISE_EMPTY_FILTERED_DESCRIPTION : FRANCHISE_EMPTY_DESCRIPTION}
          emptyCta={hasFilters ? { label: FRANCHISE_CLEAR_FILTERS_LABEL, href: basePath } : FRANCHISE_EMPTY_BACK_CTA}
        />
      </div>
    </div>
  );
}
