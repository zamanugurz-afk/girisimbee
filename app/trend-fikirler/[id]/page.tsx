import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrendIdeaDetailView } from '@/components/girisimco/trend-ideas/TrendIdeaDetailView';
import { MONTHLY_TREND_IDEAS } from '@/lib/data/monthly-trend-ideas';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = MONTHLY_TREND_IDEAS.find((i) => i.id === params.id);
  if (!item) {
    return { title: 'Trend İş Fikri Bulunamadı — Girişimbee' };
  }
  return {
    title: `${item.title} — Girişimbee Trend Fikirler`,
    description: item.tagline,
  };
}

export default function TrendIdeaDetailPage({ params }: PageProps) {
  const item = MONTHLY_TREND_IDEAS.find((i) => i.id === params.id);
  if (!item) notFound();
  return <TrendIdeaDetailView item={item} />;
}
