import type { Metadata } from 'next';
import { ReklamPageView } from '@/features/ads';

export const metadata: Metadata = {
  title: 'Reklam & İşbirliği — GirisimBee',
  description:
    'GirisimBee MARKET’te 5.000 TL sabit fiyatlı reklam verin veya özel işbirliği talebi oluşturun.',
};

export default function ReklamPage() {
  return <ReklamPageView />;
}
