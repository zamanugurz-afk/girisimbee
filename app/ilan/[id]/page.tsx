import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ListingDetailPage } from '@/features/listings';
import { loadListingPagePayload } from '@/features/listings/lib/listing-page.loader';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const payload = await loadListingPagePayload(params.id);
  if (!payload) return { title: 'İlan Bulunamadı — Girisimco' };
  if (payload.kind === 'franchise-redirect') {
    return { title: 'Franchise İlanı — Girisimco' };
  }

  return {
    title: `${payload.listing.title} — Girisimco`,
    description: payload.listing.shortDescription,
  };
}

export default async function ListingPage({ params }: PageProps) {
  const payload = await loadListingPagePayload(params.id);
  if (!payload) notFound();
  if (payload.kind === 'franchise-redirect') redirect(payload.href);

  return <ListingDetailPage listing={payload.listing} />;
}
