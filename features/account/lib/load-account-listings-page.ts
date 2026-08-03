import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import { mapListingToAccountCard } from '@/features/account/lib/map-listing-to-account-card';
import type { AccountListingsPageLoadResult } from '@/features/account/types/account-listings-page.types';
import type { AccountListingCardData } from '@/features/account/types/account-listings.types';
import type { ListingStatus } from '@/features/listings/types/listing.entity.types';

const OWNER_STATUSES: ListingStatus[] = [
  'draft',
  'pending_review',
  'published',
  'paused',
  'expired',
  'archived',
  'rejected',
  'sold',
];

/** Server loader for /hesabim/ilanlarim — owner listings + view_count */
export async function loadAccountListingsPage(
  userId: string,
): Promise<AccountListingsPageLoadResult> {
  try {
    const supabase = createClient();
    const container = getServerContainer(supabase);
    const ownerId = ids.user(userId);

    const page = await container.listingRepository.paginate(
      { ownerId, status: OWNER_STATUSES },
      { page: 1, limit: 100 },
    );

    const listingIds = page.data.map((listing) => listing.id);
    const favoriteCounts = await container.favoriteRepository
      .countActiveByListingIds(listingIds)
      .catch(() => new Map());

    const data: AccountListingCardData[] = page.data.map((listing) =>
      mapListingToAccountCard(listing, favoriteCounts.get(listing.id) ?? 0),
    );

    return { ok: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'İlanlar yüklenemedi.';
    return { ok: false, error: message };
  }
}
