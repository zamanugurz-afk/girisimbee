import type { CategoryIntentId } from '@/features/categories/types/category.types';
import type { TrustBadges } from '@/features/authentication/types/trust.types';
import { hasAnyTrustBadge } from '@/features/authentication/types/trust.types';
import type { DigitalAiCapability } from '@/features/listings/config/digital-ai-capabilities';

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
  /** Digital & AI capability modules for feature-card detail section. */
  capabilityModules?: DigitalAiCapability[];
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
