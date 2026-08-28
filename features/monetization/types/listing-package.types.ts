import type { Timestamps } from '@/lib/domain/base';
import type { UserId, CompanyId, ListingId, ListingPackageId } from '@/lib/domain/ids';
import type { PlacementPackageSlug } from '@/features/monetization/types/listing-placement.types';

export type PublishPackageSlug = 'free' | 'single_listing' | 'monthly_unlimited' | 'company_package';

/** All catalog slugs: publish quota + homepage placement. */
export type ListingPackageSlug = PublishPackageSlug | PlacementPackageSlug;

export type PackageKind = 'publish_quota' | 'homepage_placement';

export type UserPackageStatus = 'active' | 'expired' | 'consumed' | 'revoked';

export type PackageGrantSource = 'admin' | 'payment';

export interface MarketplaceSettings {
  id: 'global';
  freeListingLimit: number;
  currentPublishedCount: number;
  updatedAt: string;
}

export interface ListingPackageCatalogItem extends Timestamps {
  id: ListingPackageId;
  slug: ListingPackageSlug;
  name: string;
  description: string | null;
  priceCents: number;
  credits: number | null;
  durationDays: number | null;
  sortOrder: number;
  status: 'active' | 'inactive';
  packageKind: PackageKind;
  featuredListing: boolean;
  urgentListing: boolean;
}

export interface UserListingPackage extends Timestamps {
  id: ListingPackageId;
  userId: UserId;
  companyId: CompanyId | null;
  packageSlug: ListingPackageSlug;
  creditsRemaining: number | null;
  startsAt: string;
  expiresAt: string | null;
  status: UserPackageStatus;
  grantedBy: PackageGrantSource;
  consumedListingId: ListingId | null;
}

export interface GrantPackageInput {
  userId: UserId;
  packageSlug: ListingPackageSlug;
  companyId?: CompanyId | null;
  grantedBy?: PackageGrantSource;
}

export interface UserPackageFilter {
  userId?: UserId;
  companyId?: CompanyId;
  packageSlug?: ListingPackageSlug;
  status?: UserPackageStatus | UserPackageStatus[];
}

export interface PublishEntitlementResult {
  allowed: boolean;
  reason?: string;
  source?: 'category_free' | 'global_free' | 'category_paid' | PublishPackageSlug;
}

export const PACKAGE_LABELS: Record<ListingPackageSlug, string> = {
  free: 'Ücretsiz',
  single_listing: 'Tek İlan',
  monthly_unlimited: 'Aylık Sınırsız',
  company_package: 'Şirket Paketi',
  vitrin: 'Vitrin Paketi',
  hizli_erisim: 'Süper İlan Paketi',
};

export const PUBLISH_PACKAGE_SLUGS: readonly PublishPackageSlug[] = [
  'free',
  'single_listing',
  'monthly_unlimited',
  'company_package',
] as const;
