import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import { mapFavoriteListingToAccountCard } from '@/features/account/lib/map-favorite-listing-to-card';
import type { AccountFavoritesPageLoadResult } from '@/features/account/types/account-favorites-page.types';
import type { AccountFavoriteCardData } from '@/features/account/types/account-favorites.types';

/** Server loader for /dashboard/favorilerim and /hesabim/favorilerim */
export async function loadAccountFavoritesPage(
  userId: string,
): Promise<AccountFavoritesPageLoadResult> {
  try {
    const supabase = createClient();
    const container = getServerContainer(supabase);
    const favorites = await container.favoriteListingService.getFavorites(
      ids.user(userId),
    );

    const cards: AccountFavoriteCardData[] = [];
    for (const favorite of favorites) {
      const listing = await container.listingRepository.findById(favorite.listingId);
      if (!listing) continue;

      let coverImageUrl: string | null = null;
      try {
        const images = await container.listingImageRepository.findByListingId(
          favorite.listingId,
        );
        const sorted = [...images].sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        );
        coverImageUrl = sorted[0]?.url ?? null;
      } catch {
        coverImageUrl = null;
      }

      cards.push(mapFavoriteListingToAccountCard(favorite, listing, coverImageUrl));
    }

    return { ok: true, data: cards };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Favoriler yüklenemedi.';
    return { ok: false, error: message };
  }
}
