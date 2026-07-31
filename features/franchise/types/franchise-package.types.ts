import type { Timestamps } from '@/lib/domain/base';
import type { UserId, PaymentId, FranchisePackageId } from '@/lib/domain/ids';

export type FranchisePackageSlug = 'standard' | 'professional' | 'featured' | 'urgent';

export type FranchiseUserPackageStatus = 'active' | 'expired' | 'suspended' | 'cancelled' | 'revoked';

export type FranchisePackageGrantSource = 'admin' | 'payment';

export type FranchisePaymentAction =
  | 'purchase'
  | 'upgrade'
  | 'downgrade'
  | 'renewal';

export interface FranchisePackageCatalogItem extends Timestamps {
  id: FranchisePackageId;
  slug: FranchisePackageSlug;
  packageName: string;
  packageType: FranchisePackageSlug;
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

export interface FranchiseUserPackage extends Timestamps {
  id: FranchisePackageId;
  userId: UserId;
  packageSlug: FranchisePackageSlug;
  listingsUsed: number;
  startsAt: string;
  expiresAt: string | null;
  status: FranchiseUserPackageStatus;
  grantedBy: FranchisePackageGrantSource;
}

export interface FranchiseCoupon {
  code: string;
  discountPercent: number | null;
  discountCents: number | null;
  validPackageSlugs: FranchisePackageSlug[] | null;
  active: boolean;
  expiresAt: string | null;
}

export interface FranchisePaymentMetadata {
  franchisePackageSlug?: FranchisePackageSlug;
  couponCode?: string;
  discountCents?: number;
  originalAmountCents?: number;
  invoiceRef?: string;
  invoiceUrl?: string;
  action?: FranchisePaymentAction;
  fromPackageSlug?: FranchisePackageSlug;
  toPackageSlug?: FranchisePackageSlug;
  userPackageId?: string;
}

export interface FranchisePaymentRecord {
  id: PaymentId;
  userId: UserId;
  amountCents: number;
  currency: string;
  status: string;
  purpose: 'franchise_package';
  metadata: FranchisePaymentMetadata;
  paidAt: string | null;
  createdAt: string;
}

export interface CreateFranchiseCatalogInput {
  slug: FranchisePackageSlug;
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

export interface GrantFranchisePackageInput {
  userId: UserId;
  packageSlug: FranchisePackageSlug;
  grantedBy?: FranchisePackageGrantSource;
}

export interface FranchiseUserPackageFilter {
  userId?: UserId;
  packageSlug?: FranchisePackageSlug;
  status?: FranchiseUserPackageStatus | FranchiseUserPackageStatus[];
}

export const FRANCHISE_PACKAGE_LABELS: Record<FranchisePackageSlug, string> = {
  standard: 'Standart Paket',
  professional: 'Profesyonel Paket',
  featured: 'Öne Çıkan Paket',
  urgent: 'Acil Paket',
};

/** Tier order for upgrade/downgrade comparisons */
export const FRANCHISE_PACKAGE_TIER: Record<FranchisePackageSlug, number> = {
  standard: 1,
  professional: 2,
  featured: 3,
  urgent: 3,
};
