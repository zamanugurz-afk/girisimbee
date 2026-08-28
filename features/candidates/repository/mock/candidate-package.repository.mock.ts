/**
 * Mock candidate package repository — in-memory catalog + entitlements + coupons.
 */
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError } from '@/lib/domain/errors';
import type { CandidatePackageId } from '@/lib/domain/ids';
import { ids } from '@/lib/domain/ids';
import type {
  CandidatePackageCatalogItem,
  CandidatePackageSlug,
  CandidateUserPackage,
  CandidateUserPackageStatus,
  CreateCandidateCatalogInput,
  GrantCandidatePackageInput,
  CandidateUserPackageFilter,
  CandidateCoupon,
} from '@/features/candidates/types/candidate-package.types';
import type { CandidatePackageRepository } from '@/features/candidates/repositories/candidate-package.repository';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';

const CATALOG: CandidatePackageCatalogItem[] = [
  {
    id: ids.candidatePackage('c0000001-0001-4000-8000-000000000001'),
    slug: 'standard',
    packageName: 'Standart Paket',
    packageType: 'standard',
    packagePrice: 19900,
    packageDuration: 30,
    listingLimit: 3,
    featuredListing: false,
    urgentListing: false,
    homepageVisibility: false,
    badgeVisibility: false,
    activeStatus: true,
    sortOrder: 1,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: ids.candidatePackage('c0000001-0001-4000-8000-000000000002'),
    slug: 'professional',
    packageName: 'Profesyonel Paket',
    packageType: 'professional',
    packagePrice: 39900,
    packageDuration: 60,
    listingLimit: 10,
    featuredListing: false,
    urgentListing: false,
    homepageVisibility: false,
    badgeVisibility: true,
    activeStatus: true,
    sortOrder: 2,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: ids.candidatePackage('c0000001-0001-4000-8000-000000000003'),
    slug: 'featured',
    packageName: 'Öne Çıkan Paket',
    packageType: 'featured',
    packagePrice: 69900,
    packageDuration: 30,
    listingLimit: 5,
    featuredListing: true,
    urgentListing: false,
    homepageVisibility: true,
    badgeVisibility: true,
    activeStatus: true,
    sortOrder: 3,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: ids.candidatePackage('c0000001-0001-4000-8000-000000000004'),
    slug: 'urgent',
    packageName: 'Süper İlan Paketi',
    packageType: 'urgent',
    packagePrice: 54900,
    packageDuration: 14,
    listingLimit: 5,
    featuredListing: false,
    urgentListing: true,
    homepageVisibility: false,
    badgeVisibility: true,
    activeStatus: true,
    sortOrder: 4,
    createdAt: now(),
    updatedAt: now(),
  },
];

const COUPONS: CandidateCoupon[] = [
  { code: 'CANDIDATE10', discountPercent: 10, discountCents: null, validPackageSlugs: null, active: true, expiresAt: null },
  { code: 'PRO15', discountPercent: 15, discountCents: null, validPackageSlugs: ['professional'], active: true, expiresAt: null },
];

function catalogItem(slug: CandidatePackageSlug): CandidatePackageCatalogItem {
  const item = CATALOG.find((c) => c.slug === slug);
  if (!item) throw new NotFoundError('CandidatePackage', slug);
  return item;
}

function isEntitlementActive(pkg: CandidateUserPackage): boolean {
  if (pkg.status !== 'active') return false;
  if (pkg.expiresAt && new Date(pkg.expiresAt) < new Date()) return false;
  return true;
}

export class MockCandidatePackageRepository implements CandidatePackageRepository {
  private packages = new Map<CandidatePackageId, CandidateUserPackage>();
  private catalog = [...CATALOG];
  private coupons = [...COUPONS];

  async listCatalog(): Promise<CandidatePackageCatalogItem[]> {
    return this.catalog.filter((c) => c.activeStatus);
  }

  async getBySlug(slug: CandidatePackageSlug): Promise<CandidatePackageCatalogItem | null> {
    return this.catalog.find((c) => c.slug === slug && c.activeStatus) ?? null;
  }

