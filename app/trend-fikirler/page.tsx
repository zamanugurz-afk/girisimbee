import type { Metadata } from 'next';
import { TrendIdeaCatalogView } from '@/components/girisimco/trend-ideas/TrendIdeaCatalogView';

export const metadata: Metadata = {
  title: 'Trend & Yeni Nesil İş Fikirleri — Girişimbee',
  description:
    'Sermayesi, amortismanı, aylık net kârı ve operasyonel fizibilitesi hesaplanmış uygulanabilir niş modeller.',
};

export default function TrendIdeasPage() {
  return <TrendIdeaCatalogView />;
}
