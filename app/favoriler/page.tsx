import type { Metadata } from 'next';
import { FavoritesView } from '@/components/girisimco/marketplace/favorites-view';

export const metadata: Metadata = {
  title: 'Favorilerim — GirisimBee',
  description: 'Kaydettiğiniz ilanları görüntüleyin.',
};

export default function FavoritesPage() {
  return <FavoritesView />;
}
