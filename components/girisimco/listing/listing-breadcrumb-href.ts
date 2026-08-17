import type { ListingDetail } from '@/features/listings';
import {
  getCategoryRoutePath,
  getCategorySlugFromIntent,
} from '@/features/listings/config/marketplace.config';

export function resolveListingCategoryHref(listing: Pick<ListingDetail, 'category'>): string {
  const intent = listing.category.id;
  if (intent === 'find-job') return '/is?flow=seek';
  if (intent === 'hire') return '/is?flow=hire';
  if (intent === 'find-partner') {
    return listing.category.label === 'Ortak Olmak İstiyorum'
      ? '/partners?intent=joining'
      : '/partners?intent=seeking';
  }
  return getCategoryRoutePath(getCategorySlugFromIntent(intent));
}
