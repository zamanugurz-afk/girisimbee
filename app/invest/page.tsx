import type { Metadata } from 'next';
import {
  buildCategoryMetadata,
  CategoryMarketplacePage,
} from '@/features/listings/components/category-marketplace-page';

const CATEGORY_SLUG = 'yatirim-bul';

export const metadata: Metadata = buildCategoryMetadata(CATEGORY_SLUG);

export default function InvestPage() {
  return <CategoryMarketplacePage categorySlug={CATEGORY_SLUG} />;
}
