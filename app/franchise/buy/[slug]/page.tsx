import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { FranchiseListingDetailView } from '@/features/franchise/components/franchise-listing-detail-view';

interface PageProps {
  params: { slug: string };
}

async function loadDetail(slug: string, trackView = false) {
  const container = getServerContainer(createClient());
  const data = await container.ecosystem.franchiseService.getListingDetail(slug, { trackView });
  if (!data) return null;

  // Prefer membership/profile phone on franchise detail (same as /ilan pages).
  const [marketplaceProfile, accountProfile] = await Promise.all([
    container.profileService.getByUserId(data.listing.ownerId),
    container.accountService.getProfile(data.listing.ownerId),
  ]);
  const membershipPhone =
    marketplaceProfile?.phone?.trim()
    || accountProfile?.phone?.trim()
    || null;
  if (!membershipPhone) return data;

  return {
    ...data,
    listing: {
      ...data.listing,
      contactPhone: membershipPhone,
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await loadDetail(params.slug);
  if (!data || data.flow !== 'give') {
    return { title: 'İlan Bulunamadı — Girisimbee' };
  }

  return {
    title: `${data.listing.title} — Franchise | Girisimbee`,
    description: data.listing.shortDescription,
  };
}

export default async function FranchiseBuyDetailPage({ params }: PageProps) {
  const data = await loadDetail(params.slug, true);
  if (!data || data.flow !== 'give' || data.listing.status !== 'published') notFound();

  return (
    <FranchiseListingDetailView
      data={data}
      backHref="/franchise/buy"
      backLabel="Franchise"
    />
  );
}
