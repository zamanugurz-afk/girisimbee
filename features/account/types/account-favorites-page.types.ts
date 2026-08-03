import type { AccountFavoriteCardData } from '@/features/account/types/account-favorites.types';

export type AccountFavoritesPageLoadResult =
  | { ok: true; data: AccountFavoriteCardData[] }
  | { ok: false; error: string };
