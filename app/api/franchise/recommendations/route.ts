import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { createFranchiseMatchService } from '@/features/franchise-matching/service';
import { assertNoFranchiseContactLeak } from '@/features/franchise-matching/adapters/public-card';
import { uuidSchema } from '@/lib/domain/validation';
import type { ListingId } from '@/lib/domain/ids';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingIdOrSlug = searchParams.get('listingId') || searchParams.get('id') || searchParams.get('slug');

    if (!listingIdOrSlug) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    const supabase = createClient();
    const container = getServerContainer(supabase);

    const isUuid = uuidSchema.safeParse(listingIdOrSlug).success;
    const listing = isUuid
      ? await container.listingRepository.findById(listingIdOrSlug as ListingId)
      : await container.listingRepository.findBySlug(listingIdOrSlug);

    if (!listing || listing.status !== 'published') {
      return NextResponse.json({ section: null });
    }

    const service = createFranchiseMatchService(container);
    const section = await service.getListingRecommendations(listing);

    if (section) {
      assertNoFranchiseContactLeak(section);
    }

    return NextResponse.json({ section });
  } catch (error) {
    console.error('Error fetching franchise recommendations for listing:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
