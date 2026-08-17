import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { FranchiseBrowseView } from '@/features/franchise/components/franchise-browse-view';
import { franchiseListingBrowseQuerySchema } from '@/lib/api/validation/franchise-listings';
import {
  FRANCHISE_BROWSE_DESCRIPTION,
  FRANCHISE_BROWSE_TITLE,
} from '@/features/franchise/presentation/franchise-copy';

export const metadata: Metadata = {
  title: 'Franchise Fırsatları | Girisimbee',
  description: FRANCHISE_BROWSE_DESCRIPTION,
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
  const result = await container.ecosystem.franchiseService.browseBuyOpportunities(filters);

  return (
    <FranchiseBrowseView
      flow="buy"
      listings={result.data}
      title={FRANCHISE_BROWSE_TITLE}
      description={FRANCHISE_BROWSE_DESCRIPTION}
      filters={filters}
    />
  );
}
