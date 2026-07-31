/**
 * Supabase entrepreneur package repository.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError } from '@/lib/domain/errors';
import type { EntrepreneurPackageId } from '@/lib/domain/ids';
import { ids } from '@/lib/domain/ids';
import type {
  EntrepreneurPackageCatalogItem,
  EntrepreneurPackageSlug,
  EntrepreneurUserPackage,
  EntrepreneurUserPackageStatus,
  CreateEntrepreneurCatalogInput,
  GrantEntrepreneurPackageInput,
  EntrepreneurUserPackageFilter,
  EntrepreneurCoupon,
  EntrepreneurPackageGrantSource,
} from '@/features/entrepreneurs/types/entrepreneur-package.types';
import type { EntrepreneurPackageRepository } from '@/features/entrepreneurs/repositories/entrepreneur-package.repository';
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

const CATALOG_TABLE = 'entrepreneur_packages';
const PACKAGES_TABLE = 'entrepreneur_user_packages';
const COUPONS_TABLE = 'entrepreneur_coupons';

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

function mapCatalog(row: CatalogRow): EntrepreneurPackageCatalogItem {
  return {
    id: ids.entrepreneurPackage(row.id),
    slug: row.slug as EntrepreneurPackageSlug,
    packageName: row.package_name,
    packageType: row.package_type as EntrepreneurPackageSlug,
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

function mapPackage(row: PackageRow): EntrepreneurUserPackage {
  return {
    id: ids.entrepreneurPackage(row.id),
    userId: ids.user(row.user_id),
    packageSlug: row.package_slug as EntrepreneurPackageSlug,
    listingsUsed: row.listings_used,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    status: row.status as EntrepreneurUserPackageStatus,
    grantedBy: row.granted_by as EntrepreneurPackageGrantSource,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCoupon(row: CouponRow): EntrepreneurCoupon {
  return {
    code: row.code,
    discountPercent: row.discount_percent,
    discountCents: row.discount_cents,
    validPackageSlugs: row.valid_package_slugs as EntrepreneurPackageSlug[] | null,
    active: row.active,
    expiresAt: row.expires_at,
  };
}

export class SupabaseEntrepreneurPackageRepository implements EntrepreneurPackageRepository {
  constructor(private supabase: SupabaseClient) {}

  async listCatalog(): Promise<EntrepreneurPackageCatalogItem[]> {
    const { data, error } = await this.supabase
      .from(CATALOG_TABLE)
      .select('*')
      .eq('active_status', true)
      .order('sort_order');
    if (error) throw error;
    return (data as CatalogRow[]).map(mapCatalog);
  }

  async getBySlug(slug: EntrepreneurPackageSlug): Promise<EntrepreneurPackageCatalogItem | null> {
    const { data, error } = await this.supabase
      .from(CATALOG_TABLE)
      .select('*')
      .eq('slug', slug)
      .eq('active_status', true)
      .maybeSingle();
    if (error) throw error;
    return data ? mapCatalog(data as CatalogRow) : null;
  }

  async createCatalogItem(input: CreateEntrepreneurCatalogInput): Promise<EntrepreneurPackageCatalogItem> {
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

  async findActiveByUser(filter: EntrepreneurUserPackageFilter): Promise<EntrepreneurUserPackage[]> {
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
    filter: EntrepreneurUserPackageFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<EntrepreneurUserPackage>> {
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

  async grant(input: GrantEntrepreneurPackageInput): Promise<EntrepreneurUserPackage> {
    const catalog = await this.getBySlug(input.packageSlug);
    if (!catalog) throw new NotFoundError('EntrepreneurPackage', input.packageSlug);

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

  async findById(id: EntrepreneurPackageId): Promise<EntrepreneurUserPackage | null> {
    const { data, error } = await this.supabase.from(PACKAGES_TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapPackage(data as PackageRow) : null;
  }

  async updateStatus(id: EntrepreneurPackageId, status: EntrepreneurUserPackageStatus): Promise<EntrepreneurUserPackage> {
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

  async extendDuration(id: EntrepreneurPackageId, extraDays: number): Promise<EntrepreneurUserPackage> {
    const existing = await this.findById(id);
    if (!existing) throw new NotFoundError('EntrepreneurUserPackage', id);
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

  async findCoupon(code: string): Promise<EntrepreneurCoupon | null> {
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
    return listModuleCoupons(this.supabase, COUPONS_TABLE) as Promise<EntrepreneurCoupon[]>;
  }

  upsertCoupon(input: EntrepreneurCoupon) {
    return upsertModuleCoupon(this.supabase, COUPONS_TABLE, input) as Promise<EntrepreneurCoupon>;
  }

  deleteCoupon(code: string) {
    return deleteModuleCoupon(this.supabase, COUPONS_TABLE, code);
  }
}
