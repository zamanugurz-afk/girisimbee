/**
 * Mock listing package repository — in-memory catalog + entitlements.
 */
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError } from '@/lib/domain/errors';
import type { ListingId, ListingPackageId } from '@/lib/domain/ids';
import { ids } from '@/lib/domain/ids';
import type {
  ListingPackageCatalogItem,
  ListingPackageSlug,
  UserListingPackage,
  GrantPackageInput,
  UserPackageFilter,
} from '@/features/monetization/types/listing-package.types';
import type { ListingPackageRepository } from '@/features/monetization/repositories/listing-package.repository';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';

const CATALOG: ListingPackageCatalogItem[] = [
  { id: ids.listingPackage('00000000-0000-4000-8000-000000000001'), slug: 'free', name: 'Ücretsiz', description: 'Platform genelindeki ücretsiz ilan kotası', priceCents: 0, credits: null, durationDays: null, sortOrder: 0, status: 'active', packageKind: 'publish_quota', featuredListing: false, urgentListing: false, createdAt: now(), updatedAt: now() },
  { id: ids.listingPackage('00000000-0000-4000-8000-000000000002'), slug: 'single_listing', name: 'Tek İlan', description: 'Tek ilan yayınlama hakkı', priceCents: 9900, credits: 1, durationDays: null, sortOrder: 1, status: 'active', packageKind: 'publish_quota', featuredListing: false, urgentListing: false, createdAt: now(), updatedAt: now() },
  { id: ids.listingPackage('00000000-0000-4000-8000-000000000003'), slug: 'monthly_unlimited', name: 'Aylık Sınırsız', description: '30 gün boyunca sınırsız ilan', priceCents: 49900, credits: null, durationDays: 30, sortOrder: 2, status: 'active', packageKind: 'publish_quota', featuredListing: false, urgentListing: false, createdAt: now(), updatedAt: now() },
  { id: ids.listingPackage('00000000-0000-4000-8000-000000000004'), slug: 'company_package', name: 'Şirket Paketi', description: 'Şirket hesabı için 30 gün sınırsız ilan', priceCents: 99900, credits: null, durationDays: 30, sortOrder: 3, status: 'active', packageKind: 'publish_quota', featuredListing: false, urgentListing: false, createdAt: now(), updatedAt: now() },
  { id: ids.listingPackage('00000000-0000-4000-8000-000000000010'), slug: 'vitrin', name: 'Vitrin Paketi', description: 'Ana sayfa Öne Çıkan İlanlar bölümünde 30 gün gösterim', priceCents: 2900, credits: null, durationDays: 30, sortOrder: 10, status: 'active', packageKind: 'homepage_placement', featuredListing: true, urgentListing: false, createdAt: now(), updatedAt: now() },
  { id: ids.listingPackage('00000000-0000-4000-8000-000000000011'), slug: 'hizli_erisim', name: 'Acil Vitrin Paketi', description: 'Ana sayfa Acil İlanlar bölümünde 30 gün gösterim', priceCents: 3900, credits: null, durationDays: 30, sortOrder: 11, status: 'active', packageKind: 'homepage_placement', featuredListing: false, urgentListing: true, createdAt: now(), updatedAt: now() },
];

function catalogItem(slug: ListingPackageSlug): ListingPackageCatalogItem {
  const item = CATALOG.find((c) => c.slug === slug);
  if (!item) throw new NotFoundError('ListingPackage', slug);
  return item;
}

function isActive(pkg: UserListingPackage): boolean {
  if (pkg.status !== 'active') return false;
  if (pkg.expiresAt && new Date(pkg.expiresAt) < new Date()) return false;
  if (pkg.packageSlug === 'single_listing' && (pkg.creditsRemaining ?? 0) <= 0) return false;
  return true;
}

export class MockListingPackageRepository implements ListingPackageRepository {
  private packages = new Map<ListingPackageId, UserListingPackage>();

  async listCatalog(): Promise<ListingPackageCatalogItem[]> {
    return CATALOG.filter((c) => c.status === 'active');
  }

  async findActiveByUser(filter: UserPackageFilter): Promise<UserListingPackage[]> {
    return [...this.packages.values()].filter((pkg) => {
      if (!isActive(pkg)) return false;
      if (filter.userId && pkg.userId !== filter.userId) return false;
      if (filter.companyId && pkg.companyId !== filter.companyId) return false;
      if (filter.packageSlug && pkg.packageSlug !== filter.packageSlug) return false;
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statuses.includes(pkg.status)) return false;
      }
      return true;
    });
  }

  async paginateUserPackages(filter: UserPackageFilter, pagination?: PaginationParams): Promise<PaginatedResult<UserListingPackage>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.packages.values()];
    if (filter.userId) results = results.filter((p) => p.userId === filter.userId);
    if (filter.companyId) results = results.filter((p) => p.companyId === filter.companyId);
    if (filter.packageSlug) results = results.filter((p) => p.packageSlug === filter.packageSlug);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((p) => statuses.includes(p.status));
    }
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async grant(input: GrantPackageInput): Promise<UserListingPackage> {
    const catalog = catalogItem(input.packageSlug);
    const id = ids.listingPackage(crypto.randomUUID());
    const startsAt = now();
    const expiresAt = catalog.durationDays
      ? new Date(Date.now() + catalog.durationDays * 86400000).toISOString()
      : null;

    const pkg: UserListingPackage = {
      id,
      userId: input.userId,
      companyId: input.companyId ?? null,
      packageSlug: input.packageSlug,
      creditsRemaining: catalog.credits,
      startsAt,
      expiresAt,
      status: 'active',
      grantedBy: input.grantedBy ?? 'admin',
      consumedListingId: null,
      createdAt: startsAt,
      updatedAt: startsAt,
    };
    this.packages.set(id, pkg);
    return pkg;
  }

  async consumeCredit(packageId: ListingPackageId, listingId: ListingId): Promise<UserListingPackage> {
    const pkg = this.packages.get(packageId);
    if (!pkg) throw new NotFoundError('UserListingPackage', packageId);

    if (pkg.packageSlug === 'single_listing') {
      const remaining = (pkg.creditsRemaining ?? 0) - 1;
      const updated: UserListingPackage = {
        ...pkg,
        creditsRemaining: remaining,
        status: remaining <= 0 ? 'consumed' : 'active',
        consumedListingId: listingId,
        updatedAt: now(),
      };
      this.packages.set(packageId, updated);
      return updated;
    }

    return pkg;
  }

  async findById(id: ListingPackageId): Promise<UserListingPackage | null> {
    return this.packages.get(id) ?? null;
  }
}

export const mockListingPackageRepository = new MockListingPackageRepository();
