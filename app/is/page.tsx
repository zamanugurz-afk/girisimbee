import type { Metadata } from 'next';
import {
  buildCategoryMetadata,
  CategoryMarketplacePage,
} from '@/features/listings/components/category-marketplace-page';

/**
 * Nav “İş İlanları” — unified feed of İşe Alıyorum + İş Arıyorum listings,
 * with hire/seek filter chips on the browse toolbar.
 */
const CATEGORY_SLUG = 'ise-al';

export const metadata: Metadata = buildCategoryMetadata(CATEGORY_SLUG);

export default function IsListingsPage() {
  return <CategoryMarketplacePage categorySlug={CATEGORY_SLUG} showJobFlowFilters />;
}
