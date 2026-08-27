import type { Listing } from '@/features/listings/types/listing.entity.types';

export type FranchiseFlow = 'buy' | 'give';

/** Legacy buy-side fields (browse-only seekers). */
export interface FranchiseBuyListingDetails {
  minimumYatirim?: number | null;
  maksimumYatirim?: number | null;
  tercihEdilenLokasyon?: string | null;
  isletmeTecrubesi?: string | null;
  preferredBrand?: string | null;
}

/** Franchise owner (give) listing fields stored in customFields JSONB. */
export interface FranchiseGiveListingDetails {
  companyName?: string | null;
  establishmentYear?: number | null;
  franchiseModel?: string | null;
  franchiseModelOther?: string | null;
  branchCount?: number | null;
  originCountry?: string | null;
  website?: string | null;
  entryFee?: number | null;
  franchiseFee?: number | null;
  totalInvestment?: number | null;
  profitMargin?: number | null;
  royaltyFee?: string | number | null;
  advertisingFee?: number | null;
  returnPeriod?: string | null;
  averageSetupDuration?: string | null;
  minSquareMeters?: number | null;
  storeLocationType?: string | null;
  availableCities?: string[] | null;
  districts?: string | null;
  minPopulation?: number | null;
  storeSize?: string | null;
  mallAvailable?: boolean | null;
  streetStoreAvailable?: boolean | null;
  businessCategory?: string | null;
  employeeCount?: number | null;
  dailyCustomerCapacity?: number | null;
  workingHours?: string | null;
  trainingSupport?: boolean | null;
  operationalSupport?: boolean | null;
  marketingSupport?: boolean | null;
  locationSupport?: boolean | null;
  logisticsSupport?: boolean | null;
  exclusiveTerritory?: boolean | null;
  trademarkStatus?: string | null;
  contractProvided?: string | null;
  operatingManualProvided?: string | null;
  minCapitalRequirement?: number | null;
  experienceRequirement?: string | null;
  educationRequirement?: string | null;
  companyEstablishmentRequired?: boolean | null;
  guaranteeRequirement?: string | null;
  introductionVideoUrl?: string | null;
  presentationPdfUrl?: string | null;
  sampleContractUrl?: string | null;
  brandLogoUrl?: string | null;
  coverImageUrl?: string | null;
  branchPhotoUrls?: string[] | null;
  /** @deprecated Use franchiseFee */
  franchiseBedeli?: number | null;
  /** @deprecated Use minCapitalRequirement */
  minimumSermaye?: number | null;
  /** @deprecated Removed from form */
  tahminiAylikCiro?: number | null;
  /** @deprecated Use trainingSupport */
  egitimDestegi?: boolean | null;
  /** @deprecated Use operationalSupport */
  operasyonDestegi?: boolean | null;
  /** @deprecated Use marketingSupport */
  pazarlamaDestegi?: boolean | null;
}

export type FranchiseListingDetails = FranchiseBuyListingDetails & FranchiseGiveListingDetails;

/** Input payload for create/update franchise listings. */
export interface FranchiseListingPayload {
  title: string;
  shortDescription: string;
  longDescription?: string;
  city?: string | null;
  district?: string | null;
  sector?: string | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactEmail?: string | null;
  contactWebsite?: string | null;
  minimumYatirim?: number | null;
  maksimumYatirim?: number | null;
  tercihEdilenLokasyon?: string | null;
  isletmeTecrubesi?: string | null;
  preferredBrand?: string | null;
  companyName?: string | null;
  establishmentYear?: number | null;
  franchiseModel?: string | null;
  franchiseModelOther?: string | null;
  branchCount?: number | null;
  originCountry?: string | null;
  website?: string | null;
  entryFee?: number | null;
  franchiseFee?: number | null;
  totalInvestment?: number | null;
  profitMargin?: number | null;
  royaltyFee?: string | number | null;
  advertisingFee?: number | null;
  returnPeriod?: string | null;
  averageSetupDuration?: string | null;
  minSquareMeters?: number | null;
  storeLocationType?: string | null;
  availableCities?: string[] | null;
  districts?: string | null;
  minPopulation?: number | null;
  storeSize?: string | null;
  mallAvailable?: boolean | null;
  streetStoreAvailable?: boolean | null;
  businessCategory?: string | null;
  employeeCount?: number | null;
  dailyCustomerCapacity?: number | null;
  workingHours?: string | null;
  trainingSupport?: boolean | null;
  operationalSupport?: boolean | null;
  marketingSupport?: boolean | null;
  locationSupport?: boolean | null;
  logisticsSupport?: boolean | null;
  exclusiveTerritory?: boolean | null;
  trademarkStatus?: string | null;
  contractProvided?: string | null;
  operatingManualProvided?: string | null;
  minCapitalRequirement?: number | null;
  experienceRequirement?: string | null;
  educationRequirement?: string | null;
  companyEstablishmentRequired?: boolean | null;
  guaranteeRequirement?: string | null;
  introductionVideoUrl?: string | null;
  presentationPdfUrl?: string | null;
  sampleContractUrl?: string | null;
  brandLogoUrl?: string | null;
  coverImageUrl?: string | null;
  branchPhotoUrls?: string[] | null;
  franchiseBedeli?: number | null;
  minimumSermaye?: number | null;
  tahminiAylikCiro?: number | null;
  egitimDestegi?: boolean | null;
  operasyonDestegi?: boolean | null;
  pazarlamaDestegi?: boolean | null;
}

export interface FranchiseListingFilter {
  city?: string;
  district?: string;
  sector?: string;
}

export interface FranchiseListingDetailViewModel {
  listing: Listing;
  flow: FranchiseFlow;
  details: FranchiseListingDetails;
}
