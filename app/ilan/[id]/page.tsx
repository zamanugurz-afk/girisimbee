import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ListingDetailPage } from '@/features/listings';
import { loadListingDetail } from '@/features/listings/lib/listing-page.loader';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import type { ListingId } from '@/lib/domain/ids';
import { uuidSchema } from '@/lib/domain/validation';

interface PageProps {
  params: { id: string };
}

async function resolveFranchiseRedirect(idOrSlug: string): Promise<string | null> {
  try {
    const container = getServerContainer(createClient());
    const raw = idOrSlug.trim();
    const isUuid = uuidSchema.safeParse(raw).success;
    const aggregate = isUuid
      ? await container.listingEngine.getListing(raw as ListingId)
      : await container.listingEngine.getListingBySlug(raw);
    if (aggregate?.listing.moduleKey === 'franchise' && aggregate.listing.slug) {
      return `/franchise/buy/${aggregate.listing.slug}`;
    }
  } catch {
    return null;
  }
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await loadListingDetail(params.id);
  if (!listing) return { title: 'İlan Bulunamadı — Girisimco' };

  return {
    title: `${listing.title} — Girisimco`,
    description: listing.shortDescription,
  };
}

export default async function ListingPage({ params }: PageProps) {
  const franchiseHref = await resolveFranchiseRedirect(params.id);
  if (franchiseHref) redirect(franchiseHref);

  const listing = await loadListingDetail(params.id);
  if (!listing) notFound();

  return <ListingDetailPage listing={listing} />;
}
