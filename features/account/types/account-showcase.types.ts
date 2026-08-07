/** Account panel — showcase (vitrin) UI types. */

export type AccountShowcasePackageType = 'vitrin' | 'acil_vitrin';

export type AccountShowcaseStatus = 'active' | 'expiring' | 'expired';

export type AccountShowcaseTab = 'all' | 'vitrin' | 'acil_vitrin';

export interface AccountShowcaseCardData {
  id: string;
  listingTitle: string;
  listingHref: string;
  packageType: AccountShowcasePackageType;
  startsAt: string;
  endsAt: string;
  remainingLabel: string;
  viewCount: number;
  favoriteCount: number;
  clickCount: number;
  status: AccountShowcaseStatus;
}

export interface AccountShowcaseStatsData {
  activePackageCount: number;
  totalViews: number;
  totalFavorites: number;
  totalClicks: number;
}
