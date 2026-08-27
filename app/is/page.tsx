import type { Metadata } from 'next';
import { CareerHubLanding } from '@/components/girisimco/home/career-hub-landing';
import { parseCareerFlowParam } from '@/components/girisimco/home/home-marketplace.data';
import {
  buildCategoryMetadata,
  CategoryMarketplacePage,
} from '@/features/listings/components/category-marketplace-page';

/**
 * /is — Kariyer ve İş Fırsatları selection landing.
 * /is?flow=seek|hire — existing unified job browse (unchanged chips/filters).
 */
const CATEGORY_SLUG = 'ise-al';

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ flow?: string }>;
}): Promise<Metadata> {
  const sp = searchParams ? await searchParams : {};
  const flow = parseCareerFlowParam(sp?.flow);
  if (flow === 'seek') {
    return {
      title: 'İş Arıyorum — Aday İlanları | Girisimbee',
      description: 'Yetenek ve aday profillerini inceleyin, aradığınız pozisyona uygun adaylarla doğrudan bağlantı kurun.',
    };
  }
  if (flow === 'hire') {
    return {
      title: 'İşe Alıyorum — İş İlanları | Girisimbee',
      description: 'Şirketlerin açık iş pozisyonlarını ve kariyer fırsatlarını inceleyin, kariyerinize uygun ilana başvurun.',
    };
  }

  return {
    title: 'Kariyer ve İş Fırsatları | Girisimbee',
    description:
      'İş fırsatlarını keşfetmek veya doğru yeteneği bulmak için size uygun yolu seçin.',
  };
}

export default async function IsListingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ flow?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const jobFlow = parseCareerFlowParam(sp?.flow);

  if (!jobFlow) {
    return <CareerHubLanding />;
  }

  const isSeek = jobFlow === 'seek';

  return (
    <CategoryMarketplacePage
      categorySlug={CATEGORY_SLUG}
      showJobFlowFilters={false}
      initialJobFlow={jobFlow}
      title={isSeek ? 'İş Arıyorum — Aday İlanları' : 'İşe Alıyorum — İş İlanları'}
      description={
        isSeek
          ? 'Yetenek ve aday profillerini inceleyin, uygun pozisyonlar için doğrudan bağlantı kurun.'
          : 'Şirketlerin açık iş pozisyonlarını inceleyin, kariyerinize uygun ilana başvurun.'
      }
      accent={isSeek ? '#0EA5E9' : '#10B981'}
      backHref="/is"
      backLabel="Kariyer Menüsüne Dön"
      resultNoun={isSeek ? 'aday ilanı' : 'iş ilanı'}
      relatedCategorySlugs={[]}
    />
  );
}
