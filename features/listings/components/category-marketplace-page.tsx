import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MarketplaceBrowseView } from '@/components/girisimco/marketplace/marketplace-browse-view';
import {
  resolveCategorySlug,
  resolveCanonicalCategorySlug,
} from '@/features/listings/config/marketplace.config';
import type { PartnershipIntent } from '@/features/founders/partnership-intent';
import type { JobFlowFilter } from '@/features/listings/types/marketplace.types';

export function buildCategoryMetadata(categorySlug: string): Metadata {
  const meta = resolveCategorySlug(categorySlug);
  if (!meta) return { title: 'Kategori Bulunamadı — Girisimbee' };

  return {
    title: meta.seoTitle,
    description: meta.seoDescription,
    openGraph: {
      title: meta.seoTitle,
      description: meta.seoDescription,
    },
  };
}

export function CategoryMarketplacePage({
  categorySlug,
  showJobFlowFilters = false,
  showVentureFlowFilters,
  initialJobFlow,
  partnershipIntent,
  title,
  description,
  eyebrow,
  accent,
  backHref,
  backLabel,
  emptyTitle,
  emptyDescription,
  emptyCta,
  relatedCategorySlugs,
  resultNoun,
}: {
  categorySlug: string;
  /** Unified İş İlanları page — hire/seek chips above city/sort filters. */
  showJobFlowFilters?: boolean;
  /** Unified Ortaklık ve Devir page — 3-way direction selector chips. */
  showVentureFlowFilters?: boolean;
  initialJobFlow?: JobFlowFilter;
  partnershipIntent?: PartnershipIntent;
  title?: string;
  description?: string;
  eyebrow?: string;
  accent?: string;
  backHref?: string;
  backLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyCta?: { label: string; href: string };
  relatedCategorySlugs?: string[];
  resultNoun?: string;
}) {
  const meta = resolveCategorySlug(categorySlug);
  if (!meta) notFound();

  const isCareer =
    categorySlug === 'ise-al' ||
    categorySlug === 'is-ariyorum' ||
    categorySlug === 'is-bul';

  const resolvedBackHref = backHref ?? (isCareer ? '/is' : undefined);
  const resolvedBackLabel = backLabel ?? (isCareer ? 'Kariyer Menüsüne Dön' : undefined);

  return (
    <MarketplaceBrowseView
      categorySlug={resolveCanonicalCategorySlug(categorySlug)}
      hideCategoryFilter
      showJobFlowFilters={showJobFlowFilters}
      showVentureFlowFilters={showVentureFlowFilters}
      title={title}
      description={description}
      eyebrow={eyebrow}
      accent={accent}
      backHref={resolvedBackHref}
      backLabel={resolvedBackLabel}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyCta={emptyCta}
      relatedCategorySlugs={relatedCategorySlugs}
      resultNoun={resultNoun}
      initialFilters={{
        ...(initialJobFlow ? { jobFlow: initialJobFlow } : {}),
        ...(partnershipIntent ? { partnershipIntent } : {}),
      }}
    />
  );
}
