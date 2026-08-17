import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { Company } from '@/features/companies/types/company.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import type {
  DigitalSolutionConsumerProfile,
  DigitalSolutionProfile,
} from '@/features/digital-solution-matching/types';

export function isDigitalSolutionListing(listing: Listing): boolean {
  if (listing.categoryId === CATEGORY_IDS.dijitalAi) return true;
  if (listing.listingTypeId === LISTING_TYPE_IDS.dijitalAiDefault) return true;
  const slug = String(listing.slug || '').toLowerCase();
  return slug.startsWith('dijital-ai') || slug.startsWith('ai-');
}

export function normalizeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(item))
      .filter((item): item is string => item !== null);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,;\n]+/)
      .map((item) => normalizeText(item))
      .filter((item): item is string => item !== null);
  }
  return [];
}

/**
 * Maps Company.employeeCount to standard target audience tags.
 */
export function employeeCountToTargetAudiences(size: string | null | undefined): string[] {
  if (!size) return [];
  switch (size) {
    case '1-10':
      return ['Startup', 'KOBİ', 'Bireysel girişimci'];
    case '11-50':
      return ['KOBİ', 'Startup'];
    case '51-200':
      return ['KOBİ', 'Kurumsal'];
    case '201-500':
    case '500+':
      return ['Kurumsal'];
    default:
      return ['KOBİ', 'Startup'];
  }
}

/**
 * Normalizes a Digital & AI solution listing into a DigitalSolutionProfile.
 */
export function extractDigitalSolutionProfile(listing: Listing): DigitalSolutionProfile {
  const cf = (listing.customFields && typeof listing.customFields === 'object' ? listing.customFields : {}) as Record<string, unknown>;

  return {
    listingId: String(listing.id),
    title: listing.title || '',
    shortDescription: listing.shortDescription || '',
    solutionType: normalizeText(cf.solutionType),
    deliveryModel: normalizeText(cf.deliveryModel),
    targetAudience: normalizeText(cf.targetAudience),
    priceRange: normalizeText(cf.priceRange),
    demoUrl: normalizeText(cf.demoUrl),
    capabilities: normalizeStringList(cf.capabilities),
    supportedLanguages: normalizeStringList(cf.supportedLanguages),
    industry: normalizeText(listing.industry) || normalizeText(cf.sector) || normalizeText(cf.industry),
    city: normalizeText(listing.city) || normalizeText(cf.city),
    location: normalizeText(listing.location) || normalizeText(cf.location),
    publishedAt: listing.publishedAt || null,
  };
}

/**
 * Builds a DigitalSolutionConsumerProfile from available context:
 * Priority: Company > Profile > Listing
 */
export function buildDigitalSolutionConsumerProfile(context: {
  company?: Company | null;
  profile?: Profile | null;
  activeListings?: Listing[];
  sourceSolutionListing?: Listing | null;
}): DigitalSolutionConsumerProfile {
  const { company, profile, activeListings, sourceSolutionListing } = context;

  // If matching from a source solution detail page (/ilan/[slug])
  if (sourceSolutionListing && isDigitalSolutionListing(sourceSolutionListing)) {
    const sourceProfile = extractDigitalSolutionProfile(sourceSolutionListing);
    return {
      companyId: sourceSolutionListing.companyId,
      userId: sourceSolutionListing.ownerId,
      companyName: null,
      industry: sourceProfile.industry,
      companySize: null,
      targetAudienceHints: sourceProfile.targetAudience ? [sourceProfile.targetAudience] : [],
      neededCapabilities: sourceProfile.capabilities,
      preferredSolutionTypes: sourceProfile.solutionType ? [sourceProfile.solutionType] : [],
      preferredDeliveryModels: sourceProfile.deliveryModel ? [sourceProfile.deliveryModel] : [],
      priceBudget: sourceProfile.priceRange,
      city: sourceProfile.city,
      location: sourceProfile.location,
      languages: sourceProfile.supportedLanguages,
    };
  }

  // 1. Primary context: Company
  if (company) {
    const audiences = employeeCountToTargetAudiences(company.employeeCount);
    return {
      companyId: company.id,
      userId: company.ownerId,
      companyName: company.name,
      industry: normalizeText(company.industry),
      companySize: normalizeText(company.employeeCount),
      targetAudienceHints: audiences,
      neededCapabilities: [],
      preferredSolutionTypes: [],
      preferredDeliveryModels: [],
      priceBudget: null,
      city: normalizeText(company.city),
      location: normalizeText(company.location),
      languages: ['Türkçe'],
    };
  }

  // 2. Secondary context: Profile
  if (profile) {
    return {
      userId: profile.userId,
      companyName: normalizeText(profile.companyName),
      industry: null,
      companySize: null,
      targetAudienceHints: ['Startup', 'KOBİ', 'Bireysel girişimci'],
      neededCapabilities: normalizeStringList(profile.skills),
      preferredSolutionTypes: [],
      preferredDeliveryModels: [],
      priceBudget: null,
      city: normalizeText(profile.city),
      location: normalizeText(profile.location),
      languages: ['Türkçe'],
    };
  }

  // 3. Context from active user listings (e.g. Hiring or Partner listing)
  if (activeListings && activeListings.length > 0) {
    const first = activeListings[0];
    const cf = (first?.customFields || {}) as Record<string, unknown>;
    const industry = normalizeText(first?.industry) || normalizeText(cf.primarySector) || normalizeText(cf.sector);
    return {
      userId: first?.ownerId,
      industry,
      companySize: null,
      targetAudienceHints: ['Startup', 'KOBİ'],
      neededCapabilities: normalizeStringList(cf.technicalSkills || cf.requiredSkills),
      preferredSolutionTypes: [],
      preferredDeliveryModels: [],
      priceBudget: null,
      city: normalizeText(first?.city),
      location: normalizeText(first?.location),
      languages: ['Türkçe'],
    };
  }

  // Empty fallback
  return {
    industry: null,
    companySize: null,
    targetAudienceHints: [],
    neededCapabilities: [],
    preferredSolutionTypes: [],
    preferredDeliveryModels: [],
    priceBudget: null,
    city: null,
    location: null,
    languages: [],
  };
}
