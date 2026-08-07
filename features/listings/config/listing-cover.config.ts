/**
 * Default listing card covers when the listing has no uploaded images.
 * Static AI-generated photos per listing type (no runtime AI cost).
 */
import type { ListingCardGroup } from '@/features/listings/utils/listing-card-display';

const COVER_BY_TYPE_SLUG: Record<string, string> = {
  'yatirim-ariyorum': '/covers/yatirim-ariyorum.jpg',
  'yatirim-yapiyorum': '/covers/yatirim-yapiyorum.jpg',
  'is-ariyorum': '/covers/is-ariyorum.jpg',
  'ise-aliyorum': '/covers/ise-aliyorum.jpg',
  'ortak-ariyorum': '/covers/ortak-ariyorum.jpg',
  'franchise-ilan-ver': '/covers/franchise.jpg',
  'bayilik-al': '/covers/franchise.jpg',
  'bayilik-ver': '/covers/franchise.jpg',
};

const COVER_BY_GROUP: Record<ListingCardGroup, string> = {
  yatirim: '/covers/yatirim-ariyorum.jpg',
  is: '/covers/ise-aliyorum.jpg',
  ortaklik: '/covers/ortak-ariyorum.jpg',
  franchise: '/covers/franchise.jpg',
  genel: '/covers/default.jpg',
  dijital: '/covers/default.jpg',
};

export const DEFAULT_LISTING_COVER = '/covers/default.jpg';

/** Resolve fallback cover from listing type slug or card group. */
export function resolveDefaultListingCover(opts: {
  listingTypeSlug?: string | null;
  group?: ListingCardGroup | null;
}): string {
  if (opts.listingTypeSlug && COVER_BY_TYPE_SLUG[opts.listingTypeSlug]) {
    return COVER_BY_TYPE_SLUG[opts.listingTypeSlug];
  }
  if (opts.group && COVER_BY_GROUP[opts.group]) {
    return COVER_BY_GROUP[opts.group];
  }
  return DEFAULT_LISTING_COVER;
}

/** Prefer uploaded cover; otherwise category/type standard cover. */
export function resolveListingCoverUrl(opts: {
  uploadedUrl?: string | null;
  listingTypeSlug?: string | null;
  group?: ListingCardGroup | null;
}): string {
  const uploaded = opts.uploadedUrl?.trim();
  if (uploaded) return uploaded;
  return resolveDefaultListingCover(opts);
}
