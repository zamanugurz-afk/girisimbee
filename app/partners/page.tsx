import type { Metadata } from 'next';
import {
  buildCategoryMetadata,
  CategoryMarketplacePage,
} from '@/features/listings/components/category-marketplace-page';
import {
  parsePartnershipIntentParam,
  partnershipBrowseCopy,
  partnershipCreateHref,
} from '@/features/founders/partnership-intent';

const CATEGORY_SLUG = 'ortak-bul';

export function generateMetadata({
  searchParams,
}: {
  searchParams?: { intent?: string };
}): Metadata {
  const intent = parsePartnershipIntentParam(searchParams?.intent) ?? 'seeking';
  const copy = partnershipBrowseCopy(intent);
  const base = buildCategoryMetadata(CATEGORY_SLUG);
  return {
    ...base,
    title: copy.seoTitle,
    description: copy.seoDescription,
  };
}

export default function PartnersPage({
  searchParams,
}: {
  searchParams?: { intent?: string };
}) {
  const intent = parsePartnershipIntentParam(searchParams?.intent) ?? 'seeking';
  const copy = partnershipBrowseCopy(intent);

  return (
    <CategoryMarketplacePage
      categorySlug={CATEGORY_SLUG}
      partnershipIntent={intent}
      eyebrow="Girişim ve Ortaklık"
      title={copy.title}
      description={copy.description}
      emptyTitle={copy.emptyTitle}
      emptyDescription={copy.emptyDescription}
      emptyCta={{ label: copy.emptyCtaLabel, href: partnershipCreateHref(intent) }}
      relatedCategorySlugs={['bayilik-al']}
      resultNoun={copy.resultNoun}
    />
  );
}
