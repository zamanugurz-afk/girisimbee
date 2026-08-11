import type { ModuleKey } from '@/lib/domain/modules';
import type { Profile } from '@/features/profiles/types/profile.types';
import type { ProfileModule } from '@/features/profiles/types/profile-module.types';
import type { MarketplaceApplication } from '@/features/matching/types/application.types';
import type { MarketplacePayment } from '@/features/monetization/types/payment.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { MarketplaceSettings } from '@/features/monetization/types/listing-package.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

/** Unified coupon shape for admin CRUD across module package tables. */
export interface AdminModuleCoupon {
  code: string;
  discountPercent: number | null;
  discountCents: number | null;
  validPackageSlugs: string[] | null;
  active: boolean;
  expiresAt: string | null;
}

export interface AdminCouponView extends AdminModuleCoupon {
  moduleKey: ModuleKey;
}

export type AdminCouponInput = {
  code: string;
  discountPercent?: number | null;
  discountCents?: number | null;
  validPackageSlugs?: string[] | null;
  active?: boolean;
  expiresAt?: string | null;
};

export interface AdminProfileView {
  profile: Profile;
  modules: ProfileModule[];
}

export interface AdminProfileFilter {
  moduleKey?: ModuleKey;
  query?: string;
  status?: Profile['status'];
}

export interface AdminApplicationFilter {
  moduleKey?: MarketplaceApplication['moduleKey'];
  status?: MarketplaceApplication['status'] | MarketplaceApplication['status'][];
  includeDeleted?: boolean;
}

export interface AdminPaymentFilter {
  userId?: MarketplacePayment['userId'];
  status?: MarketplacePayment['status'] | MarketplacePayment['status'][];
  purpose?: MarketplacePayment['purpose'];
}

export interface AdminPackageCatalogView {
  moduleKey: ModuleKey;
  catalog: unknown[];
  activeEntitlements: unknown[];
}

export type AdminReportPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

export type AdminReportCategory =
  | 'users'
  | 'listings'
  | 'applications'
  | 'payments'
  | 'reports';

export interface AdminReportSnapshot {
  period: AdminReportPeriod;
  category: AdminReportCategory | 'all';
  generatedAt: string;
  metrics: Record<string, number>;
}

export interface AdminListingActionInput {
  reason?: string;
  featuredUntil?: string;
  urgentUntil?: string;
}

export interface AdminSettingsPatch {
  freeListingLimit?: number;
}

export interface AdminUserAction {
  action: 'activate' | 'deactivate' | 'suspend' | 'delete';
}

export interface AdminListingAction {
  action:
    | 'approve'
    | 'reject'
    | 'feature'
    | 'unfeature'
    | 'mark_urgent'
    | 'remove_urgent'
    | 'extend_expiry'
    | 'unpublish'
    | 'archive'
    | 'delete';
  reason?: string;
  featuredUntil?: string;
  urgentUntil?: string;
  days?: number;
}

export interface AdminApplicationAction {
  action: 'review' | 'archive' | 'restore';
}

export interface AdminPaymentAction {
  action: 'refund' | 'activate_package' | 'suspend_package';
  moduleKey?: ModuleKey;
  userId?: string;
  packageSlug?: string;
  userPackageId?: string;
}

export interface AdminPackageAction {
  action: 'activate' | 'suspend';
  moduleKey: ModuleKey;
  userId?: string;
  packageSlug?: string;
  userPackageId?: string;
}

export type AdminPaginatedProfiles = PaginatedResult<AdminProfileView>;
export type AdminPaginatedApplications = PaginatedResult<MarketplaceApplication>;
export type AdminPaginatedPayments = PaginatedResult<MarketplacePayment>;
export type AdminPaginatedListings = PaginatedResult<Listing>;

export interface AdminSettingsView extends MarketplaceSettings {}

export { type PaginationParams };
