import type { Metadata } from 'next';
import {
  buildCategoryMetadata,
  CategoryMarketplacePage,
} from '@/features/listings/components/category-marketplace-page';

const CATEGORY_SLUG = 'is-ariyorum';

export const metadata: Metadata = buildCategoryMetadata(CATEGORY_SLUG);

/** Anonymous job-seeker career profiles browse. */
export default function IsAriyorumPage() {
  return <CategoryMarketplacePage categorySlug={CATEGORY_SLUG} />;
}
