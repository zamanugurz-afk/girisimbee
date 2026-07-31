import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  buildCategoryMetadata,
  CategoryMarketplacePage,
} from '@/features/listings/components/category-marketplace-page';
import { getAllCategorySlugs, resolveCategorySlug } from '@/features/listings/config/marketplace.config';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return buildCategoryMetadata(params.slug);
}

export default function CategoryPage({ params }: PageProps) {
  if (!resolveCategorySlug(params.slug)) notFound();
  return <CategoryMarketplacePage categorySlug={params.slug} />;
}
