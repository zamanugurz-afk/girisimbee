import type { Listing } from '@/features/listings/types/listing.entity.types';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import type {
  BusinessTransferOpportunityProfile,
  BusinessTransferSeekerProfile,
} from '@/features/business-transfer-matching/types';

export function normalizeString(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .trim()
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
    .replace(/\s+/g, ' ');
}

export function isBusinessTransferListing(listing: Listing): boolean {
  if (!listing) return false;
  if (listing.categoryId === CATEGORY_IDS.isletmeDevri) return true;
  if (
    listing.listingTypeId === LISTING_TYPE_IDS.businessTransferSellDefault ||
    listing.listingTypeId === LISTING_TYPE_IDS.businessTransferBuyDefault
  ) {
    return true;
  }
  const customIntent = listing.customFields?.transferIntent || listing.customFields?.businessTransferIntent;
  if (customIntent === 'sell' || customIntent === 'buy') return true;
  return false;
}

export function extractBusinessTransferOpportunity(listing: Listing): BusinessTransferOpportunityProfile {
  const custom = listing.customFields || {};
  const transferPrice = Number(custom.transferPrice || listing.price) || null;
  const monthlyRent = Number(custom.monthlyRent) || null;
  const businessAge = Number(custom.businessAge) || null;
  const employeeCount = Number(custom.employeeCount) || null;
  const rawScope = custom.transferScope;
  const transferScope = Array.isArray(rawScope)
    ? rawScope.map(String)
    : typeof rawScope === 'string'
      ? rawScope.split(',').map((s) => s.trim())
      : [];

  return {
    listingId: String(listing.id),
    slug: listing.slug,
    title: listing.title,
    businessName: String(custom.businessName || listing.title || ''),
    businessType: String(custom.businessType || ''),
    sector: String(custom.sector || listing.industry || ''),
    city: String(custom.city || listing.city || ''),
    district: String(custom.district || listing.location || ''),
    transferPrice,
    monthlyRent,
    businessAge,
    employeeCount,
    operationalStatus: String(custom.operationalStatus || ''),
    transferScope,
    reasonForTransfer: String(custom.reasonForTransfer || ''),
    postTransferSupport: String(custom.postTransferSupport || ''),
    financialSummary: String(custom.financialSummary || ''),
    publishedAt: listing.publishedAt || listing.createdAt || null,
  };
}

export function extractBusinessTransferSeeker(listingOrSource: {
  listing?: Listing | null;
  customFields?: Record<string, unknown> | null;
  city?: string | null;
  district?: string | null;
  budgetMax?: number | null;
  preferredSectors?: string[];
  preferredBusinessTypes?: string[];
  operationalPreference?: string | null;
  preferredStatus?: string | null;
  relevantExperience?: string | null;
}): BusinessTransferSeekerProfile {
  const listing = listingOrSource.listing;
  const custom = listing?.customFields || listingOrSource.customFields || {};

  const budgetMax =
    Number(
      listingOrSource.budgetMax ||
        custom.budgetMax ||
        custom.budget ||
        custom.investmentBudget ||
        listing?.price,
    ) || null;

  const rawSectors = listingOrSource.preferredSectors || custom.preferredSectors || custom.sector || [];
  const preferredSectors = Array.isArray(rawSectors)
    ? rawSectors.map(String)
    : typeof rawSectors === 'string'
      ? [rawSectors]
      : [];

  const rawTypes =
    listingOrSource.preferredBusinessTypes || custom.preferredBusinessTypes || custom.businessType || [];
  const preferredBusinessTypes = Array.isArray(rawTypes)
    ? rawTypes.map(String)
    : typeof rawTypes === 'string'
      ? [rawTypes]
      : [];

  return {
    userId: listing?.ownerId,
    budgetMax,
    preferredSectors,
    preferredBusinessTypes,
    city: String(listingOrSource.city || custom.city || listing?.city || ''),
    district: String(listingOrSource.district || custom.district || listing?.location || ''),
    operationalPreference: String(
      listingOrSource.operationalPreference || custom.operationalPreference || '',
    ),
    preferredStatus: String(listingOrSource.preferredStatus || custom.preferredStatus || ''),
    relevantExperience: String(
      listingOrSource.relevantExperience || custom.relevantExperience || custom.experience || '',
    ),
  };
}

export function formatPriceCurrency(price: number | null): string | null {
  if (!price || Number.isNaN(price)) return null;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(price);
}
