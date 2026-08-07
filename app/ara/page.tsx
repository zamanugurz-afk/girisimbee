import type { Metadata } from 'next';
import { MarketplaceBrowseView } from '@/components/girisimco/marketplace/marketplace-browse-view';

interface PageProps {
  searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const q = searchParams.q?.trim();
  return {
    title: q ? `"${q}" Arama Sonuçları — Girisimbee` : 'İlan Ara — Girisimbee',
    description: q
      ? `${q} için Girisimbee marketplace arama sonuçları.`
      : 'Girişim, yatırım, kariyer ve ortaklık ilanlarında arama yapın.',
  };
}

export default function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q?.trim();

  return (
    <MarketplaceBrowseView
      key={query ?? 'all'}
      initialQuery={query}
      title={query ? `"${query}" araması` : 'İlan Ara'}
      description="Yatırım, kariyer ve ortaklık fırsatlarında arama yapın."
    />
  );
}
