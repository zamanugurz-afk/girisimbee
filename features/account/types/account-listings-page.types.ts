import type { AccountListingCardData } from '@/features/account/types/account-listings.types';

export type AccountListingsPageLoadResult =
  | { ok: true; data: AccountListingCardData[] }
  | { ok: false; error: string };
