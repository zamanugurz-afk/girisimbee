import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MarketplaceBrowseView } from '@/components/girisimco/marketplace/marketplace-browse-view';
import {
  resolveCategorySlug,
  resolveCanonicalCategorySlug,
} from '@/features/listings/config/marketplace.config';

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
}: {
  categorySlug: string;
  /** Unified İş İlanları page — hire/seek chips above city/sort filters. */
  showJobFlowFilters?: boolean;
}) {
  const meta = resolveCategorySlug(categorySlug);
  if (!meta) notFound();

  return (
    <MarketplaceBrowseView
      categorySlug={resolveCanonicalCategorySlug(categorySlug)}
      hideCategoryFilter
      showJobFlowFilters={showJobFlowFilters}
    />
  );
}
