import type { Listing } from '@/features/listings/types/listing.entity.types';
import type {
  FranchiseMatchCard,
  FranchiseMatchResult,
} from '@/features/franchise-matching/types';
import {
  extractFranchiseOpportunityProfile,
  formatFranchiseMoney,
} from '@/features/franchise-matching/normalize';

export function toPublicFranchiseMatchCard(
  listing: Listing,
  result: FranchiseMatchResult,
): FranchiseMatchCard | null {
  if (result.band === 'below_threshold' || result.score < 50) {
    return null;
  }

  const profile = extractFranchiseOpportunityProfile(listing);

  const loc = profile.availableCities.includes('Tüm Türkiye')
    ? 'Tüm Türkiye'
    : profile.availableCities.slice(0, 2).join(', ');

  return {
    listingId: String(listing.id),
    slug: listing.slug,
    href: `/franchise/buy/${listing.slug || listing.id}`,
    title: profile.title,
    companyName: profile.companyName,
    sector: profile.sector,
    businessCategory: profile.businessCategory,
    totalInvestment: profile.totalInvestment,
    formattedInvestment: formatFranchiseMoney(profile.totalInvestment),
    location: loc || listing.city || null,
    availableCities: profile.availableCities,
    publishedAt: profile.publishedAt,
    score: result.score,
    band: result.band,
    bandLabel: result.bandLabel,
    reasons: result.reasons,
  };
}

export function assertNoFranchiseContactLeak(data: unknown): void {
  const json = JSON.stringify(data);
  const leakPatterns = [
    /"contactPhone":\s*"[^"]+"/,
    /"contactEmail":\s*"[^"]+"/,
    /"contactWhatsapp":\s*"[^"]+"/,
    /"contactWebsite":\s*"[^"]+"/,
    /"ownerUserId":\s*"[^"]+"/,
    /"createdBy":\s*"[^"]+"/,
    /"customFields":\s*\{/,
  ];

  for (const pattern of leakPatterns) {
    if (new RegExp(pattern).test(json)) {
      throw new Error(`[assertNoFranchiseContactLeak] Security violation: leaked private field matching ${pattern}`);
    }
  }
}
