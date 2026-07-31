/**
 * Supabase listing repository — PostgreSQL persistence via marketplace_listings.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now, slugify } from '@/lib/domain/factory';
import { canTransition } from '@/lib/domain/base';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { ListingId } from '@/lib/domain/ids';
import type {
  Listing,
  ListingFilter,
  ListingStatus,
  CreateListingInput,
  UpdateListingInput,
} from '@/features/listings/types/listing.entity.types';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import { LISTING_LIFECYCLE } from '@/features/listings/types/listing.entity.types';
import { createListing } from '@/features/listings/factories/listing.factory';
import { mapListingRow, toListingRow, toListingUpdateRow, type ListingRow } from '@/features/listings/repository/supabase/listing.mapper';
import { getSortColumn } from '@/features/listings/utils/listing-sort';
import { computeListingExpiry } from '@/features/listings/utils/listing-expiry';
import {
  logSupabaseError,
  prepareSupabaseWrite,
} from '@/lib/persistence/supabase-payload';

const TABLE = 'marketplace_listings';

export class SupabaseListingRepository implements ListingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: ListingId, filter?: RepositoryFilter): Promise<Listing | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapListingRow(data as ListingRow) : null;
  }

  async findBySlug(slug: string): Promise<Listing | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw error;
    return data ? mapListingRow(data as ListingRow) : null;
  }

  private applyFilter(
    query: ReturnType<SupabaseClient['from']>,
    filter: ListingFilter,
  ) {
    let q = query.select('*', { count: 'exact' });
    if (!filter.includeDeleted) q = q.is('deleted_at', null);
    if (filter.ownerId) q = q.eq('owner_id', filter.ownerId);
    if (filter.categoryId) q = q.eq('category_id', filter.categoryId);
    if (filter.listingTypeId) q = q.eq('listing_type_id', filter.listingTypeId);
    if (filter.subcategoryId) q = q.eq('subcategory_id', filter.subcategoryId);
    if (filter.moduleKey) q = q.eq('module_key', filter.moduleKey);
    if (filter.companyId) q = q.eq('company_id', filter.companyId);
    if (filter.city) q = q.eq('city', filter.city);
    if (filter.district) q = q.eq('district', filter.district);
    if (filter.industry) q = q.eq('industry', filter.industry);
    if (filter.anonymousMode !== undefined) q = q.eq('anonymous_mode', filter.anonymousMode);
    if (filter.workflowStatus) q = q.eq('workflow_status', filter.workflowStatus);
    if (filter.isVerified !== undefined) q = q.eq('is_verified', filter.isVerified);
    if (filter.isFeatured !== undefined) q = q.eq('is_featured', filter.isFeatured);
    if (filter.isUrgent !== undefined) q = q.eq('is_urgent', filter.isUrgent);
    if (filter.activeFeaturedOnly) {
      const now = new Date().toISOString();
      q = q.or(`featured_until.is.null,featured_until.gt.${now}`);
    }
    if (filter.activeUrgentOnly) {
      const now = new Date().toISOString();
      q = q.or(`urgent_until.is.null,urgent_until.gt.${now}`);
    }
    if (filter.publishedAfter) q = q.gte('published_at', filter.publishedAfter);
    if (filter.publishedBefore) q = q.lte('published_at', filter.publishedBefore);
    if (filter.remotePolicy) q = q.eq('remote_policy', filter.remotePolicy);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      q = q.in('status', statuses);
    }
    if (filter.query) {
      const qstr = filter.query.trim();
      q = q.or(`title.ilike.%${qstr}%,short_description.ilike.%${qstr}%`);
    }
    return q;
  }

  async findMany(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;

    const { column, ascending } = getSortColumn(filter.sortBy ?? 'newest');

    const query = this.applyFilter(this.supabase.from(TABLE), filter)
      .order(column, { ascending })
      .range(start, end);

    const { data, error, count } = await query;
    if (error) throw error;
    const listings = (data ?? []).map((row) => mapListingRow(row as ListingRow));
    return paginatedResult(listings, count ?? 0, page, limit);
  }

  async paginate(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    return this.findMany(filter, pagination);
  }

  async findPublished(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    return this.findMany({ ...filter, status: 'published' }, pagination);
  }

  async count(filter: ListingFilter): Promise<number> {
    const { count, error } = await this.applyFilter(this.supabase.from(TABLE), filter);
    if (error) throw error;
    return count ?? 0;
  }

  async exists(id: ListingId): Promise<boolean> {
    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('id', id)
      .is('deleted_at', null);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateListingInput): Promise<Listing> {
    const slug = await this.uniqueSlug(input.title);
    const entity = createListing({ ...input, slug, status: 'draft' });
    const row = prepareSupabaseWrite('insert', TABLE, { id: entity.id, ...toListingRow(entity) }, {
      requiredUuidFields: ['id', 'owner_id', 'category_id', 'listing_type_id'],
      nullableUuidFields: ['company_id'],
    });

    console.log('Supabase insert table:', TABLE);
    console.log('userId:', row.owner_id);
    console.log('companyId:', row.company_id);
    console.log(JSON.stringify(row, null, 2));

    try {
      const { data, error } = await this.supabase.from(TABLE).insert(row).select('*').single();
      if (error) throw error;
      return mapListingRow(data as ListingRow);
    } catch (error) {
      const supabaseError = error as { message?: string; details?: string; code?: string };
      console.error('Supabase insert failed — table:', TABLE);
      console.error('error.message:', supabaseError.message);
      console.error('error.details:', supabaseError.details);
      console.error('error.code:', supabaseError.code);
      console.error('failing payload:', JSON.stringify(row, null, 2));
      logSupabaseError(error, `${TABLE} insert`);
      throw error;
    }
  }

  async update(id: ListingId, input: UpdateListingInput): Promise<Listing> {
    const row = prepareSupabaseWrite('update', TABLE, toListingUpdateRow(input), {
      nullableUuidFields: ['company_id'],
    });
    row.updated_at = now();
    const { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error) {
      logSupabaseError(error, `${TABLE} update ${id}`);
      throw error;
    }
    if (!data) throw new NotFoundError('Listing', id);
    return mapListingRow(data as ListingRow);
  }

  async softDelete(id: ListingId): Promise<void> {
    await this.transitionStatus(id, 'deleted');
    const { error } = await this.supabase
      .from(TABLE)
      .update({ deleted_at: now(), updated_at: now() })
      .eq('id', id);
    if (error) throw error;
  }

  async delete(id: ListingId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: ListingId): Promise<Listing> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ deleted_at: null, status: 'draft', updated_at: now() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Listing', id);
    return mapListingRow(data as ListingRow);
  }

  async incrementViewCount(id: ListingId): Promise<void> {
    const listing = await this.findById(id, { includeDeleted: true });
    if (!listing) throw new NotFoundError('Listing', id);
    const { error } = await this.supabase
      .from(TABLE)
      .update({ view_count: listing.viewCount + 1, updated_at: now() })
      .eq('id', id);
    if (error) throw error;
  }

  async incrementApplicationCount(id: ListingId): Promise<void> {
    const listing = await this.findById(id, { includeDeleted: true });
    if (!listing) throw new NotFoundError('Listing', id);
    const { error } = await this.supabase
      .from(TABLE)
      .update({ application_count: listing.applicationCount + 1, updated_at: now() })
      .eq('id', id);
    if (error) throw error;
  }

  async transitionStatus(id: ListingId, to: ListingStatus): Promise<Listing> {
    const listing = await this.findById(id, { includeDeleted: true });
    if (!listing) throw new NotFoundError('Listing', id);
    if (!canTransition(LISTING_LIFECYCLE, listing.status, to)) {
      throw new InvalidTransitionError(listing.status, to);
    }
    const update = prepareSupabaseWrite('update', TABLE, {
      status: to,
      updated_at: now(),
      ...(to === 'published'
        ? {
            published_at: listing.publishedAt ?? now(),
            expires_at: computeListingExpiry(),
            rejected_reason: null,
          }
        : {}),
      ...(to === 'pending_review' ? { rejected_reason: null } : {}),
    });
    const { data, error } = await this.supabase.from(TABLE).update(update).eq('id', id).select('*').single();
    if (error) {
      logSupabaseError(error, `${TABLE} transitionStatus ${id} → ${to}`);
      throw error;
    }
    return mapListingRow(data as ListingRow);
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = slugify(base);
    let attempt = slug;
    let i = 1;
    while (await this.findBySlug(attempt)) {
      attempt = `${slug}-${i}`;
      i += 1;
    }
    return attempt;
  }
}
