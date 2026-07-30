import { isOpenableMarketplaceUrl } from '@/lib/listing-url-validator';

export interface ListingSourceLike {
  source_url?: string | null;
  /** @deprecated Use source_url — kept for transitional reads */
  url?: string | null;
}

function firstNonEmptyUrl(...candidates: Array<string | null | undefined>): string {
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const trimmed = candidate.trim();
    if (trimmed) return trimmed;
  }
  return '';
}

export function getListingSourceUrl(listing: ListingSourceLike): string {
  return firstNonEmptyUrl(listing.source_url, listing.url);
}

export function hasListingSourceUrl(listing: ListingSourceLike): boolean {
  const url = getListingSourceUrl(listing);
  return url.length > 0 && isOpenableMarketplaceUrl(url);
}

export function openListingSource(listing: ListingSourceLike): boolean {
  const url = getListingSourceUrl(listing);
  if (!url || !isOpenableMarketplaceUrl(url)) return false;

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
