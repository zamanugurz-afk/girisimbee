import type { Metadata } from 'next';
import {
  buildCategoryMetadata,
  CategoryMarketplacePage,
} from '@/features/listings/components/category-marketplace-page';
import { parseCareerFlowParam } from '@/components/girisimco/home/home-marketplace.data';

/**
 * Unified feed of İşe Alıyorum + İş Arıyorum listings.
 * Optional ?flow=seek|hire only sets the existing chip; /is still works unfiltered.
 */
const CATEGORY_SLUG = 'ise-al';

export const metadata: Metadata = buildCategoryMetadata(CATEGORY_SLUG);

export default function IsListingsPage({
  searchParams,
}: {
  searchParams?: { flow?: string };
}) {
  return (
    <CategoryMarketplacePage
      categorySlug={CATEGORY_SLUG}
      showJobFlowFilters
      initialJobFlow={parseCareerFlowParam(searchParams?.flow)}
    />
  );
}
