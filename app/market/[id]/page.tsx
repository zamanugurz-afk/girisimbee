import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MarketAdDetailView } from '@/components/girisimco/market/MarketAdDetailView';
import { getMarketItem } from '@/features/admin/market/lib/market-repository';
import { toPublicMarketItem } from '@/features/admin/market/lib/public-market-item';
import { MOCK_MARKET_ITEMS } from '@/features/admin/market/mock/market.mock';
import type { MarketItem } from '@/features/admin/market/types/market.types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { id: string };
}

async function findMarketItem(id: string): Promise<MarketItem | null> {
  try {
    const supabase = createClient();
    const live = await getMarketItem(supabase, id);
    if (live && live.status === 'published' && !live.deletedAt) {
      return toPublicMarketItem(live);
    }
  } catch {
    // fall through to mock
  }
  const mock = MOCK_MARKET_ITEMS.find(
    (item) => item.id === id && item.status === 'published' && !item.deletedAt,
  );
  return mock ? toPublicMarketItem(mock) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await findMarketItem(params.id);
  if (!item) {
    return { title: 'MARKET fırsatı bulunamadı — Girisimbee' };
  }
  return {
    title: `${item.title} — Girisimbee MARKET`,
    description: item.description ?? 'Girisimbee MARKET fırsatı',
  };
}

export default async function MarketAdDetailPage({ params }: PageProps) {
  const item = await findMarketItem(params.id);
  if (!item) notFound();
  return <MarketAdDetailView item={item} />;
}
