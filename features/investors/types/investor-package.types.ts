import type { Timestamps } from '@/lib/domain/base';
import type { UserId, PaymentId, InvestorPackageId } from '@/lib/domain/ids';

export type InvestorPackageSlug = 'standard' | 'professional' | 'featured' | 'urgent';

export type InvestorUserPackageStatus = 'active' | 'expired' | 'suspended' | 'cancelled' | 'revoked';

export type InvestorPackageGrantSource = 'admin' | 'payment';

export type InvestorPaymentAction =
  | 'purchase'
  | 'upgrade'
  | 'downgrade'
  | 'renewal';

export interface InvestorPackageCatalogItem extends Timestamps {
  id: InvestorPackageId;
  slug: InvestorPackageSlug;
  packageName: string;
  packageType: InvestorPackageSlug;
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

export interface InvestorUserPackage extends Timestamps {
  id: InvestorPackageId;
  userId: UserId;
  packageSlug: InvestorPackageSlug;
  listingsUsed: number;
  startsAt: string;
  expiresAt: string | null;
  status: InvestorUserPackageStatus;
  grantedBy: InvestorPackageGrantSource;
}

export interface InvestorCoupon {
  code: string;
  discountPercent: number | null;
  discountCents: number | null;
  validPackageSlugs: InvestorPackageSlug[] | null;
  active: boolean;
  expiresAt: string | null;
}

export interface InvestorPaymentMetadata {
  investorPackageSlug?: InvestorPackageSlug;
  couponCode?: string;
  discountCents?: number;
  originalAmountCents?: number;
  invoiceRef?: string;
  invoiceUrl?: string;
  action?: InvestorPaymentAction;
  fromPackageSlug?: InvestorPackageSlug;
  toPackageSlug?: InvestorPackageSlug;
  userPackageId?: string;
}

export interface CreateInvestorCatalogInput {
  slug: InvestorPackageSlug;
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

export interface GrantInvestorPackageInput {
  userId: UserId;
  packageSlug: InvestorPackageSlug;
  grantedBy?: InvestorPackageGrantSource;
}

export interface InvestorUserPackageFilter {
  userId?: UserId;
  packageSlug?: InvestorPackageSlug;
  status?: InvestorUserPackageStatus | InvestorUserPackageStatus[];
}

export const INVESTOR_PACKAGE_LABELS: Record<InvestorPackageSlug, string> = {
  standard: 'Standart Paket',
  professional: 'Profesyonel Paket',
  featured: 'Öne Çıkan Paket',
  urgent: 'Acil Paket',
};

export const INVESTOR_PACKAGE_TIER: Record<InvestorPackageSlug, number> = {
  standard: 1,
  professional: 2,
  featured: 3,
  urgent: 3,
};
