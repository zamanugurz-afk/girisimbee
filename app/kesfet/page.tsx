import type { Metadata } from 'next';
import { MarketplaceBrowseView } from '@/components/girisimco/marketplace/marketplace-browse-view';

export const metadata: Metadata = {
  title: 'Keşfet — Girisimco Marketplace',
  description: 'Yatırım, kariyer ve ortaklık ilanlarını keşfedin.',
};

export default function ExplorePage() {
  return (
    <MarketplaceBrowseView
      title="Keşfet"
      description="Tüm kategorilerdeki güncel ilanları inceleyin."
    />
  );
}
