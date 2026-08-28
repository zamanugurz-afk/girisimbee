import type { Timestamps } from '@/lib/domain/base';
import type { UserId, PaymentId, CandidatePackageId } from '@/lib/domain/ids';

export type CandidatePackageSlug = 'standard' | 'professional' | 'featured' | 'urgent';

export type CandidateUserPackageStatus = 'active' | 'expired' | 'suspended' | 'cancelled' | 'revoked';

export type CandidatePackageGrantSource = 'admin' | 'payment';

export type CandidatePaymentAction =
  | 'purchase'
  | 'upgrade'
  | 'downgrade'
  | 'renewal';

export interface CandidatePackageCatalogItem extends Timestamps {
  id: CandidatePackageId;
  slug: CandidatePackageSlug;
  packageName: string;
  packageType: CandidatePackageSlug;
  packagePrice: number;
  packageDuration: number;
  listingLimit: number;
  featuredListing: boolean;
  urgentListing: boolean;
  homepageVisibility: boolean;
  badgeVisibility: boolean;
  activeStatus: boolean;
  sortOrder: number;
}

export interface CandidateUserPackage extends Timestamps {
  id: CandidatePackageId;
  userId: UserId;
  packageSlug: CandidatePackageSlug;
  listingsUsed: number;
  startsAt: string;
  expiresAt: string | null;
  status: CandidateUserPackageStatus;
  grantedBy: CandidatePackageGrantSource;
}

export interface CandidateCoupon {
  code: string;
  discountPercent: number | null;
  discountCents: number | null;
  validPackageSlugs: CandidatePackageSlug[] | null;
  active: boolean;
  expiresAt: string | null;
}

export interface CandidatePaymentMetadata {
  candidatePackageSlug?: CandidatePackageSlug;
  couponCode?: string;
  discountCents?: number;
  originalAmountCents?: number;
  invoiceRef?: string;
  invoiceUrl?: string;
  action?: CandidatePaymentAction;
  fromPackageSlug?: CandidatePackageSlug;
  toPackageSlug?: CandidatePackageSlug;
  userPackageId?: string;
}

export interface CreateCandidateCatalogInput {
  slug: CandidatePackageSlug;
  packageName: string;
  packagePrice: number;
  packageDuration: number;
  listingLimit: number;
  featuredListing?: boolean;
  urgentListing?: boolean;
  homepageVisibility?: boolean;
  badgeVisibility?: boolean;
  activeStatus?: boolean;
  sortOrder?: number;
}

export interface GrantCandidatePackageInput {
  userId: UserId;
  packageSlug: CandidatePackageSlug;
  grantedBy?: CandidatePackageGrantSource;
}

export interface CandidateUserPackageFilter {
  userId?: UserId;
  packageSlug?: CandidatePackageSlug;
  status?: CandidateUserPackageStatus | CandidateUserPackageStatus[];
}

export const CANDIDATE_PACKAGE_LABELS: Record<CandidatePackageSlug, string> = {
  standard: 'Standart Paket',
  professional: 'Profesyonel Paket',
  featured: 'Öne Çıkan Paket',
  urgent: 'Süper İlan Paketi',
};

export const CANDIDATE_PACKAGE_TIER: Record<CandidatePackageSlug, number> = {
  standard: 1,
  professional: 2,
  featured: 3,
  urgent: 3,
};
