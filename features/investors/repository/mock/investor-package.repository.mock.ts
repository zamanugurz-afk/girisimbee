/**
 * Mock investor package repository — in-memory catalog + entitlements + coupons.
 */
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError } from '@/lib/domain/errors';
import type { InvestorPackageId } from '@/lib/domain/ids';
import { ids } from '@/lib/domain/ids';
import type {
  InvestorPackageCatalogItem,
  InvestorPackageSlug,
  InvestorUserPackage,
  InvestorUserPackageStatus,
  CreateInvestorCatalogInput,
  GrantInvestorPackageInput,
  InvestorUserPackageFilter,
  InvestorCoupon,
} from '@/features/investors/types/investor-package.types';
import type { InvestorPackageRepository } from '@/features/investors/repositories/investor-package.repository';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';

const CATALOG: InvestorPackageCatalogItem[] = [
  {
    id: ids.investorPackage('n0000002-0001-4000-8000-000000000001'),
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
    id: ids.investorPackage('n0000002-0001-4000-8000-000000000002'),
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
    id: ids.investorPackage('n0000002-0001-4000-8000-000000000003'),
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
    id: ids.investorPackage('n0000002-0001-4000-8000-000000000004'),
    slug: 'urgent',
    packageName: 'Acil Paket',
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

const COUPONS: InvestorCoupon[] = [
  { code: 'INVESTOR10', discountPercent: 10, discountCents: null, validPackageSlugs: null, active: true, expiresAt: null },
  { code: 'INVESTORPRO15', discountPercent: 15, discountCents: null, validPackageSlugs: ['professional'], active: true, expiresAt: null },
];

function catalogItem(slug: InvestorPackageSlug): InvestorPackageCatalogItem {
  const item = CATALOG.find((c) => c.slug === slug);
  if (!item) throw new NotFoundError('InvestorPackage', slug);
  return item;
}

function isEntitlementActive(pkg: InvestorUserPackage): boolean {
  if (pkg.status !== 'active') return false;
  if (pkg.expiresAt && new Date(pkg.expiresAt) < new Date()) return false;
  return true;
}

export class MockInvestorPackageRepository implements InvestorPackageRepository {
  private packages = new Map<InvestorPackageId, InvestorUserPackage>();
  private catalog = [...CATALOG];
  private coupons = [...COUPONS];

  async listCatalog(): Promise<InvestorPackageCatalogItem[]> {
    return this.catalog.filter((c) => c.activeStatus);
  }

  async getBySlug(slug: InvestorPackageSlug): Promise<InvestorPackageCatalogItem | null> {
    return this.catalog.find((c) => c.slug === slug && c.activeStatus) ?? null;
  }

  async createCatalogItem(input: CreateInvestorCatalogInput): Promise<InvestorPackageCatalogItem> {
    const item: InvestorPackageCatalogItem = {
      id: ids.investorPackage(crypto.randomUUID()),
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

  async findActiveByUser(filter: InvestorUserPackageFilter): Promise<InvestorUserPackage[]> {
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
    filter: InvestorUserPackageFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<InvestorUserPackage>> {
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

  async grant(input: GrantInvestorPackageInput): Promise<InvestorUserPackage> {
    const catalog = catalogItem(input.packageSlug);
    const id = ids.investorPackage(crypto.randomUUID());
    const startsAt = now();
    const expiresAt = new Date(Date.now() + catalog.packageDuration * 86400000).toISOString();

    const pkg: InvestorUserPackage = {
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

  async findById(id: InvestorPackageId): Promise<InvestorUserPackage | null> {
    return this.packages.get(id) ?? null;
  }

  async updateStatus(id: InvestorPackageId, status: InvestorUserPackageStatus): Promise<InvestorUserPackage> {
    const pkg = this.packages.get(id);
    if (!pkg) throw new NotFoundError('InvestorUserPackage', id);
    const updated = { ...pkg, status, updatedAt: now() };
    this.packages.set(id, updated);
    return updated;
  }

  async extendDuration(id: InvestorPackageId, extraDays: number): Promise<InvestorUserPackage> {
    const pkg = this.packages.get(id);
    if (!pkg) throw new NotFoundError('InvestorUserPackage', id);
    const base = pkg.expiresAt ? new Date(pkg.expiresAt).getTime() : Date.now();
    const expiresAt = new Date(base + extraDays * 86400000).toISOString();
    const updated = { ...pkg, expiresAt, status: 'active' as const, updatedAt: now() };
    this.packages.set(id, updated);
    return updated;
  }

  async findCoupon(code: string): Promise<InvestorCoupon | null> {
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!coupon) return null;
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return null;
    return coupon;
  }

  async listCoupons(): Promise<InvestorCoupon[]> {
    return [...this.coupons];
  }

  async upsertCoupon(input: InvestorCoupon): Promise<InvestorCoupon> {
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

export const mockInvestorPackageRepository = new MockInvestorPackageRepository();
