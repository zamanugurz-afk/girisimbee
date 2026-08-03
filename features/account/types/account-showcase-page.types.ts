import type {
  AccountShowcaseCardData,
  AccountShowcaseStatsData,
} from '@/features/account/types/account-showcase.types';

export interface AccountShowcasePageData {
  items: AccountShowcaseCardData[];
  stats: AccountShowcaseStatsData;
}

export type AccountShowcasePageLoadResult =
  | { ok: true; data: AccountShowcasePageData }
  | { ok: false; error: string };
