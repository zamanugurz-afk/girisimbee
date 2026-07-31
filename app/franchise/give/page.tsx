import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { FranchiseBrowseView } from '@/features/franchise/components/franchise-browse-view';
import { franchiseListingBrowseQuerySchema } from '@/lib/api/validation/franchise-listings';

export const metadata: Metadata = {
  title: 'Bayilik Ver — Franchise İlanları | Girisimco',
  description: 'Markanızı franchise olarak büyütün.',
};

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function FranchiseGivePage({ searchParams }: PageProps) {
  const filters = franchiseListingBrowseQuerySchema.parse({
    city: typeof searchParams.city === 'string' ? searchParams.city : undefined,
    district: typeof searchParams.district === 'string' ? searchParams.district : undefined,
    sector: typeof searchParams.sector === 'string' ? searchParams.sector : undefined,
  });

  const container = getServerContainer(createClient());
  const result = await container.ecosystem.franchiseService.browseGiveSeekers(filters);

  return (
    <FranchiseBrowseView
      flow="give"
      listings={result.data}
      title="Bayilik Ver"
      description="Franchise arayanları keşfedin veya ilan verin."
      filters={filters}
    />
  );
}
