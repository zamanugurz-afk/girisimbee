import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { FranchiseListingDetailView } from '@/features/franchise/components/franchise-listing-detail-view';
import { toPublicFranchiseListing } from '@/features/franchise/lib/franchise-listing.mapper';
import { FRANCHISE_BROWSE_TITLE, FRANCHISE_DETAIL_BACK_LABEL } from '@/features/franchise/presentation/franchise-copy';

interface PageProps {
  params: { slug: string };
}

async function loadDetail(slug: string, trackView = false) {
  const container = getServerContainer(createClient());
  const data = await container.ecosystem.franchiseService.getListingDetail(slug, { trackView });
  if (!data) return null;

  return {
    ...data,
    listing: toPublicFranchiseListing(data.listing),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await loadDetail(params.slug);
  if (!data) {
    return { title: 'İlan Bulunamadı — Girisimbee' };
  }

  return {
    title: `${data.listing.title} — ${FRANCHISE_BROWSE_TITLE} | Girisimbee`,
    description: data.listing.shortDescription,
  };
}

export default async function FranchiseBuyDetailPage({ params }: PageProps) {
  const data = await loadDetail(params.slug, true);
  if (!data || data.listing.status !== 'published') notFound();

  return (
    <FranchiseListingDetailView
      data={data}
      backHref="/franchise/buy"
      backLabel={FRANCHISE_DETAIL_BACK_LABEL}
    />
  );
}
