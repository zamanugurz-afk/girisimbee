/**
 * Supabase investor package repository.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
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
  InvestorPackageGrantSource,
} from '@/features/investors/types/investor-package.types';
import type { InvestorPackageRepository } from '@/features/investors/repositories/investor-package.repository';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';
import {
  logSupabaseError,
  prepareSupabaseWrite,
} from '@/lib/persistence/supabase-payload';
import {
  deleteModuleCoupon,
  listModuleCoupons,
  upsertModuleCoupon,
} from '@/lib/persistence/supabase-coupon-admin';

const CATALOG_TABLE = 'investor_packages';
const PACKAGES_TABLE = 'investor_user_packages';
const COUPONS_TABLE = 'investor_coupons';

interface CatalogRow {
  id: string;
  slug: string;
  package_name: string;
  package_type: string;
  package_price: number;
  package_duration: number;
  listing_limit: number;
  featured_listing: boolean;
  urgent_listing: boolean;
  homepage_visibility: boolean;
  badge_visibility: boolean;
  active_status: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface PackageRow {
  id: string;
  user_id: string;
  package_slug: string;
  listings_used: number;
  starts_at: string;
  expires_at: string | null;
  status: string;
  granted_by: string;
  created_at: string;
  updated_at: string;
}

interface CouponRow {
  code: string;
  discount_percent: number | null;
  discount_cents: number | null;
  valid_package_slugs: string[] | null;
  active: boolean;
  expires_at: string | null;
}

function mapCatalog(row: CatalogRow): InvestorPackageCatalogItem {
  return {
    id: ids.investorPackage(row.id),
    slug: row.slug as InvestorPackageSlug,
    packageName: row.package_name,
    packageType: row.package_type as InvestorPackageSlug,
    packagePrice: row.package_price,
    packageDuration: row.package_duration,
    listingLimit: row.listing_limit,
    featuredListing: row.featured_listing,
    urgentListing: row.urgent_listing,
    homepageVisibility: row.homepage_visibility,
    badgeVisibility: row.badge_visibility,
    activeStatus: row.active_status,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPackage(row: PackageRow): InvestorUserPackage {
  return {
    id: ids.investorPackage(row.id),
    userId: ids.user(row.user_id),
    packageSlug: row.package_slug as InvestorPackageSlug,
    listingsUsed: row.listings_used,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    status: row.status as InvestorUserPackageStatus,
    grantedBy: row.granted_by as InvestorPackageGrantSource,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCoupon(row: CouponRow): InvestorCoupon {
  return {
    code: row.code,
    discountPercent: row.discount_percent,
    discountCents: row.discount_cents,
    validPackageSlugs: row.valid_package_slugs as InvestorPackageSlug[] | null,
    active: row.active,
    expiresAt: row.expires_at,
  };
}

export class SupabaseInvestorPackageRepository implements InvestorPackageRepository {
  constructor(private supabase: SupabaseClient) {}

  async listCatalog(): Promise<InvestorPackageCatalogItem[]> {
    const { data, error } = await this.supabase
      .from(CATALOG_TABLE)
      .select('*')
      .eq('active_status', true)
      .order('sort_order');
    if (error) throw error;
    return (data as CatalogRow[]).map(mapCatalog);
  }

  async getBySlug(slug: InvestorPackageSlug): Promise<InvestorPackageCatalogItem | null> {
    const { data, error } = await this.supabase
      .from(CATALOG_TABLE)
      .select('*')
      .eq('slug', slug)
      .eq('active_status', true)
      .maybeSingle();
    if (error) throw error;
    return data ? mapCatalog(data as CatalogRow) : null;
  }

  async createCatalogItem(input: CreateInvestorCatalogInput): Promise<InvestorPackageCatalogItem> {
    const row = prepareSupabaseWrite('insert', CATALOG_TABLE, {
      slug: input.slug,
      package_name: input.packageName,
      package_type: input.slug,
      package_price: input.packagePrice,
      package_duration: input.packageDuration,
      listing_limit: input.listingLimit,
      featured_listing: input.featuredListing ?? false,
      urgent_listing: input.urgentListing ?? false,
      homepage_visibility: input.homepageVisibility ?? false,
      badge_visibility: input.badgeVisibility ?? false,
      active_status: input.activeStatus ?? true,
      sort_order: input.sortOrder ?? 99,
    });

    const { data, error } = await this.supabase.from(CATALOG_TABLE).insert(row).select('*').single();
    if (error) {
      logSupabaseError(error, `${CATALOG_TABLE} insert`);
      throw error;
    }
    return mapCatalog(data as CatalogRow);
  }

  async findActiveByUser(filter: InvestorUserPackageFilter): Promise<InvestorUserPackage[]> {
    let query = this.supabase.from(PACKAGES_TABLE).select('*').eq('status', 'active');
    if (filter.userId) query = query.eq('user_id', filter.userId);
    if (filter.packageSlug) query = query.eq('package_slug', filter.packageSlug);
    const { data, error } = await query;
    if (error) throw error;
    const nowIso = new Date().toISOString();
    return (data as PackageRow[])
      .map(mapPackage)
      .filter((pkg) => !pkg.expiresAt || pkg.expiresAt >= nowIso);
  }

  async paginateUserPackages(
    filter: InvestorUserPackageFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<InvestorUserPackage>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;

    let query = this.supabase.from(PACKAGES_TABLE).select('*', { count: 'exact' });
    if (filter.userId) query = query.eq('user_id', filter.userId);
    if (filter.packageSlug) query = query.eq('package_slug', filter.packageSlug);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      query = query.in('status', statuses);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, end);
    if (error) throw error;
    return paginatedResult((data as PackageRow[]).map(mapPackage), count ?? 0, page, limit);
  }

  async grant(input: GrantInvestorPackageInput): Promise<InvestorUserPackage> {
    const catalog = await this.getBySlug(input.packageSlug);
    if (!catalog) throw new NotFoundError('InvestorPackage', input.packageSlug);

    const startsAt = now();
    const expiresAt = new Date(Date.now() + catalog.packageDuration * 86400000).toISOString();

    const row = prepareSupabaseWrite('insert', PACKAGES_TABLE, {
      user_id: input.userId,
      package_slug: input.packageSlug,
      listings_used: 0,
      starts_at: startsAt,
      expires_at: expiresAt,
      status: 'active',
      granted_by: input.grantedBy ?? 'admin',
    }, { requiredUuidFields: ['user_id'] });

    const { data, error } = await this.supabase.from(PACKAGES_TABLE).insert(row).select('*').single();
    if (error) {
      logSupabaseError(error, `${PACKAGES_TABLE} insert`);
      throw error;
    }
    return mapPackage(data as PackageRow);
  }

  async findById(id: InvestorPackageId): Promise<InvestorUserPackage | null> {
    const { data, error } = await this.supabase.from(PACKAGES_TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapPackage(data as PackageRow) : null;
  }

  async updateStatus(id: InvestorPackageId, status: InvestorUserPackageStatus): Promise<InvestorUserPackage> {
    const update = prepareSupabaseWrite('update', PACKAGES_TABLE, { status, updated_at: now() });
    const { data, error } = await this.supabase
      .from(PACKAGES_TABLE)
      .update(update)
      .eq('id', id)
      .select('*')
      .single();
    if (error) {
      logSupabaseError(error, `${PACKAGES_TABLE} updateStatus`);
      throw error;
    }
    return mapPackage(data as PackageRow);
  }

  async extendDuration(id: InvestorPackageId, extraDays: number): Promise<InvestorUserPackage> {
    const existing = await this.findById(id);
    if (!existing) throw new NotFoundError('InvestorUserPackage', id);
    const base = existing.expiresAt ? new Date(existing.expiresAt).getTime() : Date.now();
    const expiresAt = new Date(base + extraDays * 86400000).toISOString();
    const update = prepareSupabaseWrite('update', PACKAGES_TABLE, {
      expires_at: expiresAt,
      status: 'active',
      updated_at: now(),
    });
    const { data, error } = await this.supabase
      .from(PACKAGES_TABLE)
      .update(update)
      .eq('id', id)
      .select('*')
      .single();
    if (error) {
      logSupabaseError(error, `${PACKAGES_TABLE} extendDuration`);
      throw error;
    }
    return mapPackage(data as PackageRow);
  }

  async findCoupon(code: string): Promise<InvestorCoupon | null> {
    const { data, error } = await this.supabase
      .from(COUPONS_TABLE)
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const coupon = mapCoupon(data as CouponRow);
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return null;
    return coupon;
  }

  listCoupons() {
    return listModuleCoupons(this.supabase, COUPONS_TABLE) as Promise<InvestorCoupon[]>;
  }

  upsertCoupon(input: InvestorCoupon) {
    return upsertModuleCoupon(this.supabase, COUPONS_TABLE, input) as Promise<InvestorCoupon>;
  }

  deleteCoupon(code: string) {
    return deleteModuleCoupon(this.supabase, COUPONS_TABLE, code);
  }
}