  async createCatalogItem(input: CreateCandidateCatalogInput): Promise<CandidatePackageCatalogItem> {
    const item: CandidatePackageCatalogItem = {
      id: ids.candidatePackage(crypto.randomUUID()),
      slug: input.slug,
      packageName: input.packageName,
      packageType: input.slug,
      packagePrice: input.packagePrice,
      packageDuration: input.packageDuration,
      listingLimit: input.listingLimit,
      featuredListing: input.featuredListing ?? false,
      urgentListing: input.urgentListing ?? false,
      homepageVisibility: input.homepageVisibility ?? false,
      badgeVisibility: input.badgeVisibility ?? false,
      activeStatus: input.activeStatus ?? true,
      sortOrder: input.sortOrder ?? this.catalog.length + 1,
      createdAt: now(),
      updatedAt: now(),
    };
    this.catalog.push(item);
    return item;
  }

  async findActiveByUser(filter: CandidateUserPackageFilter): Promise<CandidateUserPackage[]> {
    return [...this.packages.values()].filter((pkg) => {
      if (!isEntitlementActive(pkg)) return false;
      if (filter.userId && pkg.userId !== filter.userId) return false;
      if (filter.packageSlug && pkg.packageSlug !== filter.packageSlug) return false;
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statuses.includes(pkg.status)) return false;
      }
      return true;
    });
  }

  async paginateUserPackages(
    filter: CandidateUserPackageFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<CandidateUserPackage>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.packages.values()];
    if (filter.userId) results = results.filter((p) => p.userId === filter.userId);
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

  async grant(input: GrantCandidatePackageInput): Promise<CandidateUserPackage> {
    const catalog = catalogItem(input.packageSlug);
    const id = ids.candidatePackage(crypto.randomUUID());
    const startsAt = now();
    const expiresAt = new Date(Date.now() + catalog.packageDuration * 86400000).toISOString();

    const pkg: CandidateUserPackage = {
      id,
      userId: input.userId,
      packageSlug: input.packageSlug,
      listingsUsed: 0,
      startsAt,
      expiresAt,
      status: 'active',
      grantedBy: input.grantedBy ?? 'admin',
      createdAt: startsAt,
      updatedAt: startsAt,
    };
    this.packages.set(id, pkg);
    return pkg;
  }

  async findById(id: CandidatePackageId): Promise<CandidateUserPackage | null> {
    return this.packages.get(id) ?? null;
  }

  async updateStatus(id: CandidatePackageId, status: CandidateUserPackageStatus): Promise<CandidateUserPackage> {
    const pkg = this.packages.get(id);
    if (!pkg) throw new NotFoundError('CandidateUserPackage', id);
    const updated = { ...pkg, status, updatedAt: now() };
    this.packages.set(id, updated);
    return updated;
  }

  async extendDuration(id: CandidatePackageId, extraDays: number): Promise<CandidateUserPackage> {
    const pkg = this.packages.get(id);
    if (!pkg) throw new NotFoundError('CandidateUserPackage', id);
    const base = pkg.expiresAt ? new Date(pkg.expiresAt).getTime() : Date.now();
    const expiresAt = new Date(base + extraDays * 86400000).toISOString();
    const updated = { ...pkg, expiresAt, status: 'active' as const, updatedAt: now() };
    this.packages.set(id, updated);
    return updated;
  }

  async findCoupon(code: string): Promise<CandidateCoupon | null> {
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!coupon) return null;
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return null;
    return coupon;
  }

  async listCoupons(): Promise<CandidateCoupon[]> {
    return [...this.coupons];
  }

  async upsertCoupon(input: CandidateCoupon): Promise<CandidateCoupon> {
    const code = input.code.toUpperCase();
    const idx = this.coupons.findIndex((c) => c.code.toUpperCase() === code);
    const coupon = { ...input, code };
    if (idx >= 0) this.coupons[idx] = coupon;
    else this.coupons.push(coupon);
    return coupon;
  }

  async deleteCoupon(code: string): Promise<void> {
    this.coupons = this.coupons.filter((c) => c.code.toUpperCase() !== code.toUpperCase());
  }
}

export const mockCandidatePackageRepository = new MockCandidatePackageRepository();
