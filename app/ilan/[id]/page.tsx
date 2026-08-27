import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ListingDetailPage } from '@/features/listings';
import { loadListingPagePayload } from '@/features/listings/lib/listing-page.loader';

export const revalidate = 0;

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const payload = await loadListingPagePayload(params.id);
  if (!payload) return { title: 'İlan Bulunamadı — Girisimbee' };

  return {
    title: `${payload.listing.title} — Girisimbee`,
    description: payload.listing.shortDescription,
  };
}

export default async function ListingPage({ params }: PageProps) {
  const payload = await loadListingPagePayload(params.id);
  if (!payload) notFound();

  return <ListingDetailPage listing={payload.listing} />;
}
