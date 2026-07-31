import type { Timestamps } from '@/lib/domain/base';
import type { UserId, PaymentId, EntrepreneurPackageId } from '@/lib/domain/ids';

export type EntrepreneurPackageSlug = 'standard' | 'professional' | 'featured' | 'urgent';

export type EntrepreneurUserPackageStatus = 'active' | 'expired' | 'suspended' | 'cancelled' | 'revoked';

export type EntrepreneurPackageGrantSource = 'admin' | 'payment';

export type EntrepreneurPaymentAction =
  | 'purchase'
  | 'upgrade'
  | 'downgrade'
  | 'renewal';

export interface EntrepreneurPackageCatalogItem extends Timestamps {
  id: EntrepreneurPackageId;
  slug: EntrepreneurPackageSlug;
  packageName: string;
  packageType: EntrepreneurPackageSlug;
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

export interface EntrepreneurUserPackage extends Timestamps {
  id: EntrepreneurPackageId;
  userId: UserId;
  packageSlug: EntrepreneurPackageSlug;
  listingsUsed: number;
  startsAt: string;
  expiresAt: string | null;
  status: EntrepreneurUserPackageStatus;
  grantedBy: EntrepreneurPackageGrantSource;
}

export interface EntrepreneurCoupon {
  code: string;
  discountPercent: number | null;
  discountCents: number | null;
  validPackageSlugs: EntrepreneurPackageSlug[] | null;
  active: boolean;
  expiresAt: string | null;
}

export interface EntrepreneurPaymentMetadata {
  entrepreneurPackageSlug?: EntrepreneurPackageSlug;
  couponCode?: string;
  discountCents?: number;
  originalAmountCents?: number;
  invoiceRef?: string;
  invoiceUrl?: string;
  action?: EntrepreneurPaymentAction;
  fromPackageSlug?: EntrepreneurPackageSlug;
  toPackageSlug?: EntrepreneurPackageSlug;
  userPackageId?: string;
}

export interface CreateEntrepreneurCatalogInput {
  slug: EntrepreneurPackageSlug;
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

export interface GrantEntrepreneurPackageInput {
  userId: UserId;
  packageSlug: EntrepreneurPackageSlug;
  grantedBy?: EntrepreneurPackageGrantSource;
}

export interface EntrepreneurUserPackageFilter {
  userId?: UserId;
  packageSlug?: EntrepreneurPackageSlug;
  status?: EntrepreneurUserPackageStatus | EntrepreneurUserPackageStatus[];
}

export const ENTREPRENEUR_PACKAGE_LABELS: Record<EntrepreneurPackageSlug, string> = {
  standard: 'Standart Paket',
  professional: 'Profesyonel Paket',
  featured: 'Öne Çıkan Paket',
  urgent: 'Acil Paket',
};

/** Tier order for upgrade/downgrade comparisons */
export const ENTREPRENEUR_PACKAGE_TIER: Record<EntrepreneurPackageSlug, number> = {
  standard: 1,
  professional: 2,
  featured: 3,
  urgent: 3,
};
