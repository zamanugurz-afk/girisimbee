import type { Listing } from '@/features/listings/types/listing.entity.types';
import type {
  DigitalSolutionMatchCard,
  DigitalSolutionMatchResult,
} from '@/features/digital-solution-matching/types';
import { extractDigitalSolutionProfile } from '@/features/digital-solution-matching/normalize';

export function toPublicDigitalSolutionMatchCard(
  listing: Listing,
  result: DigitalSolutionMatchResult,
): DigitalSolutionMatchCard | null {
  if (result.band === 'below_threshold' || result.score < 50) {
    return null;
  }

  const profile = extractDigitalSolutionProfile(listing);

  return {
    listingId: String(listing.id),
    slug: listing.slug,
    href: `/ilan/${listing.slug || listing.id}`,
    title: profile.title,
    shortDescription: profile.shortDescription,
    solutionType: profile.solutionType,
    deliveryModel: profile.deliveryModel,
    targetAudience: profile.targetAudience,
    priceRange: profile.priceRange,
    capabilities: profile.capabilities,
    city: profile.city,
    industry: profile.industry,
    publishedAt: profile.publishedAt,
    score: result.score,
    band: result.band,
    bandLabel: result.bandLabel,
    reasons: result.reasons,
  };
}

export function assertNoDigitalSolutionContactLeak(data: unknown): void {
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
      throw new Error(`[assertNoDigitalSolutionContactLeak] Security violation: leaked private field matching ${pattern}`);
    }
  }
}
