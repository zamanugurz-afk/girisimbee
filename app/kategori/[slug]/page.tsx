import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MarketplaceBrowseView } from '@/components/girisimco/marketplace/marketplace-browse-view';
import { resolveCategorySlug, resolveCanonicalCategorySlug, getAllCategorySlugs } from '@/features/listings/config/marketplace.config';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const meta = resolveCategorySlug(params.slug);
  if (!meta) return { title: 'Kategori Bulunamadı — Girisimco' };

  return {
    title: meta.seoTitle,
    description: meta.seoDescription,
    openGraph: {
      title: meta.seoTitle,
      description: meta.seoDescription,
    },
  };
}

export default function CategoryPage({ params }: PageProps) {
  const meta = resolveCategorySlug(params.slug);
  if (!meta) notFound();

  return (
    <MarketplaceBrowseView
      categorySlug={resolveCanonicalCategorySlug(params.slug)}
      hideCategoryFilter
    />
  );
}
