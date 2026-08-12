import type { Metadata } from 'next';
import {
  buildCategoryMetadata,
  CategoryMarketplacePage,
} from '@/features/listings/components/category-marketplace-page';

/** Nav “İş İlanları” — open position browse (İşe Alıyorum listings). */
const CATEGORY_SLUG = 'ise-al';

export const metadata: Metadata = buildCategoryMetadata(CATEGORY_SLUG);

export default function IsListingsPage() {
  return <CategoryMarketplacePage categorySlug={CATEGORY_SLUG} />;
}
