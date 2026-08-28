import type { Metadata } from 'next';
import { InvestmentRadarClient } from '@/components/radar/InvestmentRadarClient';

export const metadata: Metadata = {
  title: 'Yatırım Radarı | Lokasyon, Rakip Yoğunluğu ve Çember İçi İlan İstihbaratı',
  description:
    'Harita üzerinde dilediğiniz konumu ve yarıçapı seçerek bölgedeki rakip işletmeleri, pazar doygunluk analizini, yapay zeka yatırım tavsiyelerini ve çember içindeki hazır devren/ortaklık fırsatlarını anında keşfedin.',
  openGraph: {
    title: 'Yatırım Radarı | Girişimbee',
    description:
      'Lokasyon ve rakip yoğunluğu istihbaratı ile doğru bölgede, doğru yatırımı yapın.',
    type: 'website',
  },
};

export default function RadarPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50/50 dark:bg-zinc-950">
      <InvestmentRadarClient />
    </main>
  );
}