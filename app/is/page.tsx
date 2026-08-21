import type { Metadata } from 'next';
import { CareerHubLanding } from '@/components/girisimco/home/career-hub-landing';
import { parseCareerFlowParam } from '@/components/girisimco/home/home-marketplace.data';
import {
  buildCategoryMetadata,
  CategoryMarketplacePage,
} from '@/features/listings/components/category-marketplace-page';

/**
 * /is — Kariyer ve İş Fırsatları selection landing.
 * /is?flow=seek|hire — existing unified job browse (unchanged chips/filters).
 */
const CATEGORY_SLUG = 'ise-al';

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ flow?: string }>;
}): Promise<Metadata> {
  const sp = searchParams ? await searchParams : {};
  if (parseCareerFlowParam(sp?.flow)) {
    return buildCategoryMetadata(CATEGORY_SLUG);
  }

  return {
    title: 'Kariyer ve İş Fırsatları | Girisimbee',
    description:
      'İş fırsatlarını keşfetmek veya doğru yeteneği bulmak için size uygun yolu seçin.',
  };
}

export default async function IsListingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ flow?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const jobFlow = parseCareerFlowParam(sp?.flow);

  if (!jobFlow) {
    return <CareerHubLanding />;
  }

  return (
    <CategoryMarketplacePage
      categorySlug={CATEGORY_SLUG}
      showJobFlowFilters
      initialJobFlow={jobFlow}
      relatedCategorySlugs={[]}
    />
  );
}
