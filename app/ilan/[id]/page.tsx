import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ListingDetailPage } from '@/features/listings';
import { loadListingDetail } from '@/features/listings/lib/listing-page.loader';

interface PageProps {
  params: { id: string };
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
  const listing = await loadListingDetail(params.id);
  if (!listing) notFound();

  return <ListingDetailPage listing={listing} />;
}
