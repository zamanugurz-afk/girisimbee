import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MarketAdDetailView } from '@/components/girisimco/market/MarketAdDetailView';
import { MOCK_MARKET_ITEMS } from '@/features/admin/market/mock/market.mock';

interface PageProps {
  params: { id: string };
}

function findMarketItem(id: string) {
  return MOCK_MARKET_ITEMS.find(
    (item) => item.id === id && item.status === 'published' && !item.deletedAt,
  );
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = findMarketItem(params.id);
  if (!item) {
    return { title: 'MARKET fırsatı bulunamadı — Girisimco' };
  }
  return {
    title: `${item.title} — Girişimco MARKET`,
    description: item.description ?? 'Girişimco MARKET fırsatı',
  };
}

export default function MarketAdDetailPage({ params }: PageProps) {
  const item = findMarketItem(params.id);
  if (!item) notFound();
  return <MarketAdDetailView item={item} />;
}
