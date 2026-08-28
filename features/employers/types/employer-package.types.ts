import type { Timestamps } from '@/lib/domain/base';
import type { UserId, PaymentId, EmployerPackageId } from '@/lib/domain/ids';

export type EmployerPackageSlug = 'standard' | 'professional' | 'featured' | 'urgent';

export type EmployerUserPackageStatus = 'active' | 'expired' | 'suspended' | 'cancelled' | 'revoked';

export type EmployerPackageGrantSource = 'admin' | 'payment';

export type EmployerPaymentAction =
  | 'purchase'
  | 'upgrade'
  | 'downgrade'
  | 'renewal';

export interface EmployerPackageCatalogItem extends Timestamps {
  id: EmployerPackageId;
  slug: EmployerPackageSlug;
  packageName: string;
  packageType: EmployerPackageSlug;
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

export interface EmployerUserPackage extends Timestamps {
  id: EmployerPackageId;
  userId: UserId;
  packageSlug: EmployerPackageSlug;
  listingsUsed: number;
  startsAt: string;
  expiresAt: string | null;
  status: EmployerUserPackageStatus;
  grantedBy: EmployerPackageGrantSource;
}

export interface EmployerCoupon {
  code: string;
  discountPercent: number | null;
  discountCents: number | null;
  validPackageSlugs: EmployerPackageSlug[] | null;
  active: boolean;
  expiresAt: string | null;
}

export interface EmployerPaymentMetadata {
  employerPackageSlug?: EmployerPackageSlug;
  couponCode?: string;
  discountCents?: number;
  originalAmountCents?: number;
  invoiceRef?: string;
  invoiceUrl?: string;
  action?: EmployerPaymentAction;
  fromPackageSlug?: EmployerPackageSlug;
  toPackageSlug?: EmployerPackageSlug;
  userPackageId?: string;
}

export interface CreateEmployerCatalogInput {
  slug: EmployerPackageSlug;
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

export interface GrantEmployerPackageInput {
  userId: UserId;
  packageSlug: EmployerPackageSlug;
  grantedBy?: EmployerPackageGrantSource;
}

export interface EmployerUserPackageFilter {
  userId?: UserId;
  packageSlug?: EmployerPackageSlug;
  status?: EmployerUserPackageStatus | EmployerUserPackageStatus[];
}

export const EMPLOYER_PACKAGE_LABELS: Record<EmployerPackageSlug, string> = {
  standard: 'Standart Paket',
  professional: 'Profesyonel Paket',
  featured: 'Öne Çıkan Paket',
  urgent: 'Süper İlan Paketi',
};

/** Tier order for upgrade/downgrade comparisons */
export const EMPLOYER_PACKAGE_TIER: Record<EmployerPackageSlug, number> = {
  standard: 1,
  professional: 2,
  featured: 3,
  urgent: 3,
};
