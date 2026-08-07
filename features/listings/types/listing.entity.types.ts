/**
 * Listing — core marketplace entity.
 *
 * Purpose: Represent investment, job, hiring, or partnership opportunities.
 * Relations: User (owner), Company, Category, ListingType; Tags, Attachments, Applications, Favorites.
 * Lifecycle: draft → pending_review → published ↔ paused → expired/archived → deleted
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type {
  UserId,
  CompanyId,
  ListingId,
  CategoryId,
  ListingTypeId,
  SubcategoryId,
} from '@/lib/domain/ids';
import type { ExternalContactInfo, WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { ModuleKey } from '@/lib/domain/modules';

export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'paused'
  | 'expired'
  | 'archived'
  | 'rejected'
  | 'sold'
  | 'deleted';

export type RemotePolicy = 'onsite' | 'hybrid' | 'remote';

/** Category-specific structured data stored as JSONB. */
export interface InvestmentDetails {
  amountSought: number;
  currency: string;
  equityOffered: string | null;
  stage: string | null;
  minInvestment: number | null;
  maxInvestment: number | null;
}

export interface JobDetails {
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
  experienceLevel: string | null;
  remotePolicy: RemotePolicy;
}

export interface PartnerDetails {
  partnerType: 'technical' | 'business' | 'co_founder' | 'advisor';
  equityOffered: string | null;
  commitment: string | null;
}

export interface Listing extends Timestamps, SoftDeletable {
  id: ListingId;
  slug: string;
  ownerId: UserId;
  companyId: CompanyId | null;
  categoryId: CategoryId;
  listingTypeId: ListingTypeId;
  subcategoryId: SubcategoryId | null;
  moduleKey: ModuleKey | null;
  title: string;
  shortDescription: string;
  longDescription: string;
  status: ListingStatus;
  location: string | null;
  city: string | null;
  district: string | null;
  industry: string | null;
  country: string;
  remotePolicy: RemotePolicy | null;
  anonymousMode: boolean;
  workflowStatus: WorkflowStatus;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;
  contactWebsite: string | null;
  investmentDetails: InvestmentDetails | null;
  jobDetails: JobDetails | null;
  partnerDetails: PartnerDetails | null;
  customFields: Record<string, unknown>;
  viewCount: number;
  interestedCount: number;
  applicationCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  featuredUntil: string | null;
  urgentUntil: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  rejectedReason: string | null;
}

/** External contact channels exposed on listings (v1 — no internal messaging). */
export type ListingContactInfo = ExternalContactInfo;

export type CreateListingInput = Pick<
  Listing,
  'ownerId' | 'categoryId' | 'listingTypeId' | 'title' | 'shortDescription'
> & {
  companyId?: CompanyId | null;
  subcategoryId?: SubcategoryId | null;
  moduleKey?: ModuleKey | null;
  longDescription?: string;
  location?: string | null;
  city?: string | null;
  district?: string | null;
  industry?: string | null;
  country?: string;
  remotePolicy?: RemotePolicy | null;
  anonymousMode?: boolean;
  workflowStatus?: WorkflowStatus;
  status?: ListingStatus;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactEmail?: string | null;
  contactWebsite?: string | null;
  investmentDetails?: InvestmentDetails | null;
  jobDetails?: JobDetails | null;
  partnerDetails?: PartnerDetails | null;
  customFields?: Record<string, unknown>;
};

export type UpdateListingInput = Partial<
  Omit<Listing, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'viewCount' | 'interestedCount' | 'applicationCount'>
>;

export interface ListingFilter {
  ownerId?: UserId;
  companyId?: CompanyId;
  categoryId?: CategoryId;
  listingTypeId?: ListingTypeId;
  /** Expanded listing type IDs for browse filters (app + DB legacy rows). */
  listingTypeIds?: ListingTypeId[];
  subcategoryId?: SubcategoryId;
  moduleKey?: ModuleKey;
  status?: ListingStatus | ListingStatus[];
  city?: string;
  district?: string;
  industry?: string;
  anonymousMode?: boolean;
  workflowStatus?: WorkflowStatus;
  remotePolicy?: RemotePolicy;
  isVerified?: boolean;
  isFeatured?: boolean;
  isUrgent?: boolean;
  activeFeaturedOnly?: boolean;
  activeUrgentOnly?: boolean;
  publishedAfter?: string;
  publishedBefore?: string;
  tagIds?: string[];
  query?: string;
  salaryMin?: number;
  investmentMin?: number;
  sortBy?: import('@/features/listings/types/marketplace.types').ListingSortBy;
  includeDeleted?: boolean;
}

export const LISTING_INDEXES: IndexDefinition[] = [
  { name: 'listings_slug_unique', columns: ['slug'], unique: true, where: 'deleted_at IS NULL' },
  { name: 'listings_owner_id_idx', columns: ['owner_id'] },
  { name: 'listings_company_id_idx', columns: ['company_id'], where: 'company_id IS NOT NULL' },
  { name: 'listings_category_status_idx', columns: ['category_id', 'status'] },
  { name: 'listings_status_published_at_idx', columns: ['status', 'published_at'], where: "status = 'published'" },
  { name: 'listings_city_idx', columns: ['city'], where: 'city IS NOT NULL' },
  { name: 'listings_featured_idx', columns: ['is_featured', 'published_at'], where: 'is_featured = true' },
  { name: 'listings_urgent_idx', columns: ['is_urgent', 'published_at'], where: 'is_urgent = true' },
  { name: 'listings_title_trgm', columns: ['title'], type: 'gin' },
  { name: 'listings_custom_fields_gin', columns: ['custom_fields'], type: 'gin' },
];

export const LISTING_LIFECYCLE: Record<ListingStatus, readonly ListingStatus[]> = {
  draft: ['pending_review', 'deleted'],
  pending_review: ['published', 'rejected', 'deleted'],
  published: ['paused', 'expired', 'archived', 'sold', 'deleted'],
  paused: ['published', 'archived', 'deleted'],
  expired: ['published', 'archived', 'deleted'],
  archived: ['published', 'deleted'],
  rejected: ['draft', 'pending_review', 'deleted'],
  sold: ['archived', 'deleted'],
  deleted: [],
};

export const LISTING_VALIDATION: ValidationRule[] = [
  { field: 'title', rule: 'required|min:5|max:200', message: 'Başlık 5–200 karakter olmalı.' },
  { field: 'shortDescription', rule: 'required|min:20|max:500', message: 'Kısa açıklama 20–500 karakter.' },
  { field: 'longDescription', rule: 'nullable|max:10000', message: 'Açıklama en fazla 10000 karakter.' },
  { field: 'categoryId', rule: 'required|uuid', message: 'Kategori gerekli.' },
  { field: 'listingTypeId', rule: 'required|uuid', message: 'İlan tipi gerekli.' },
];
