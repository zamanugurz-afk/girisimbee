import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { FranchiseFlow } from '@/features/franchise/types/franchise-listing.types';
import {
  extractFranchiseListingDetails,
  formatMoney,
} from '@/features/franchise/lib/franchise-listing.mapper';
import { toDisplayValue } from '@/features/listings/utils/display-value';

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

function listingHref(flow: FranchiseFlow, slug: string): string {
  return `/franchise/${flow}/${slug}`;
}

function formatListingMeta(pageFlow: FranchiseFlow, listing: Listing): string {
  const details = extractFranchiseListingDetails(listing);
  if (pageFlow === 'buy') {
    return formatMoney(details.franchiseBedeli) || listing.shortDescription.slice(0, 80);
  }
  if (details.minimumYatirim != null || details.maksimumYatirim != null) {
    return [formatMoney(details.minimumYatirim), formatMoney(details.maksimumYatirim)]
      .filter(Boolean)
      .join(' – ');
  }
  return listing.shortDescription.slice(0, 80);
}

export function FranchiseBrowseView({
  flow,
  listings,
  title,
  description,
  filters,
}: FranchiseBrowseViewProps) {
  const basePath = `/franchise/${flow}`;

  return (
    <div className="gc-header-offset">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
        <h1 className="gc-page-heading text-gc-xl">{title}</h1>
        <p className="mt-2 max-w-xl text-gc-base text-muted-foreground">{description}</p>

        <form method="get" className="mt-8 flex flex-wrap gap-3">
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

        <p className="mt-6 text-xs text-muted-foreground">
          {listings.length.toLocaleString('tr-TR')} ilan
        </p>

        {listings.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">Eşleşen ilan bulunamadı.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => {
              const locationParts = [listing.city, listing.district].filter((part) =>
                toDisplayValue(part),
              );
              return (
                <li key={listing.id}>
                  <Link
                    href={listingHref(flow, listing.slug)}
                    className="group flex h-full flex-col rounded-[24px] border border-border/80 bg-white p-5 gc-shadow-soft transition-shadow hover:shadow-md dark:border-white/10 dark:bg-card/90"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {toDisplayValue(listing.industry) || (flow === 'buy' ? 'Franchise' : 'Arayış')}
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-foreground group-hover:text-primary">
                      {listing.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {formatListingMeta(flow, listing)}
                    </p>
                    {locationParts.length > 0 && (
                      <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {locationParts.join(', ')}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {(filters.city || filters.district || filters.sector) && (
          <Link href={basePath} className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground">
            Filtreleri temizle
          </Link>
        )}
      </div>
    </div>
  );
}
