/**
 * Supabase listing package repository.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError } from '@/lib/domain/errors';
import type { ListingId, ListingPackageId, UserId, CompanyId } from '@/lib/domain/ids';
import { ids } from '@/lib/domain/ids';
import type {
  ListingPackageCatalogItem,
  ListingPackageSlug,
  UserListingPackage,
  GrantPackageInput,
  UserPackageFilter,
  UserPackageStatus,
  PackageGrantSource,
} from '@/features/monetization/types/listing-package.types';
import type { ListingPackageRepository } from '@/features/monetization/repositories/listing-package.repository';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';
import {
  logSupabaseError,
  prepareSupabaseWrite,
} from '@/lib/persistence/supabase-payload';

const CATALOG_TABLE = 'marketplace_listing_package_catalog';
const PACKAGES_TABLE = 'marketplace_user_packages';

interface CatalogRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  credits: number | null;
  duration_days: number | null;
  sort_order: number;
  status: string;
  package_kind?: string | null;
  featured_listing?: boolean | null;
  urgent_listing?: boolean | null;
  created_at: string;
  updated_at: string;
}

interface PackageRow {
  id: string;
  user_id: string;
  company_id: string | null;
  package_slug: string;
  credits_remaining: number | null;
  starts_at: string;
  expires_at: string | null;
  status: string;
  granted_by: string;
  consumed_listing_id: string | null;
  created_at: string;
  updated_at: string;
}

function mapCatalog(row: CatalogRow): ListingPackageCatalogItem {
  return {
    id: ids.listingPackage(row.id),
    slug: row.slug as ListingPackageSlug,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    credits: row.credits,
    durationDays: row.duration_days,
    sortOrder: row.sort_order,
    status: row.status as 'active' | 'inactive',
    packageKind:
      row.package_kind === 'homepage_placement' ? 'homepage_placement' : 'publish_quota',
    featuredListing: row.featured_listing ?? false,
    urgentListing: row.urgent_listing ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPackage(row: PackageRow): UserListingPackage {
  return {
    id: ids.listingPackage(row.id),
    userId: ids.user(row.user_id),
    companyId: row.company_id ? ids.company(row.company_id) : null,
    packageSlug: row.package_slug as ListingPackageSlug,
    creditsRemaining: row.credits_remaining,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    status: row.status as UserPackageStatus,
    grantedBy: row.granted_by as PackageGrantSource,
    consumedListingId: row.consumed_listing_id ? ids.listing(row.consumed_listing_id) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseListingPackageRepository implements ListingPackageRepository {
  constructor(private supabase: SupabaseClient) {}

  async listCatalog(): Promise<ListingPackageCatalogItem[]> {
    const { data, error } = await this.supabase
      .from(CATALOG_TABLE)
      .select('*')
      .eq('status', 'active')
      .order('sort_order');
    if (error) throw error;
    return (data as CatalogRow[]).map(mapCatalog);
  }

  async findActiveByUser(filter: UserPackageFilter): Promise<UserListingPackage[]> {
    let query = this.supabase.from(PACKAGES_TABLE).select('*').eq('status', 'active');
    if (filter.userId) query = query.eq('user_id', filter.userId);
    if (filter.companyId) query = query.eq('company_id', filter.companyId);
    if (filter.packageSlug) query = query.eq('package_slug', filter.packageSlug);
    const { data, error } = await query;
    if (error) throw error;
    const nowIso = new Date().toISOString();
    return (data as PackageRow[])
      .map(mapPackage)
      .filter((pkg) => {
        if (pkg.expiresAt && pkg.expiresAt < nowIso) return false;
        if (pkg.packageSlug === 'single_listing' && (pkg.creditsRemaining ?? 0) <= 0) return false;
        return true;
      });
  }

  async paginateUserPackages(filter: UserPackageFilter, pagination?: PaginationParams): Promise<PaginatedResult<UserListingPackage>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;

    let query = this.supabase.from(PACKAGES_TABLE).select('*', { count: 'exact' });
    if (filter.userId) query = query.eq('user_id', filter.userId);
    if (filter.companyId) query = query.eq('company_id', filter.companyId);
    if (filter.packageSlug) query = query.eq('package_slug', filter.packageSlug);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      query = query.in('status', statuses);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, end);
    if (error) throw error;
    return paginatedResult((data as PackageRow[]).map(mapPackage), count ?? 0, page, limit);
  }

  async grant(input: GrantPackageInput): Promise<UserListingPackage> {
    const { data: catalog, error: catalogError } = await this.supabase
      .from(CATALOG_TABLE)
      .select('*')
      .eq('slug', input.packageSlug)
      .maybeSingle();
    if (catalogError) throw catalogError;
    if (!catalog) throw new NotFoundError('ListingPackage', input.packageSlug);

    const cat = catalog as CatalogRow;
    const startsAt = now();
    const expiresAt = cat.duration_days
      ? new Date(Date.now() + cat.duration_days * 86400000).toISOString()
      : null;

    const row = prepareSupabaseWrite('insert', PACKAGES_TABLE, {
      user_id: input.userId,
      company_id: input.companyId ?? null,
      package_slug: input.packageSlug,
      credits_remaining: cat.credits,
      starts_at: startsAt,
      expires_at: expiresAt,
      status: 'active',
      granted_by: input.grantedBy ?? 'admin',
    }, {
      requiredUuidFields: ['user_id'],
      nullableUuidFields: ['company_id'],
    });

    const { data, error } = await this.supabase.from(PACKAGES_TABLE).insert(row).select('*').single();
    if (error) {
      logSupabaseError(error, `${PACKAGES_TABLE} insert`);
      throw error;
    }
    return mapPackage(data as PackageRow);
  }

  async consumeCredit(packageId: ListingPackageId, listingId: ListingId): Promise<UserListingPackage> {
    const existing = await this.findById(packageId);
    if (!existing) throw new NotFoundError('UserListingPackage', packageId);

    if (existing.packageSlug !== 'single_listing') return existing;

    const remaining = (existing.creditsRemaining ?? 0) - 1;
    const update = prepareSupabaseWrite('update', PACKAGES_TABLE, {
      credits_remaining: remaining,
      status: remaining <= 0 ? 'consumed' : 'active',
      consumed_listing_id: listingId,
      updated_at: now(),
    }, {
      requiredUuidFields: ['consumed_listing_id'],
    });
    const { data, error } = await this.supabase
      .from(PACKAGES_TABLE)
      .update(update)
      .eq('id', packageId)
      .select('*')
      .single();
    if (error) {
      logSupabaseError(error, `${PACKAGES_TABLE} update consumeCredit`);
      throw error;
    }
    return mapPackage(data as PackageRow);
  }

  async findById(id: ListingPackageId): Promise<UserListingPackage | null> {
    const { data, error } = await this.supabase.from(PACKAGES_TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapPackage(data as PackageRow) : null;
  }
}
