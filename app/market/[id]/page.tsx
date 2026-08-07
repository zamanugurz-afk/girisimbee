import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MarketAdDetailView } from '@/components/girisimco/market/MarketAdDetailView';
import { getMarketItem } from '@/features/admin/market/lib/market-repository';
import { MOCK_MARKET_ITEMS } from '@/features/admin/market/mock/market.mock';
import type { MarketItem } from '@/features/admin/market/types/market.types';

interface PageProps {
  params: { id: string };
}

async function findMarketItem(id: string): Promise<MarketItem | null> {
  try {
    const supabase = createClient();
    const live = await getMarketItem(supabase, id);
    if (live && live.status === 'published' && !live.deletedAt) return live;
  } catch {
    // fall through to mock
  }
  return (
    MOCK_MARKET_ITEMS.find(
      (item) => item.id === id && item.status === 'published' && !item.deletedAt,
    ) ?? null
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await findMarketItem(params.id);
  if (!item) {
    return { title: 'MARKET fırsatı bulunamadı — GirisimBee' };
  }
  return {
    title: `${item.title} — GirisimBee MARKET`,
    description: item.description ?? 'GirisimBee MARKET fırsatı',
  };
}

export default async function MarketAdDetailPage({ params }: PageProps) {
  const item = await findMarketItem(params.id);
  if (!item) notFound();
  return <MarketAdDetailView item={item} />;
}
