import type { ListingFormValues } from '@/features/listings/form/category-listing-form';
import type { FranchiseListingPayload } from '@/features/franchise/types/franchise-listing.types';

function readString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function readNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num) : null;
}

function readBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined) return null;
  return Boolean(value);
}

function readStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const items = value.map((item) => String(item).trim()).filter(Boolean);
  return items.length > 0 ? items : null;
}

/** Normalize bare domains to https URLs for externalContactSchema.contactWebsite. */
function readContactWebsite(value: unknown): string | null {
  const text = readString(value);
  if (!text) return null;

  const withProtocol = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    new URL(withProtocol);
    return withProtocol;
  } catch {
    return null;
  }
}

/** Map wizard values → franchise give listing publish payload. */
export function listingFormValuesToFranchiseGivePayload(
  values: ListingFormValues,
): FranchiseListingPayload & { flow: 'give' } {
  const { core, customFields, images } = values;
  const sortedImages = [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const imageUrls = sortedImages.map((img) => img.url).filter(Boolean);
  const availableCities = readStringArray(customFields.availableCities);
  const primaryCity = availableCities?.[0] ?? core.city ?? null;

  return {
    flow: 'give',
    title: core.title,
    shortDescription: core.shortDescription,
    longDescription: core.longDescription || undefined,
    city: primaryCity,
    district: readString(customFields.districts),
    sector: readString(customFields.sector),
    contactWebsite: readContactWebsite(customFields.website),
    companyName: readString(customFields.companyName),
    establishmentYear: readNumber(customFields.establishmentYear),
    branchCount: readNumber(customFields.branchCount),
    website: readString(customFields.website),
    entryFee: readNumber(customFields.entryFee),
    franchiseFee: readNumber(customFields.franchiseFee),
    totalInvestment: readNumber(customFields.totalInvestment),
    profitMargin: readNumber(customFields.profitMargin),
    royaltyFee: readNumber(customFields.royaltyFee),
    advertisingFee: readNumber(customFields.advertisingFee),
    returnPeriod: readString(customFields.returnPeriod),
    averageSetupDuration: readString(customFields.averageSetupDuration),
    minSquareMeters: readNumber(customFields.minSquareMeters),
    availableCities,
    districts: readString(customFields.districts),
    minPopulation: readNumber(customFields.minPopulation),
    storeSize: readString(customFields.storeSize),
    mallAvailable: readBoolean(customFields.mallAvailable),
    streetStoreAvailable: readBoolean(customFields.streetStoreAvailable),
    businessCategory: readString(customFields.businessCategory),
    employeeCount: readNumber(customFields.employeeCount),
    dailyCustomerCapacity: readNumber(customFields.dailyCustomerCapacity),
    workingHours: readString(customFields.workingHours),
    trainingSupport: readBoolean(customFields.trainingSupport),
    operationalSupport: readBoolean(customFields.operationalSupport),
    marketingSupport: readBoolean(customFields.marketingSupport),
    minCapitalRequirement: readNumber(customFields.minCapitalRequirement),
    experienceRequirement: readString(customFields.experienceRequirement),
    educationRequirement: readString(customFields.educationRequirement),
    companyEstablishmentRequired: readBoolean(customFields.companyEstablishmentRequired),
    guaranteeRequirement: readString(customFields.guaranteeRequirement),
    introductionVideoUrl: readString(customFields.introductionVideoUrl),
    presentationPdfUrl: readString(customFields.presentationPdfUrl),
    sampleContractUrl: readString(customFields.sampleContractUrl),
    brandLogoUrl: imageUrls[0] ?? null,
    coverImageUrl: imageUrls[0] ?? null,
    branchPhotoUrls: imageUrls.length > 1 ? imageUrls.slice(1) : null,
  };
}

/** @deprecated Use listingFormValuesToFranchiseGivePayload */
export const listingFormValuesToFranchiseBuyPayload = listingFormValuesToFranchiseGivePayload;
