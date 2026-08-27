import type { CategoryIntentId } from '@/features/categories/types/category.types';
import type { TrustBadges } from '@/features/authentication/types/trust.types';
import { hasAnyTrustBadge } from '@/features/authentication/types/trust.types';
import type { DigitalAiCapability } from '@/features/listings/config/digital-ai-capabilities';
import type { InvestmentCardData } from '@/features/investments/lib/investment-card';
import type { InvestorCardData } from '@/features/investors/lib/investor-card';

export interface ListingAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'link';
  meta?: string;
  /** Public or signed URL when available. */
  url?: string;
}

export interface ListingGalleryItem {
  id: string;
  label: string;
  emoji: string;
  imageUrl?: string;
}

export interface ListingTimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
}

export interface ListingOwner {
  name: string;
  role: string;
  initials: string;
  verified: boolean;
  memberSince: string;
}

export interface ListingPublisher {
  type: 'user' | 'company';
  name: string;
  avatarUrl: string | null;
  initials: string;
  verified: boolean;
  trust: TrustBadges;
  href: string;
  subtitle?: string;
}

export interface ListingSimilar {
  id: string;
  emoji: string;
  listingIconKey?:
    | 'investment'
    | 'investor'
    | 'job-seeker'
    | 'employer'
    | 'partner'
    | 'franchise'
    | 'digital'
    | 'transfer'
    | 'general';
  title: string;
  location: string;
  detail: string;
  tag: string;
}

export interface ListingDetail {
  id: string;
  /** Domain listing UUID for favorites/actions; absent on static demo pages. */
  listingId?: string;
  /** Human-facing reference (e.g. GC-A1B2C3D4) — detail only, not on cards. */
  listingNumber?: string;
  /** Listing owner user id */
  ownerUserId?: string;
  /** Public contact phone — always null on public detail (contact-request flow). */
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactEmail?: string | null;
  companyId?: string | null;
  category: { id: CategoryIntentId; label: string; accent: string };
  title: string;
  shortDescription: string;
  longDescription: string;
  location: string;
  publishedAt: string;
  /** Formatted last update date for detail meta. */
  updatedAt?: string;
  views: number;
  interestedCount: number;
  verified: boolean;
  emoji: string;
  /** Lucide semantic icon for header badge. */
  listingIconKey?:
    | 'investment'
    | 'investor'
    | 'job-seeker'
    | 'employer'
    | 'partner'
    | 'franchise'
    | 'digital'
    | 'transfer'
    | 'general';
  tags: string[];
  investment: {
    requested: string;
    equity: string;
    stage: string;
    industry: string;
    /** Seeking-investment: how funds will be used */
    useOfFunds?: string;
    companyAge: string;
    website: string;
  };
  company: {
    name: string;
    emoji: string;
    city: string;
    website: string;
    employees: string;
    founded: string;
    summary: string;
    /** Franchise / brand extras */
    sector?: string;
    branchCount?: string;
  };
  attachments: ListingAttachment[];
  gallery: ListingGalleryItem[];
  timeline: ListingTimelineEvent[];
  owner: ListingOwner;
  publisher: ListingPublisher;
  activity: { id: string; text: string; time: string }[];
  similar: ListingSimilar[];
  /** Category-specific detail rows derived from custom fields. */
  customFacts?: { label: string; value: string }[];
  /** Partnership detail lead — seeking vs joining. */
  intentHeadline?: string;
  /** Digital & AI capability modules for feature-card detail section. */
  capabilityModules?: DigitalAiCapability[];
  /** İş Arıyorum — structured Kariyer Kartı (identity already redacted in mapper). */
  careerCard?: {
    variant?: 'seeker' | 'hire';
    companyName?: string | null;
    desiredRole?: string | null;
    experienceLevel?: string | null;
    primarySector?: string | null;
    workType?: string | null;
    preferredSectors?: string[] | string | null;
    professionalSkills?: string | null;
    technicalSkills?: string | null;
    educationLevel?: string | null;
    educationField?: string | null;
    languages?: string | null;
    certificates?: string | null;
    preferredCity?: string | null;
    workplacePreference?: string | null;
    salaryExpectation?: string | null;
    salaryRange?: string | null;
    availability?: string | null;
    requiredResponsibilities?: string | null;
    requiredAchievements?: string | null;
    longDescription?: string | null;
    coverUrl?: string | null;
    displayName?: string | null;
    displayNameMasked?: string | null;
    age?: number | null;
    gender?: string | null;
    /** Shown only after accepted contact request / owner / admin. */
    birthDate?: string | null;
    residenceCity?: string | null;
    residenceDistrict?: string | null;
    experiences?: Array<{
      id: string;
      sector: string;
      role: string;
      duration: string;
      responsibilities: string;
      achievements: string;
      startMonth?: number | null;
      startYear?: number | null;
      endMonth?: number | null;
      endYear?: number | null;
      isCurrent?: boolean;
    }>;
    careerProgressions?: Array<{ from: string; to: string }>;
    highlightedSkills?: string[];
  };
  /** Yatırım Arıyorum — structured investor-facing card. */
  investmentCard?: InvestmentCardData;
  /** Yatırım Yapacağım — structured founder-facing investor card. */
  investorCard?: InvestorCardData;
  /** Ortak Arıyorum / Ortak Olmak İstiyorum — structured partnership card. */
  partnershipCard?: PartnershipCardData;
  /** Franchise Veren / Bayilik Arayan — structured franchise card. */
  franchiseCard?: FranchiseCardData;
  /**
   * Server-side: owner/publisher identity was redacted for this viewer
   * (accept-gated career / anonymous listings).
   */
  identityRedacted?: boolean;
}

