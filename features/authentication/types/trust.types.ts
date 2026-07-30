/** Trust badge flags shown across profile, listing, search, and messaging surfaces. */
export interface TrustBadges {
  user: boolean;
  company: boolean;
  investor: boolean;
}

export function hasAnyTrustBadge(trust: TrustBadges): boolean {
  return trust.user || trust.company || trust.investor;
}

export function trustFromProfile(profile?: {
  isVerified?: boolean;
  investorVerified?: boolean;
} | null): Pick<TrustBadges, 'user' | 'investor'> {
  return {
    user: profile?.isVerified ?? false,
    investor: profile?.investorVerified ?? false,
  };
}

export function trustFromCompany(company?: { isVerified?: boolean } | null): boolean {
  return company?.isVerified ?? false;
}
