import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { FranchiseBuyProfile } from '@/features/profiles/types/franchise-profile.types';
import type { Company } from '@/features/companies/types/company.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { FRANCHISE_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';
import { MARKETPLACE_LISTING_TYPE_IDS } from '@/features/listings/config/marketplace-category-map';
import type {
  FranchiseOpportunityProfile,
  FranchiseSeekerProfile,
} from '@/features/franchise-matching/types';

export function isFranchiseListing(listing: Listing): boolean {
  if (listing.categoryId === CATEGORY_IDS.bayilikAl) return true;
  if (
    listing.listingTypeId === LISTING_TYPE_IDS.franchiseGiveDefault ||
    listing.listingTypeId === FRANCHISE_LISTING_TYPE_IDS.give ||
    listing.listingTypeId === FRANCHISE_LISTING_TYPE_IDS.buy ||
    listing.listingTypeId === MARKETPLACE_LISTING_TYPE_IDS.bayilikAl ||
    listing.listingTypeId === MARKETPLACE_LISTING_TYPE_IDS.bayilikVer
  ) {
    return true;
  }
  const slug = String(listing.slug || '').toLowerCase();
  return slug.startsWith('franchise-') || slug.startsWith('bayilik-');
}

export function normalizeString(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

export function normalizeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const clean = value.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(clean);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,;\n]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

export function formatFranchiseMoney(amount: number | null | undefined): string | null {
  if (amount == null || !Number.isFinite(amount)) return null;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Extracts canonical FranchiseOpportunityProfile from a published listing.
 */
export function extractFranchiseOpportunityProfile(listing: Listing): FranchiseOpportunityProfile {
  const cf = (listing.customFields && typeof listing.customFields === 'object'
    ? listing.customFields
    : {}) as Record<string, unknown>;

  const availableCities = normalizeStringArray(cf.availableCities);
  if (availableCities.length === 0 && listing.city) {
    availableCities.push(listing.city);
  }

  const totalInvestment = normalizeNumber(cf.totalInvestment) || normalizeNumber(cf.minimumSermaye);
  const minCapital = normalizeNumber(cf.minCapitalRequirement) || normalizeNumber(cf.minimumSermaye);
  const franchiseFee = normalizeNumber(cf.franchiseFee) || normalizeNumber(cf.franchiseBedeli);

  return {
    listingId: String(listing.id),
    slug: listing.slug,
    title: listing.title || '',
    companyName: normalizeText(cf.companyName) || normalizeText(listing.title),
    sector: normalizeText(cf.sector) || normalizeText(listing.industry),
    businessCategory: normalizeText(cf.businessCategory),
    totalInvestment,
    minCapitalRequirement: minCapital,
    franchiseFee,
    availableCities,
    districts: normalizeText(cf.districts) || normalizeText(listing.district),
    minSquareMeters: normalizeNumber(cf.minSquareMeters),
    storeSize: normalizeText(cf.storeSize),
    mallAvailable: typeof cf.mallAvailable === 'boolean' ? cf.mallAvailable : null,
    streetStoreAvailable: typeof cf.streetStoreAvailable === 'boolean' ? cf.streetStoreAvailable : null,
    experienceRequirement: normalizeText(cf.experienceRequirement),
    returnPeriod: normalizeText(cf.returnPeriod),
    branchCount: normalizeNumber(cf.branchCount),
    publishedAt: listing.publishedAt || null,
  };
}

/**
 * Builds FranchiseSeekerProfile from available consumer context:
 * Priority: FranchiseBuyProfile > Company > Profile > Source Listing Context
 */
export function buildFranchiseSeekerProfile(context: {
  buyProfile?: FranchiseBuyProfile | null;
  company?: Company | null;
  profile?: Profile | null;
  sourceOpportunityListing?: Listing | null;
}): FranchiseSeekerProfile {
  const { buyProfile, company, profile, sourceOpportunityListing } = context;

  // 1. Primary Context: Dedicated Franchise Buy Profile
  if (buyProfile) {
    return {
      profileId: buyProfile.profileId,
      sector: normalizeText(buyProfile.sektor),
      city: normalizeText(buyProfile.sehir),
      district: normalizeText(buyProfile.ilce),
      minimumInvestment: normalizeNumber(buyProfile.minimumYatirim),
      maximumInvestment: normalizeNumber(buyProfile.maksimumYatirim),
      preferredLocation: normalizeText(buyProfile.tercihEdilenLokasyon),
      businessCategory: null,
      experience: normalizeText(buyProfile.isletmeTecrubesi),
      mallPreference: buyProfile.tercihEdilenLokasyon?.toLowerCase().includes('avm') ?? null,
      streetStorePreference: buyProfile.tercihEdilenLokasyon?.toLowerCase().includes('cadde') ?? null,
    };
  }

  // 2. Source Opportunity Listing Context (for detail page recommendations /franchise/buy/[slug])
  if (sourceOpportunityListing && isFranchiseListing(sourceOpportunityListing)) {
    const opp = extractFranchiseOpportunityProfile(sourceOpportunityListing);
    return {
      companyId: sourceOpportunityListing.companyId,
      userId: sourceOpportunityListing.ownerId,
      sector: opp.sector,
      city: opp.availableCities[0] ?? sourceOpportunityListing.city,
      district: opp.districts ?? sourceOpportunityListing.district,
      minimumInvestment: opp.totalInvestment ? opp.totalInvestment * 0.75 : null,
      maximumInvestment: opp.totalInvestment ? opp.totalInvestment * 1.25 : null,
      preferredLocation: opp.mallAvailable ? 'AVM' : opp.streetStoreAvailable ? 'Cadde' : null,
      businessCategory: opp.businessCategory,
      experience: opp.experienceRequirement,
      mallPreference: opp.mallAvailable,
      streetStorePreference: opp.streetStoreAvailable,
    };
  }

  // 3. Company Context
  if (company) {
    return {
      companyId: company.id,
      userId: company.ownerId,
      sector: normalizeText(company.industry),
      city: normalizeText(company.city),
      district: null,
      minimumInvestment: null,
      maximumInvestment: null,
      preferredLocation: normalizeText(company.location),
      businessCategory: null,
      experience: company.employeeCount ? '1-3 yıl işletme deneyimi' : null,
      mallPreference: null,
      streetStorePreference: null,
    };
  }

  // 4. User Profile Context
  if (profile) {
    return {
      userId: profile.userId,
      sector: null,
      city: normalizeText(profile.city),
      district: null,
      minimumInvestment: null,
      maximumInvestment: null,
      preferredLocation: normalizeText(profile.location),
      businessCategory: null,
      experience: null,
      mallPreference: null,
      streetStorePreference: null,
    };
  }

  // Empty fallback
  return {
    sector: null,
    city: null,
    district: null,
    minimumInvestment: null,
    maximumInvestment: null,
    preferredLocation: null,
    businessCategory: null,
    experience: null,
    mallPreference: null,
    streetStorePreference: null,
  };
}