export interface PartnershipCardData {
  intent?: 'seeking' | 'joining' | 'transfer';
  title?: string | null;
  companyName?: string | null;
  businessName?: string | null;
  businessType?: string | null;
  businessTypeOther?: string | null;
  sector?: string | null;
  stage?: string | null;
  partnershipType?: string | null;
  partnershipTypes?: string[];
  partnershipTypesOther?: string | null;
  professionalSkills?: string[];
  professionalSkillsOther?: string | null;
  technicalSkills?: string[];
  technicalSkillsOther?: string | null;
  tools?: string[];
  toolsOther?: string | null;
  commitment?: string | null;
  equityOffered?: number | string | null;
  monthlyRevenue?: string | null;
  investmentAmount?: string | null;
  transferPrice?: string | null;
  transferScope?: string | null;
  city?: string | null;
  district?: string | null;
  coverUrl?: string | null;
  longDescription?: string | null;
  problem?: string | null;
  solution?: string | null;
  businessModel?: string | string[] | null;
  targetCustomer?: string | string[] | null;
}

export interface FranchiseCardData {
  companyName?: string | null;
  establishmentYear?: number | string | null;
  franchiseModel?: string | null;
  sector?: string | null;
  branchCount?: number | string | null;
  website?: string | null;
  totalInvestment?: number | string | null;
  franchiseFee?: number | string | null;
  profitMargin?: number | string | null;
  advertisingFee?: number | string | null;
  averageSetupDuration?: string | null;
  returnPeriod?: string | null;
  minCapitalRequirement?: number | string | null;
  royaltyFee?: string | null;
  trainingSupport?: boolean;
  operationalSupport?: boolean;
  marketingSupport?: boolean;
  locationSupport?: boolean;
  logisticsSupport?: boolean;
  exclusiveTerritory?: boolean;
  trademarkStatus?: string | null;
  contractProvided?: string | null;
  minSquareMeters?: number | string | null;
  storeLocationType?: string | null;
  availableCities?: string[];
  city?: string | null;
  district?: string | null;
  coverUrl?: string | null;
  longDescription?: string | null;
}

export interface ListingSummary {
  id: string;
  emoji: string;
  title: string;
  location: string;
  detail: string;
  tag: string;
  categoryId: CategoryIntentId;
}

export interface ListingSearchFilter {
  categoryId?: CategoryIntentId;
  query?: string;
  stage?: string;
  location?: string;
  page?: number;
  limit?: number;
}
