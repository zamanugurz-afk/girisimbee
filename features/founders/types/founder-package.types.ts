import type { Timestamps } from '@/lib/domain/base';
import type { UserId, PaymentId, FounderPackageId } from '@/lib/domain/ids';

export type FounderPackageSlug = 'standard' | 'professional' | 'featured' | 'urgent';

export type FounderUserPackageStatus = 'active' | 'expired' | 'suspended' | 'cancelled' | 'revoked';

export type FounderPackageGrantSource = 'admin' | 'payment';

export type FounderPaymentAction =
  | 'purchase'
  | 'upgrade'
  | 'downgrade'
  | 'renewal';

export interface FounderPackageCatalogItem extends Timestamps {
  id: FounderPackageId;
  slug: FounderPackageSlug;
  packageName: string;
  packageType: FounderPackageSlug;
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

export interface FounderUserPackage extends Timestamps {
  id: FounderPackageId;
  userId: UserId;
  packageSlug: FounderPackageSlug;
  listingsUsed: number;
  startsAt: string;
  expiresAt: string | null;
  status: FounderUserPackageStatus;
  grantedBy: FounderPackageGrantSource;
}

export interface FounderCoupon {
  code: string;
  discountPercent: number | null;
  discountCents: number | null;
  validPackageSlugs: FounderPackageSlug[] | null;
  active: boolean;
  expiresAt: string | null;
}

export interface FounderPaymentMetadata {
  founderPackageSlug?: FounderPackageSlug;
  couponCode?: string;
  discountCents?: number;
  originalAmountCents?: number;
  invoiceRef?: string;
  invoiceUrl?: string;
  action?: FounderPaymentAction;
  fromPackageSlug?: FounderPackageSlug;
  toPackageSlug?: FounderPackageSlug;
  userPackageId?: string;
}

export interface CreateFounderCatalogInput {
  slug: FounderPackageSlug;
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

export interface GrantFounderPackageInput {
  userId: UserId;
  packageSlug: FounderPackageSlug;
  grantedBy?: FounderPackageGrantSource;
}

export interface FounderUserPackageFilter {
  userId?: UserId;
  packageSlug?: FounderPackageSlug;
  status?: FounderUserPackageStatus | FounderUserPackageStatus[];
}

export const FOUNDER_PACKAGE_LABELS: Record<FounderPackageSlug, string> = {
  standard: 'Standart Paket',
  professional: 'Profesyonel Paket',
  featured: 'Öne Çıkan Paket',
  urgent: 'Süper İlan Paketi',
};

export const FOUNDER_PACKAGE_TIER: Record<FounderPackageSlug, number> = {
  standard: 1,
  professional: 2,
  featured: 3,
  urgent: 3,
};
