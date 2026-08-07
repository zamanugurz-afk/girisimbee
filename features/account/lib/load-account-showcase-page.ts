import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import {
  buildShowcaseStats,
  mapPlacementToShowcaseCard,
} from '@/features/account/lib/map-placement-to-showcase-card';
import type { AccountShowcasePageLoadResult } from '@/features/account/types/account-showcase-page.types';
import type { AccountShowcaseCardData } from '@/features/account/types/account-showcase.types';

/** Server loader for /hesabim/vitrinlerim */
export async function loadAccountShowcasePage(
  userId: string,
): Promise<AccountShowcasePageLoadResult> {
  try {
    const supabase = createClient();
    const container = getServerContainer(supabase);
    const placements = await container.listingPlacementService.getPlacements(
      ids.user(userId),
    );

    const listingIds = [...new Set(placements.map((p) => p.listingId))];
    const listings = await Promise.all(
      listingIds.map((id) => container.listingRepository.findById(id)),
    );
    const listingById = new Map(
      listings
        .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing))
        .map((listing) => [listing.id, listing]),
    );

    const favoriteCounts = await container.favoriteRepository
      .countActiveByListingIds(listingIds)
      .catch(() => new Map());

    const items: AccountShowcaseCardData[] = placements.map((placement) =>
      mapPlacementToShowcaseCard(
        placement,
        listingById.get(placement.listingId) ?? null,
        favoriteCounts.get(placement.listingId) ?? 0,
      ),
    );

    return {
      ok: true,
      data: {
        items,
        stats: buildShowcaseStats(items),
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Vitrin paketleri yüklenemedi.';
    return { ok: false, error: message };
  }
}
