import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { FranchiseBrowseView } from '@/features/franchise/components/franchise-browse-view';
import { franchiseListingBrowseQuerySchema } from '@/lib/api/validation/franchise-listings';

export const metadata: Metadata = {
  title: 'Franchise İlanları | Girisimco',
  description: 'Yayınlanan franchise fırsatlarını keşfedin.',
};

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function FranchiseBuyPage({ searchParams }: PageProps) {
  const filters = franchiseListingBrowseQuerySchema.parse({
    city: typeof searchParams.city === 'string' ? searchParams.city : undefined,
    district: typeof searchParams.district === 'string' ? searchParams.district : undefined,
    sector: typeof searchParams.sector === 'string' ? searchParams.sector : undefined,
  });

  const container = getServerContainer(createClient());
  // Posted franchise ads only (franchise-give / ilan ver).
  const result = await container.ecosystem.franchiseService.browseBuyOpportunities(filters);

  return (
    <FranchiseBrowseView
      flow="buy"
      listings={result.data}
      title="Franchise"
      description="Yayınlanan franchise ilanlarını keşfedin."
      filters={filters}
    />
  );
}
