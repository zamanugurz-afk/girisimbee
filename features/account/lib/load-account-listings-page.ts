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

/** Server loader for /dashboard/ilanlarim — owner listings + real-time views, favorites and contact requests */
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

    // 1. Fetch real-time count of active favorites from marketplace_favorites
    const favoriteCounts = await container.favoriteRepository
      .countActiveByListingIds(listingIds)
      .catch(() => new Map());

    // 2. Fetch real-time count of contact requests from marketplace_listing_contact_requests
    const contactCounts = new Map<string, number>();
    if (listingIds.length > 0) {
      const { data: contactRows } = await supabase
        .from('marketplace_listing_contact_requests')
        .select('listing_id')
        .in('listing_id', listingIds);

      for (const row of contactRows ?? []) {
        const id = row.listing_id as string;
        contactCounts.set(id, (contactCounts.get(id) ?? 0) + 1);
      }
    }

    const data: AccountListingCardData[] = page.data.map((listing) => {
      const liveFavorites = favoriteCounts.get(listing.id) ?? 0;
      const liveContacts = contactCounts.get(listing.id) ?? 0;
      return mapListingToAccountCard(listing, liveFavorites, liveContacts);
    });

    return { ok: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'İlanlar yüklenemedi.';
    return { ok: false, error: message };
  }
}
