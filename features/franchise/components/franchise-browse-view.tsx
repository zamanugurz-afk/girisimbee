import Link from 'next/link';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { FranchiseFlow } from '@/features/franchise/types/franchise-listing.types';
import { listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
import { ListingFeed } from '@/components/girisimco/marketplace/listing-feed';
import { LISTING_CARD_GROUP_COLORS } from '@/features/listings/utils/listing-card-display';

interface FranchiseBrowseViewProps {
  flow: FranchiseFlow;
  listings: Listing[];
  title: string;
  description: string;
  filters: {
    city?: string;
    district?: string;
    sector?: string;
  };
}

export function FranchiseBrowseView({
  flow,
  listings,
  title,
  description,
  filters,
}: FranchiseBrowseViewProps) {
  const basePath = `/franchise/${flow}`;
  const accent = LISTING_CARD_GROUP_COLORS.franchise;

  const items = listingsToContentItems(listings).map((item) => ({
    ...item,
    // Keep users on franchise detail routes instead of /ilan → redirect.
    href: `/franchise/${flow}/${item.id}`,
  }));

  return (
    <div className="gc-header-offset">
      <div className="relative border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 gc-dot-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: accent }}
          >
            Franchise
          </p>
          <h1 className="gc-page-heading mt-1">{title}</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">{description}</p>

          <form method="get" className="mt-6 flex flex-wrap gap-3">
            <input
              name="city"
              defaultValue={filters.city ?? ''}
              placeholder="Şehir"
              className="rounded-xl border border-border/80 bg-white px-3 py-2 text-sm dark:bg-card"
            />
            <input
              name="district"
              defaultValue={filters.district ?? ''}
              placeholder="İlçe"
              className="rounded-xl border border-border/80 bg-white px-3 py-2 text-sm dark:bg-card"
            />
            <input
              name="sector"
              defaultValue={filters.sector ?? ''}
              placeholder="Sektör"
              className="rounded-xl border border-border/80 bg-white px-3 py-2 text-sm dark:bg-card"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Filtrele
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
        <p className="mb-4 text-xs text-muted-foreground">
          {listings.length.toLocaleString('tr-TR')} ilan
        </p>

        <ListingFeed
          items={items}
          accent={accent}
          emptyMessage="Eşleşen ilan bulunamadı."
        />

        {(filters.city || filters.district || filters.sector) && (
          <Link
            href={basePath}
            className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            Filtreleri temizle
          </Link>
        )}
      </div>
    </div>
  );
}
