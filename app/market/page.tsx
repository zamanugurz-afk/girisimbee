import type { Metadata } from 'next';
import { MarketplaceBrowseView } from '@/components/girisimco/marketplace/marketplace-browse-view';

export const metadata: Metadata = {
  title: 'MARKET — Güncel İlanlar — Girisimco',
  description:
    'Girişimco MARKET üzerinden platformdaki tüm güncel yatırım, kariyer, ortaklık ve franchise ilanlarını keşfedin.',
};

export default function MarketPage() {
  return (
    <MarketplaceBrowseView
      title="Girişimco MARKET"
      description="Platformdaki tüm güncel yatırım, ortaklık, kariyer ve franchise ilanlarını keşfedin."
    />
  );
}
