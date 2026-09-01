import type { Metadata } from 'next';
import { TrendIdeaDetailView } from '@/components/girisimco/trend-ideas/TrendIdeaDetailView';
import { MONTHLY_TREND_IDEAS } from '@/lib/data/monthly-trend-ideas';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return MONTHLY_TREND_IDEAS.map((item) => ({
    id: item.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = MONTHLY_TREND_IDEAS.find((i) => i.id === params.id) || MONTHLY_TREND_IDEAS[0];
  return {
    title: `${item.title} — Girişimbee Trend Fikirler`,
    description: item.tagline,
  };
}

export default function TrendIdeaDetailPage({ params }: PageProps) {
  const item = MONTHLY_TREND_IDEAS.find((i) => i.id === params.id) || MONTHLY_TREND_IDEAS[0];
  return <TrendIdeaDetailView item={item} />;
}
