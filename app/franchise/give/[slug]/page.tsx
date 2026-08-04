import { redirect } from 'next/navigation';

interface PageProps {
  params: { slug: string };
}

/** Eski Bayilik Ver detay URL'leri tek franchise detayına yönlendirilir. */
export default function FranchiseGiveDetailPage({ params }: PageProps) {
  redirect(`/franchise/buy/${params.slug}`);
}
