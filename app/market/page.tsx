import type { Metadata } from 'next';
import { MarketCatalogView } from '@/components/girisimco/market/MarketCatalogView';

export const metadata: Metadata = {
  title: 'MARKET — Fırsat ve İşbirlikleri — Girisimco',
  description:
    'Girişimco MARKET üzerindeki seçili fırsat ve iş birliği reklamlarını keşfedin.',
};

export default function MarketPage() {
  return <MarketCatalogView />;
}
