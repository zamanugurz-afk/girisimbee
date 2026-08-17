import type { CreateListingInput, Listing, UpdateListingInput } from '@/features/listings/types/listing.entity.types';
import type { FranchiseFlow } from '@/features/franchise/types/franchise-listing.types';
import type {
  FranchiseListingDetails,
  FranchiseListingPayload,
} from '@/features/franchise/types/franchise-listing.types';
import { FRANCHISE_SUBCATEGORY_IDS, FRANCHISE_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';
import { MARKETPLACE_LISTING_TYPE_IDS } from '@/features/listings/config/marketplace-category-map';

const BUY_DETAIL_KEYS = [
  'minimumYatirim',
  'maksimumYatirim',
  'tercihEdilenLokasyon',
  'isletmeTecrubesi',
  'preferredBrand',
] as const;

const GIVE_DETAIL_KEYS = [
  'companyName',
  'establishmentYear',
  'branchCount',
  'website',
  'entryFee',
  'franchiseFee',
  'totalInvestment',
  'profitMargin',
  'royaltyFee',
  'advertisingFee',
  'returnPeriod',
  'averageSetupDuration',
  'minSquareMeters',
  'availableCities',
  'districts',
  'minPopulation',
  'storeSize',
  'mallAvailable',
  'streetStoreAvailable',
  'businessCategory',
  'employeeCount',
  'dailyCustomerCapacity',
  'workingHours',
  'trainingSupport',
  'operationalSupport',
  'marketingSupport',
  'minCapitalRequirement',
  'experienceRequirement',
  'educationRequirement',
  'companyEstablishmentRequired',
  'guaranteeRequirement',
  'introductionVideoUrl',
  'presentationPdfUrl',
  'sampleContractUrl',
  'brandLogoUrl',
  'coverImageUrl',
  'branchPhotoUrls',
  'franchiseBedeli',
  'minimumSermaye',
  'tahminiAylikCiro',
  'egitimDestegi',
  'operasyonDestegi',
  'pazarlamaDestegi',
] as const;

export function flowFromSubcategoryId(subcategoryId: Listing['subcategoryId']): FranchiseFlow | null {
  if (!subcategoryId) return null;
  if (subcategoryId === FRANCHISE_SUBCATEGORY_IDS['franchise-buy']) return 'buy';
  if (subcategoryId === FRANCHISE_SUBCATEGORY_IDS['franchise-give']) return 'give';
  return null;
}

/** Resolve buy/give when subcategory_id is missing (legacy/seed rows). */
export function resolveFranchiseFlow(listing: Listing): FranchiseFlow | null {
  const fromSubcategory = flowFromSubcategoryId(listing.subcategoryId);
  if (fromSubcategory) return fromSubcategory;

  const typeId = listing.listingTypeId;
  if (
    typeId === FRANCHISE_LISTING_TYPE_IDS.buy
    || typeId === MARKETPLACE_LISTING_TYPE_IDS.bayilikAl
  ) {
    return 'buy';
  }
  if (
    typeId === FRANCHISE_LISTING_TYPE_IDS.give
    || typeId === MARKETPLACE_LISTING_TYPE_IDS.bayilikVer
  ) {
    return 'give';
  }

  // Published franchise module rows without subcategory/type mapping default to give (opportunity ads).
  if (listing.moduleKey === 'franchise') return 'give';
  return null;
}

function readCustomField<T>(cf: Record<string, unknown>, key: string): T | null {
  const value = cf[key];
  return (value as T | null | undefined) ?? null;
}

export function extractFranchiseListingDetails(listing: Listing): FranchiseListingDetails {
  const cf = listing.customFields;
  return {
    minimumYatirim: readCustomField<number>(cf, 'minimumYatirim'),
    maksimumYatirim: readCustomField<number>(cf, 'maksimumYatirim'),
    tercihEdilenLokasyon: readCustomField<string>(cf, 'tercihEdilenLokasyon'),
    isletmeTecrubesi: readCustomField<string>(cf, 'isletmeTecrubesi'),
    preferredBrand: readCustomField<string>(cf, 'preferredBrand'),
    companyName: readCustomField<string>(cf, 'companyName'),
    establishmentYear: readCustomField<number>(cf, 'establishmentYear'),
    branchCount: readCustomField<number>(cf, 'branchCount'),
    website: readCustomField<string>(cf, 'website'),
    entryFee: readCustomField<number>(cf, 'entryFee'),
    franchiseFee: readCustomField<number>(cf, 'franchiseFee') ?? readCustomField<number>(cf, 'franchiseBedeli'),
    totalInvestment: readCustomField<number>(cf, 'totalInvestment'),
    profitMargin: readCustomField<number>(cf, 'profitMargin'),
    royaltyFee: readCustomField<number>(cf, 'royaltyFee'),
    advertisingFee: readCustomField<number>(cf, 'advertisingFee'),
    returnPeriod: readCustomField<string>(cf, 'returnPeriod'),
    averageSetupDuration: readCustomField<string>(cf, 'averageSetupDuration'),
    minSquareMeters: readCustomField<number>(cf, 'minSquareMeters'),
    availableCities: readCustomField<string[]>(cf, 'availableCities'),
    districts: readCustomField<string>(cf, 'districts'),
    minPopulation: readCustomField<number>(cf, 'minPopulation'),
    storeSize: readCustomField<string>(cf, 'storeSize'),
    mallAvailable: readCustomField<boolean>(cf, 'mallAvailable'),
    streetStoreAvailable: readCustomField<boolean>(cf, 'streetStoreAvailable'),
    businessCategory: readCustomField<string>(cf, 'businessCategory'),
    employeeCount: readCustomField<number>(cf, 'employeeCount'),
    dailyCustomerCapacity: readCustomField<number>(cf, 'dailyCustomerCapacity'),
    workingHours: readCustomField<string>(cf, 'workingHours'),
    trainingSupport: readCustomField<boolean>(cf, 'trainingSupport') ?? readCustomField<boolean>(cf, 'egitimDestegi'),
    operationalSupport: readCustomField<boolean>(cf, 'operationalSupport') ?? readCustomField<boolean>(cf, 'operasyonDestegi'),
    marketingSupport: readCustomField<boolean>(cf, 'marketingSupport') ?? readCustomField<boolean>(cf, 'pazarlamaDestegi'),
    minCapitalRequirement: readCustomField<number>(cf, 'minCapitalRequirement') ?? readCustomField<number>(cf, 'minimumSermaye'),
    experienceRequirement: readCustomField<string>(cf, 'experienceRequirement'),
    educationRequirement: readCustomField<string>(cf, 'educationRequirement'),
    companyEstablishmentRequired: readCustomField<boolean>(cf, 'companyEstablishmentRequired'),
    guaranteeRequirement: readCustomField<string>(cf, 'guaranteeRequirement'),
    introductionVideoUrl: readCustomField<string>(cf, 'introductionVideoUrl'),
    presentationPdfUrl: readCustomField<string>(cf, 'presentationPdfUrl'),
    sampleContractUrl: readCustomField<string>(cf, 'sampleContractUrl'),
    brandLogoUrl: readCustomField<string>(cf, 'brandLogoUrl'),
    coverImageUrl: readCustomField<string>(cf, 'coverImageUrl'),
    branchPhotoUrls: readCustomField<string[]>(cf, 'branchPhotoUrls'),
    franchiseBedeli: readCustomField<number>(cf, 'franchiseBedeli'),
    minimumSermaye: readCustomField<number>(cf, 'minimumSermaye'),
    tahminiAylikCiro: readCustomField<number>(cf, 'tahminiAylikCiro'),
    egitimDestegi: readCustomField<boolean>(cf, 'egitimDestegi'),
    operasyonDestegi: readCustomField<boolean>(cf, 'operasyonDestegi'),
    pazarlamaDestegi: readCustomField<boolean>(cf, 'pazarlamaDestegi'),
  };
}

function buildCustomFields(flow: FranchiseFlow, payload: FranchiseListingPayload): Record<string, unknown> {
  const keys = flow === 'buy' ? BUY_DETAIL_KEYS : GIVE_DETAIL_KEYS;
  const customFields: Record<string, unknown> = {};
  for (const key of keys) {
    if (payload[key] !== undefined) {
      customFields[key] = payload[key];
    }
  }
  return customFields;
}

export function franchisePayloadToCreateInput(
  flow: FranchiseFlow,
  payload: FranchiseListingPayload,
): Pick<
  CreateListingInput,
  | 'title'
  | 'shortDescription'
  | 'longDescription'
  | 'city'
  | 'district'
  | 'industry'
  | 'contactPhone'
  | 'contactWhatsapp'
  | 'contactEmail'
  | 'contactWebsite'
  | 'customFields'
> {
  const website = payload.website ?? payload.contactWebsite ?? null;

  return {
    title: payload.title,
    shortDescription: payload.shortDescription,
    longDescription: payload.longDescription ?? '',
    city: payload.city ?? null,
    district: payload.district ?? null,
    industry: payload.sector ?? null,
    contactPhone: payload.contactPhone ?? null,
    contactWhatsapp: payload.contactWhatsapp ?? null,
    contactEmail: payload.contactEmail ?? null,
    contactWebsite: website,
    customFields: {
      ...buildCustomFields(flow, payload),
      ...(website ? { website } : {}),
    },
  };
}

export function franchisePayloadToUpdateInput(
  flow: FranchiseFlow,
  payload: Partial<FranchiseListingPayload>,
  existing: Listing,
): UpdateListingInput {
  const update: UpdateListingInput = {};
  if (payload.title !== undefined) update.title = payload.title;
  if (payload.shortDescription !== undefined) update.shortDescription = payload.shortDescription;
  if (payload.longDescription !== undefined) update.longDescription = payload.longDescription;
  if (payload.city !== undefined) update.city = payload.city;
  if (payload.district !== undefined) update.district = payload.district;
  if (payload.sector !== undefined) update.industry = payload.sector;
  if (payload.contactPhone !== undefined) update.contactPhone = payload.contactPhone;
  if (payload.contactWhatsapp !== undefined) update.contactWhatsapp = payload.contactWhatsapp;
  if (payload.contactEmail !== undefined) update.contactEmail = payload.contactEmail;
  if (payload.contactWebsite !== undefined || payload.website !== undefined) {
    update.contactWebsite = payload.contactWebsite ?? payload.website ?? null;
  }

  const customPatch = buildCustomFields(flow, payload as FranchiseListingPayload);
  if (payload.website !== undefined) {
    customPatch.website = payload.website;
  }
  if (Object.keys(customPatch).length > 0) {
    update.customFields = { ...existing.customFields, ...customPatch };
  }

  return update;
}

export function formatMoney(value: number | null | undefined): string {
  if (value == null) return '';
  return `${value.toLocaleString('tr-TR')} ₺`;
}

export function formatPercentage(value: number | null | undefined): string {
  if (value == null) return '';
  return `%${value}`;
}

export function formatSupportFlags(details: FranchiseListingDetails): string {
  const flags: string[] = [];
  if (details.trainingSupport ?? details.egitimDestegi) flags.push('Eğitim');
  if (details.operationalSupport ?? details.operasyonDestegi) flags.push('Operasyon');
  if (details.marketingSupport ?? details.pazarlamaDestegi) flags.push('Pazarlama');
  return flags.join(', ');
}

export function formatBoolean(value: boolean | null | undefined, trueLabel = 'Evet', falseLabel = 'Hayır'): string {
  if (value == null) return '';
  return value ? trueLabel : falseLabel;
}

/** Public browse/detail payload — never expose private contact channels. */
export function toPublicFranchiseListing(listing: Listing): Listing {
  return {
    ...listing,
    contactPhone: null,
    contactEmail: null,
    contactWhatsapp: null,
    contactWebsite: null,
  };
}
