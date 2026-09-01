import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { MarketAdDetailView } from '@/components/girisimco/market/MarketAdDetailView';
import { getMarketItem } from '@/features/admin/market/lib/market-repository';
import { toPublicMarketItem } from '@/features/admin/market/lib/public-market-item';
import { MOCK_MARKET_ITEMS } from '@/features/admin/market/mock/market.mock';
import type { MarketItem } from '@/features/admin/market/types/market.types';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return MOCK_MARKET_ITEMS.map((item) => ({
    id: item.id,
  }));
}

async function findMarketItem(id: string): Promise<MarketItem> {
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
  return mock ? toPublicMarketItem(mock) : toPublicMarketItem(MOCK_MARKET_ITEMS[0]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await findMarketItem(params.id);
  return {
    title: `${item.title} — Girisimbee MARKET`,
    description: item.description ?? 'Girisimbee MARKET fırsatı',
  };
}

export default async function MarketAdDetailPage({ params }: PageProps) {
  const item = await findMarketItem(params.id);
  return <MarketAdDetailView item={item} />;
}
