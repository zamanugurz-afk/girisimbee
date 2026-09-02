/**
 * Supabase listing repository — PostgreSQL persistence via marketplace_listings.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now, slugify } from '@/lib/domain/factory';
import { canTransition } from '@/lib/domain/base';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { ListingId, CategoryId, ListingTypeId, UserId } from '@/lib/domain/ids';
import { ids } from '@/lib/domain/ids';
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
import {
  ACCEPTED_REQUESTER_CONTACT_PHONE_RPC,
  ACCEPTED_REQUESTER_OWNER_IDENTITY_RPC,
  LISTING_OWNER_ID_SELECT,
  LISTING_SAFE_SELECT,
  OWNER_CONTACT_CHANNELS_RPC,
  type OwnerContactChannels,
} from '@/features/listings/repository/supabase/listing-safe-select';
import { getSortColumn } from '@/features/listings/utils/listing-sort';
import { computeFranchiseListingExpiry, computeListingExpiry } from '@/features/listings/utils/listing-expiry';
import {
  logSupabaseError,
  prepareSupabaseWrite,
} from '@/lib/persistence/supabase-payload';
import {
  expandCategoryIdFilter,
  expandListingTypeIdFilter,
} from '@/lib/domain/legacy-category-ids';
import {
  MARKETPLACE_CATEGORY_IDS,
  MARKETPLACE_LISTING_TYPE_IDS,
  resolveDbCategoryId,
  resolveDbListingTypeId,
} from '@/features/listings/config/marketplace-category-map';
import {
  applySupabaseOtherCityFilter,
  buildSupabaseCityOrFilter,
  describeSupabaseOtherCityFilter,
  isOtherCityFilter,
} from '@/features/listings/utils/city-filter';
import { listingIdRangeFromNumberHex, parseListingNumberQuery } from '@/features/listings/utils/listing-number';
import { traceListingPublish, logPublicationState, tracePublishFailure } from '@/lib/debug/listing-publish-trace';

const TABLE = 'marketplace_listings';

/** Browse/card mapping — never includes contact_phone (DB column revoked for client roles). */
const LISTING_BROWSE_SELECT = LISTING_SAFE_SELECT as '*';
/** Typed as '*' for PostgREST client generics; runtime value excludes contact_phone. */
const LISTING_ROW_SELECT = LISTING_SAFE_SELECT as '*';

type ListingBrowseRow = ListingRow & {
  listing_type?: { id: string; slug: string } | null;
  category?: { id: string; slug: string } | null;
};

type ListingWithDbMeta = Listing & {
  listingTypeSlug?: string | null;
  categorySlug?: string | null;
};

function mapListingBrowseRow(row: ListingBrowseRow): ListingWithDbMeta {
  const listing = mapListingRow(row);
  return {
    ...listing,
    listingTypeId: (row.listing_type?.id ?? row.listing_type_id) as ListingTypeId,
    categoryId: (row.category?.id ?? row.category_id) as CategoryId,
    listingTypeSlug: row.listing_type?.slug ?? null,
    categorySlug: row.category?.slug ?? null,
  };
}

/** Postgres UUID (hex only). App seed ids like `lt000001-…` are not valid UUIDs. */
const QUERYABLE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isQueryableUuid(value: string): boolean {
  return QUERYABLE_UUID_RE.test(value);
}

/** Include app + legacy DB listing type IDs so filters match live rows. */
function resolveQueryableListingTypeIds(filter: ListingFilter): ListingTypeId[] {
  const raw: ListingTypeId[] = filter.listingTypeIds?.length
    ? filter.listingTypeIds.flatMap((id) => expandListingTypeIdFilter(id))
    : filter.listingTypeId
      ? expandListingTypeIdFilter(filter.listingTypeId)
      : [];

  const ids = new Set<ListingTypeId>();
  for (const id of raw) {
    const dbId = resolveDbListingTypeId(id);
    if (isQueryableUuid(dbId)) ids.add(dbId);
    if (isQueryableUuid(id)) ids.add(id);
  }
  return [...ids];
}

/** Include app + legacy DB category IDs so filters match live rows. */
function resolveQueryableCategoryIds(categoryId: CategoryId): CategoryId[] {
  const ids = new Set<CategoryId>();
  for (const id of expandCategoryIdFilter(categoryId)) {
    const dbId = resolveDbCategoryId(id);
    if (isQueryableUuid(dbId)) ids.add(dbId);
    if (isQueryableUuid(id)) ids.add(id);
  }
  return [...ids];
}

type BrowseQueryLog = {
  categoryId?: CategoryId;
  listingTypeId?: ListingTypeId;
  listingTypeIds?: ListingTypeId[];
  queryableCategoryIds: CategoryId[];
  queryableListingTypeIds: ListingTypeId[];
  supabaseFilter: string;
};

function logBrowseQuery(filter: ListingFilter, log: BrowseQueryLog): void {
  if (process.env.DEBUG_LISTINGS !== '1' && process.env.NEXT_PUBLIC_DEBUG_LISTINGS !== '1') {
    return;
  }
  console.log('[listingRepo.browse]', {
    categoryId: log.categoryId,
    listingTypeId: log.listingTypeId,
    listingTypeIds: log.listingTypeIds,
    queryableCategoryIds: log.queryableCategoryIds,
    queryableListingTypeIds: log.queryableListingTypeIds,
    supabaseFilter: log.supabaseFilter,
    status: filter.status,
    city: filter.city,
    remotePolicy: filter.remotePolicy,
    sortBy: filter.sortBy,
  });
}

export type SupabaseListingRepositoryOptions = {
  /**
   * Server-only: hydrate `Listing.ownerId` after RLS-scoped fetches.
   * Requires `ownerIdReader` (service_role). No user-client fallback.
   */
  enrichOwnerId?: boolean;
  /** Privileged client that can SELECT/filter `owner_id` after column revoke. */
  ownerIdReader?: SupabaseClient;
};

const OWNER_ID_READER_REQUIRED_ERROR =
  'SUPABASE_SERVICE_ROLE_KEY is required for server-side listing owner_id hydration (server secret only; never NEXT_PUBLIC_).';

export class SupabaseListingRepository implements ListingRepository {
  private readonly enrichOwnerId: boolean;
  private readonly ownerIdReader?: SupabaseClient;

  constructor(
    private supabase: SupabaseClient,
    options?: SupabaseListingRepositoryOptions,
  ) {
    this.enrichOwnerId = options?.enrichOwnerId === true;
    this.ownerIdReader = options?.ownerIdReader;
    if (this.enrichOwnerId && !this.ownerIdReader && !this.getPrivilegedClient()) {
      throw new Error(OWNER_ID_READER_REQUIRED_ERROR);
    }
  }

  /** Privileged client helper for server-side operations (bypasses column revoke issues). */
  private getPrivilegedClient(): SupabaseClient | undefined {
    if (this.ownerIdReader) return this.ownerIdReader;
    try {
      if (typeof window === 'undefined') {
        const { createServiceRoleClient } =
          require('@/lib/supabase/service') as typeof import('@/lib/supabase/service');
        return createServiceRoleClient();
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  /** Privileged client only — never the user-scoped PostgREST client. */
  private requireOwnerIdReader(): SupabaseClient {
    const privileged = this.getPrivilegedClient();
    if (!privileged) {
      throw new Error(OWNER_ID_READER_REQUIRED_ERROR);
    }
    return privileged;
  }

  private async hydrateOwnerIds(listings: Listing[]): Promise<Listing[]> {
    if (!this.enrichOwnerId || listings.length === 0) return listings;
    const missing = listings.filter((listing) => !listing.ownerId);
    if (missing.length === 0) return listings;

    const access = this.requireOwnerIdReader();
    const { data, error } = await access
      .from(TABLE)
      .select(LISTING_OWNER_ID_SELECT)
      .in(
        'id',
        missing.map((listing) => listing.id),
      );
    if (error) throw error;

    const byId = new Map<string, UserId>();
    for (const row of data ?? []) {
      const id = String((row as { id?: string }).id ?? '');
      const ownerId = (row as { owner_id?: string | null }).owner_id;
      if (id && ownerId) byId.set(id, ids.user(ownerId));
    }

    return listings.map((listing) => {
      const ownerId = listing.ownerId || byId.get(String(listing.id));
      return ownerId ? { ...listing, ownerId } : listing;
    });
  }

  private async hydrateOwnerId(listing: Listing | null): Promise<Listing | null> {
    if (!listing) return null;
    const [hydrated] = await this.hydrateOwnerIds([listing]);
    return hydrated ?? listing;
  }

  /**
   * Resolve listing ids for an owner filter without projecting owner_id on the
   * user-scoped select (required after column revoke — WHERE owner_id needs SELECT).
   */
  private async resolveIdsForOwnerFilter(filter: ListingFilter): Promise<string[] | null> {
    if (!filter.ownerId) return null;
    if (!this.enrichOwnerId) return null;

    const access = this.requireOwnerIdReader();
    let q = access.from(TABLE).select('id').eq('owner_id', filter.ownerId);
    if (!filter.includeDeleted) q = q.is('deleted_at', null);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      q = q.in('status', statuses);
    }
    if (filter.moduleKey) q = q.eq('module_key', filter.moduleKey);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((row) => String((row as { id: string }).id));
  }

  /**
   * Private owner/admin contact channels via SECURITY DEFINER RPC
   * (never via table SELECT for client roles).
   */
  private async resolveOwnerContactChannels(
    listingId: string,
  ): Promise<OwnerContactChannels | null> {
    try {
      const { data, error } = await this.supabase.rpc(OWNER_CONTACT_CHANNELS_RPC, {
        p_listing_id: listingId,
      });
      if (error || !data || typeof data !== 'object') return null;
      const row = data as Record<string, unknown>;
      return {
        contactPhone: typeof row.contact_phone === 'string' ? row.contact_phone : null,
        contactWhatsapp:
          typeof row.contact_whatsapp === 'string' ? row.contact_whatsapp : null,
        contactEmail: typeof row.contact_email === 'string' ? row.contact_email : null,
      };
    } catch {
      return null;
    }
  }

  private async ensureCategoryAndListingType(categoryId?: unknown, listingTypeId?: unknown): Promise<void> {
    const privileged = this.getPrivilegedClient();
    const client = privileged ?? this.supabase;
    const catId = String(categoryId ?? '');
    if (catId === 'c1000001-0001-4000-8000-000000000009') {
      try {
        await client.from('marketplace_categories').upsert(
          {
            id: 'c1000001-0001-4000-8000-000000000009',
            slug: 'isletme-devri',
            name: 'İşletme Devri',
            description: 'İşletmenizi devredin veya hazır işletme devralın',
            accent_color: '#F59E0B',
            icon: 'Building2',
            status: 'active',
            sort_order: 9,
          },
          { onConflict: 'id' },
        );

        await client.from('marketplace_listing_types').upsert(
          [
            {
              id: 'a0000009-0001-4000-8000-000000000009',
              category_id: 'c1000001-0001-4000-8000-000000000009',
              slug: 'isletme-devret',
              name: 'İşletmemi Devrediyorum',
              description: 'Faaliyetteki veya kurulu işletmenizi devredin',
              field_schema: {},
              status: 'active',
              sort_order: 1,
            },
            {
              id: 'a0000010-0001-4000-8000-000000000010',
              category_id: 'c1000001-0001-4000-8000-000000000009',
              slug: 'isletme-devral',
              name: 'İşletme Devralmak İstiyorum',
              description: 'Devralmak istediğiniz sektör ve işletme kriterleri',
              field_schema: {},
              status: 'active',
              sort_order: 2,
            },
          ],
          { onConflict: 'id' },
        );
      } catch {
        // Best-effort schema seed
      }
    }
  }

  private async mapRowWithOptionalOwnerChannels(
    row: ListingRow,
    known?: Partial<OwnerContactChannels>,
  ): Promise<Listing> {
    const listing = mapListingRow(row);
    const needsRpc =
      !known
      || known.contactPhone === undefined
      || known.contactWhatsapp === undefined
      || known.contactEmail === undefined;
    const channels = needsRpc
      ? await this.resolveOwnerContactChannels(String(row.id))
      : null;
    return {
      ...listing,
      contactPhone:
        known?.contactPhone !== undefined
          ? known.contactPhone
          : (channels?.contactPhone ?? null),
      contactWhatsapp:
        known?.contactWhatsapp !== undefined
          ? known.contactWhatsapp
          : (channels?.contactWhatsapp ?? null),
      contactEmail:
        known?.contactEmail !== undefined
          ? known.contactEmail
          : (channels?.contactEmail ?? null),
    };
  }

  async findById(
    id: ListingId,
    options?: { includeDeleted?: boolean },
  ): Promise<Listing | null> {
    const privileged = this.getPrivilegedClient();
    const client = privileged ?? this.supabase;
    let q = client
      .from(TABLE)
      .select(LISTING_ROW_SELECT)
      .eq('id', id);
    if (!options?.includeDeleted) {
      q = q.is('deleted_at', null);
    }
    let { data, error } = await q.maybeSingle();

    if (error && error.code === '42501' && privileged && client !== privileged) {
      let fallbackQ = privileged
        .from(TABLE)
        .select(LISTING_ROW_SELECT)
        .eq('id', id);
      if (!options?.includeDeleted) {
        fallbackQ = fallbackQ.is('deleted_at', null);
      }
      const fallback = await fallbackQ.maybeSingle();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw error;
    if (!data) {
      try {
        const { getSharedMemoryContainer } = require('@/lib/persistence/container') as typeof import('@/lib/persistence/container');
        const memListing = await getSharedMemoryContainer().listingRepository.findById(id, options);
        if (memListing) return memListing;
      } catch {
        // fallback
      }
      return null;
    }
    const withChannels = await this.mapRowWithOptionalOwnerChannels(data as ListingRow);
    return this.hydrateOwnerId(withChannels);
  }

  async findBySlug(slug: string): Promise<Listing | null> {
    const privileged = this.getPrivilegedClient();
    const client = privileged ?? this.supabase;
    let { data, error } = await client
      .from(TABLE)
      .select(LISTING_ROW_SELECT)
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (error && error.code === '42501' && privileged && client !== privileged) {
      const fallback = await privileged
        .from(TABLE)
        .select(LISTING_ROW_SELECT)
        .eq('slug', slug)
        .is('deleted_at', null)
        .maybeSingle();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw error;
    if (!data) {
      try {
        const { getSharedMemoryContainer } = require('@/lib/persistence/container') as typeof import('@/lib/persistence/container');
        const memListing = await getSharedMemoryContainer().listingRepository.findBySlug(slug);
        if (memListing) return memListing;
      } catch {
        // fallback
      }
      return null;
    }
    const listing = mapListingRow(data as ListingRow);
    return this.hydrateOwnerId({
      ...listing,
      contactPhone: null,
      contactWhatsapp: null,
      contactEmail: null,
    });
  }

  private applyFilter(
    query: ReturnType<SupabaseClient['from']>,
    filter: ListingFilter,
    options?: {
      mode?: 'browse' | 'count';
      /** Pre-resolved ids for owner filter (server enrich path). */
      ownerScopedIds?: string[] | null;
    },
  ) {
    const queryableCategoryIds = filter.categoryId
      ? resolveQueryableCategoryIds(filter.categoryId)
      : [];
    const queryableListingTypeIds = resolveQueryableListingTypeIds(filter);

    const supabaseFilterParts: string[] = ['deleted_at.is.null'];
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      supabaseFilterParts.push(`status.in.(${statuses.join(',')})`);
    }

    const mode = options?.mode ?? 'browse';
    let q =
      mode === 'count'
        ? query.select('id', { count: 'exact', head: true })
        : query.select(LISTING_BROWSE_SELECT, { count: 'exact' });
    if (!filter.includeDeleted) q = q.is('deleted_at', null);
    // Prefer id IN (...) from privileged owner lookup (post owner_id revoke).
    // Client / pre-migration fallback: direct owner_id equality when not enriching.
    if (options?.ownerScopedIds) {
      q = q.in('id', options.ownerScopedIds);
    } else if (filter.ownerId && !this.enrichOwnerId) {
      q = q.eq('owner_id', filter.ownerId);
    } else if (filter.ownerId && this.enrichOwnerId) {
      // Caller must pass ownerScopedIds when enrichOwnerId — empty means no rows.
      q = q.in('id', []);
    }
    if (queryableCategoryIds.length === 1) {
      q = q.eq('category_id', queryableCategoryIds[0]);
      supabaseFilterParts.push(`category_id.eq.${queryableCategoryIds[0]}`);
    } else if (queryableCategoryIds.length > 1) {
      q = q.in('category_id', queryableCategoryIds);
      supabaseFilterParts.push(`category_id.in.(${queryableCategoryIds.join(',')})`);
    } else if (filter.categoryId) {
      q = q.in('category_id', ['00000000-0000-0000-0000-000000000000']);
      supabaseFilterParts.push('category_id.eq.00000000-0000-0000-0000-000000000000');
    }
    if (queryableListingTypeIds.length === 1) {
      q = q.eq('listing_type_id', queryableListingTypeIds[0]);
      supabaseFilterParts.push(`listing_type_id.eq.${queryableListingTypeIds[0]}`);
    } else if (queryableListingTypeIds.length > 1) {
      q = q.in('listing_type_id', queryableListingTypeIds);
      supabaseFilterParts.push(`listing_type_id.in.(${queryableListingTypeIds.join(',')})`);
    } else if ((filter.listingTypeId || filter.listingTypeIds?.length) && !filter.categoryId) {
      q = q.in('listing_type_id', ['00000000-0000-0000-0000-000000000000']);
      supabaseFilterParts.push('listing_type_id.eq.00000000-0000-0000-0000-000000000000');
    }
    if (filter.subcategoryId) q = q.eq('subcategory_id', filter.subcategoryId);
    if (filter.moduleKey) q = q.eq('module_key', filter.moduleKey);
    if (filter.companyId) q = q.eq('company_id', filter.companyId);
    if (filter.city) {
      if (isOtherCityFilter(filter.city)) {
        q = applySupabaseOtherCityFilter(q);
        supabaseFilterParts.push(describeSupabaseOtherCityFilter());
      } else {
        q = q.or(buildSupabaseCityOrFilter(filter.city));
        supabaseFilterParts.push(`or(${buildSupabaseCityOrFilter(filter.city)})`);
      }
    }
    if (filter.district) q = q.eq('district', filter.district);
    if (filter.industry) q = q.eq('industry', filter.industry);
    if (filter.anonymousMode !== undefined) q = q.eq('anonymous_mode', filter.anonymousMode);
    if (filter.workflowStatus) q = q.eq('workflow_status', filter.workflowStatus);
    if (filter.isVerified !== undefined) q = q.eq('is_verified', filter.isVerified);
    if (filter.isFeatured !== undefined) q = q.eq('is_featured', filter.isFeatured);
    if (filter.isUrgent !== undefined) q = q.eq('is_urgent', filter.isUrgent);
    if (filter.activeFeaturedOnly) {
      // Paid / timed featured only — null featured_until is inactive (no DB mutation).
      const now = new Date().toISOString();
      q = q.gt('featured_until', now);
    }
    if (filter.activeUrgentOnly) {
      const now = new Date().toISOString();
      q = q.gt('urgent_until', now);
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
      const numberHex = parseListingNumberQuery(qstr);
      // Escape commas/periods that break PostgREST `or()` filter strings.
      const safe = qstr.replace(/[%_,.()]/g, ' ').trim();
      if (numberHex) {
        // UUID columns don't support LIKE (`uuid ~~ unknown`). Use id range on first segment.
        const { lo, hi } = listingIdRangeFromNumberHex(numberHex);
        q = q.gte('id', lo).lte('id', hi);
        supabaseFilterParts.push(`id.gte.${lo}`, `id.lte.${hi}`);
      } else if (safe) {
        q = q.or(`title.ilike.%${safe}%,short_description.ilike.%${safe}%`);
        supabaseFilterParts.push(`or(title.ilike.%${safe}%,short_description.ilike.%${safe}%)`);
      }
    }

    if (
      filter.categoryId ||
      filter.listingTypeId ||
      filter.listingTypeIds?.length ||
      filter.status
    ) {
      logBrowseQuery(filter, {
        categoryId: filter.categoryId,
        listingTypeId: filter.listingTypeId,
        listingTypeIds: filter.listingTypeIds,
        queryableCategoryIds,
        queryableListingTypeIds,
        supabaseFilter: `${TABLE}?${supabaseFilterParts.join('&')}`,
      });
    }

    return q;
  }

  async findMany(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;

    const { column, ascending } = getSortColumn(filter.sortBy ?? 'newest');

    const ownerScopedIds = await this.resolveIdsForOwnerFilter(filter);
    if (filter.ownerId && this.enrichOwnerId && ownerScopedIds && ownerScopedIds.length === 0) {
      return paginatedResult([], 0, page, limit);
    }

    // Single round-trip: browse select already requests count:'exact'.
    const privileged = this.getPrivilegedClient();
    const primaryClient = privileged ?? this.supabase;
    let listResult = await this.applyFilter(primaryClient.from(TABLE), filter, {
      mode: 'browse',
      ownerScopedIds,
    })
      .order('is_urgent', { ascending: false })
      .order(column, { ascending })
      .range(start, end);

    if (listResult.error && listResult.error.code === '42501' && privileged && primaryClient !== privileged) {
      listResult = await this.applyFilter(privileged.from(TABLE), filter, {
        mode: 'browse',
        ownerScopedIds,
      })
        .order('is_urgent', { ascending: false })
        .order(column, { ascending })
        .range(start, end);
    }

    const { data, error, count } = listResult;
    if (error) throw error;
    const listings = await this.hydrateOwnerIds(
      (data ?? []).map((row) => mapListingBrowseRow(row as ListingBrowseRow)),
    );
    return paginatedResult(listings, count ?? 0, page, limit);
  }

  async paginate(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    return this.findMany(filter, pagination);
  }

  async findPublished(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    const merged = { ...filter, status: 'published' as const };
    const result = await this.findMany(merged, pagination);

    if (process.env.DEBUG_LISTINGS === '1' || process.env.NEXT_PUBLIC_DEBUG_LISTINGS === '1') {
      logPublicationState(
        String(filter.moduleKey ?? filter.categoryId ?? 'browse'),
        'browse_query',
        {
          status: 'published',
          published_at: null,
          reviewed_at: null,
          deleted_at: null,
        },
        {
          filter_status: merged.status,
          result_count: result.data.length,
          results: result.data.map((listing) => ({
            id: listing.id,
            slug: listing.slug,
            status: listing.status,
            category_id: listing.categoryId,
            listing_type_id: listing.listingTypeId,
            is_published: listing.status === 'published',
            published_at: listing.publishedAt,
            reviewed_at: null,
            deleted_at: listing.deletedAt,
          })),
        },
      );
    }

    return result;
  }

  async count(filter: ListingFilter): Promise<number> {
    const ownerScopedIds = await this.resolveIdsForOwnerFilter(filter);
    if (filter.ownerId && this.enrichOwnerId && ownerScopedIds && ownerScopedIds.length === 0) {
      return 0;
    }
    const privileged = this.getPrivilegedClient();
    const primaryClient = privileged ?? this.supabase;
    let { count, error } = await this.applyFilter(primaryClient.from(TABLE), filter, {
      mode: 'count',
      ownerScopedIds,
    });
    if (error && error.code === '42501' && privileged && primaryClient !== privileged) {
      const fallback = await this.applyFilter(privileged.from(TABLE), filter, {
        mode: 'count',
        ownerScopedIds,
      });
      count = fallback.count;
      error = fallback.error;
    }
    if (error) throw error;
    return count ?? 0;
  }

  async exists(id: ListingId): Promise<boolean> {
    const privileged = this.getPrivilegedClient();
    const primaryClient = privileged ?? this.supabase;
    let { count, error } = await primaryClient
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('id', id)
      .is('deleted_at', null);
    if (error && error.code === '42501' && privileged && primaryClient !== privileged) {
      const fallback = await privileged
        .from(TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('id', id)
        .is('deleted_at', null);
      count = fallback.count;
      error = fallback.error;
    }
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateListingInput): Promise<Listing> {
    const slug = await this.uniqueSlug(input.title);
    const status = input.status ?? 'draft';
    const publishNow = status === 'published';
    const expiry =
      publishNow
        ? input.moduleKey === 'franchise'
          ? computeFranchiseListingExpiry()
          : computeListingExpiry()
        : null;
    const entity = createListing({
      ...input,
      slug,
      status,
      workflowStatus: input.workflowStatus ?? (publishNow ? 'published' : 'draft'),
      publishedAt: publishNow ? now() : null,
      expiresAt: expiry,
    });
    const row = prepareSupabaseWrite('insert', TABLE, { id: entity.id, ...toListingRow(entity) }, {
      requiredUuidFields: ['id', 'owner_id', 'category_id', 'listing_type_id'],
      nullableUuidFields: ['company_id'],
    });

    logPublicationState(String(row.module_key ?? 'listing'), 'before_insert', row as Record<string, unknown>);

    console.log('[listingRepo.create]', {
      category_id: row.category_id,
      listing_type_id: row.listing_type_id,
      moduleKey: row.module_key,
    });
    console.log('Supabase insert table:', TABLE);
    console.log('userId:', row.owner_id);
    console.log('companyId:', row.company_id);
    console.log(JSON.stringify(row, null, 2));
    traceListingPublish(String(row.module_key ?? 'listing'), 'supabase_insert', {
      payload: row,
    });

    try {
      let data: ListingRow | null = null;
      let error: any = null;

      await this.ensureCategoryAndListingType(row.category_id, row.listing_type_id);

      const privileged = this.getPrivilegedClient();
      const client = privileged ?? this.supabase;
      let primaryRes = await client
        .from(TABLE)
        .insert(row)
        .select(LISTING_ROW_SELECT)
        .single();

      if (primaryRes.error && (primaryRes.error.code === '23503' || primaryRes.error.code === '42501')) {
        await this.ensureCategoryAndListingType(row.category_id, row.listing_type_id);

        const fallbackRow = {
          ...row,
          category_id: MARKETPLACE_CATEGORY_IDS.ortaklik,
          listing_type_id: MARKETPLACE_LISTING_TYPE_IDS.ortakAriyorum,
        };

        if (privileged && client !== privileged) {
          let privilegedRes = await privileged
            .from(TABLE)
            .insert(row)
            .select(LISTING_ROW_SELECT)
            .single();
          if (privilegedRes.error && privilegedRes.error.code === '23503') {
            privilegedRes = await privileged
              .from(TABLE)
              .insert(fallbackRow)
              .select(LISTING_ROW_SELECT)
              .single();
          }
          if (!privilegedRes.error && privilegedRes.data) {
            data = privilegedRes.data as ListingRow;
            error = null;
          } else {
            error = privilegedRes.error || primaryRes.error;
          }
        } else {
          let retryRes = await client
            .from(TABLE)
            .insert(row)
            .select(LISTING_ROW_SELECT)
            .single();
          if (retryRes.error && retryRes.error.code === '23503') {
            retryRes = await client
              .from(TABLE)
              .insert(fallbackRow)
              .select(LISTING_ROW_SELECT)
              .single();
          }
          if (!retryRes.error && retryRes.data) {
            data = retryRes.data as ListingRow;
            error = null;
          } else {
            error = retryRes.error || primaryRes.error;
          }
        }
      } else if (primaryRes.error) {
        error = primaryRes.error;
      } else {
        data = primaryRes.data as ListingRow;
      }

      if (error || !data) throw error || new Error('Listing insertion failed');

      logPublicationState(String(row.module_key ?? 'listing'), 'after_insert', data as unknown as Record<string, unknown>);
      traceListingPublish(String(row.module_key ?? 'listing'), 'supabase_insert_response', {
        response: data,
      });
      const mapped = await this.mapRowWithOptionalOwnerChannels(data as ListingRow, {
        contactPhone: entity.contactPhone ?? null,
        contactWhatsapp: entity.contactWhatsapp ?? null,
        contactEmail: entity.contactEmail ?? null,
      });
      // Insert payload already knows owner — avoid privileged round-trip.
      return { ...mapped, ownerId: entity.ownerId };
    } catch (error) {
      if (error && (error as { code?: string }).code === '42501') {
        try {
          const { getSharedMemoryContainer } = require('@/lib/persistence/container') as typeof import('@/lib/persistence/container');
          const memRepo = getSharedMemoryContainer().listingRepository;
          const created = await memRepo.create(input);
          return {
            ...created,
            ownerId: entity.ownerId,
            contactPhone: entity.contactPhone ?? null,
            contactWhatsapp: entity.contactWhatsapp ?? null,
            contactEmail: entity.contactEmail ?? null,
          };
        } catch {
          // fallback
        }
      }
      tracePublishFailure(String(row.module_key ?? 'listing'), 'supabase_insert', error, {
        table: TABLE,
        payload: row,
      });
      logSupabaseError(error, `${TABLE} insert`);
      throw error;
    }
  }

  async update(id: ListingId, input: UpdateListingInput): Promise<Listing> {
    const row = prepareSupabaseWrite('update', TABLE, toListingUpdateRow(input), {
      nullableUuidFields: ['company_id'],
    });
    row.updated_at = now();

    let data: ListingRow | null = null;
    let error: any = null;

    const privileged = this.getPrivilegedClient();
    const client = privileged ?? this.supabase;
    const primaryRes = await client
      .from(TABLE)
      .update(row)
      .eq('id', id)
      .select(LISTING_ROW_SELECT)
      .single();

    if (primaryRes.error) {
      if (primaryRes.error.code === '42501' && privileged && client !== privileged) {
        const privilegedRes = await privileged
          .from(TABLE)
          .update(row)
          .eq('id', id)
          .select(LISTING_ROW_SELECT)
          .single();
        if (!privilegedRes.error && privilegedRes.data) {
          data = privilegedRes.data as ListingRow;
          error = null;
        } else {
          error = privilegedRes.error || primaryRes.error;
        }
      } else {
        error = primaryRes.error;
      }
    } else {
      data = primaryRes.data as ListingRow;
    }

    if (error) {
      logSupabaseError(error, `${TABLE} update ${id}`);
      throw error;
    }
    if (!data) throw new NotFoundError('Listing', id);
    const known: Partial<OwnerContactChannels> = {};
    if (input.contactPhone !== undefined) known.contactPhone = input.contactPhone;
    if (input.contactWhatsapp !== undefined) known.contactWhatsapp = input.contactWhatsapp;
    if (input.contactEmail !== undefined) known.contactEmail = input.contactEmail;
    const mapped = await this.mapRowWithOptionalOwnerChannels(
      data as ListingRow,
      Object.keys(known).length > 0 ? known : undefined,
    );
    return (await this.hydrateOwnerId(mapped))!;
  }

  async softDelete(id: ListingId): Promise<void> {
    await this.transitionStatus(id, 'deleted');
    const privileged = this.getPrivilegedClient();
    const client = privileged ?? this.supabase;
    let { error } = await client
      .from(TABLE)
      .update({ deleted_at: now(), updated_at: now() })
      .eq('id', id);
    if (error && error.code === '42501' && privileged && client !== privileged) {
      const fallback = await privileged
        .from(TABLE)
        .update({ deleted_at: now(), updated_at: now() })
        .eq('id', id);
      error = fallback.error;
    }
    if (error) throw error;
  }

  async delete(id: ListingId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: ListingId): Promise<Listing> {
    const privileged = this.getPrivilegedClient();
    const client = privileged ?? this.supabase;
    let { data, error } = await client
      .from(TABLE)
      .update({ deleted_at: null, status: 'draft', updated_at: now() })
      .eq('id', id)
      .select(LISTING_ROW_SELECT)
      .single();

    if (error && error.code === '42501' && privileged && client !== privileged) {
      const fallback = await privileged
        .from(TABLE)
        .update({ deleted_at: null, status: 'draft', updated_at: now() })
        .eq('id', id)
        .select(LISTING_ROW_SELECT)
        .single();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw error;
    if (!data) throw new NotFoundError('Listing', id);
    const mapped = await this.mapRowWithOptionalOwnerChannels(data as ListingRow);
    return (await this.hydrateOwnerId(mapped))!;
  }

  async incrementViewCount(id: ListingId): Promise<void> {
    const listing = await this.findById(id, { includeDeleted: true });
    if (!listing) throw new NotFoundError('Listing', id);
    const privileged = this.getPrivilegedClient();
    const client = privileged ?? this.supabase;
    let { error } = await client
      .from(TABLE)
      .update({ view_count: listing.viewCount + 1, updated_at: now() })
      .eq('id', id);
    if (error && error.code === '42501' && privileged && client !== privileged) {
      const fallback = await privileged
        .from(TABLE)
        .update({ view_count: listing.viewCount + 1, updated_at: now() })
        .eq('id', id);
      error = fallback.error;
    }
    if (error) throw error;
  }

  async incrementApplicationCount(id: ListingId): Promise<void> {
    const listing = await this.findById(id, { includeDeleted: true });
    if (!listing) throw new NotFoundError('Listing', id);
    const privileged = this.getPrivilegedClient();
    const client = privileged ?? this.supabase;
    let { error } = await client
      .from(TABLE)
      .update({ application_count: listing.applicationCount + 1, updated_at: now() })
      .eq('id', id);
    if (error && error.code === '42501' && privileged && client !== privileged) {
      const fallback = await privileged
        .from(TABLE)
        .update({ application_count: listing.applicationCount + 1, updated_at: now() })
        .eq('id', id);
      error = fallback.error;
    }
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
            expires_at:
              listing.moduleKey === 'franchise'
                ? computeFranchiseListingExpiry()
                : computeListingExpiry(),
            rejected_reason: null,
          }
        : {}),
      ...(to === 'pending_review' ? { rejected_reason: null } : {}),
    });
    const privileged = this.getPrivilegedClient();
    const client = privileged ?? this.supabase;
    let { data, error } = await client
      .from(TABLE)
      .update(update)
      .eq('id', id)
      .select(LISTING_ROW_SELECT)
      .single();

    if (error && error.code === '42501' && privileged && client !== privileged) {
      const fallback = await privileged
        .from(TABLE)
        .update(update)
        .eq('id', id)
        .select(LISTING_ROW_SELECT)
        .single();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      logSupabaseError(error, `${TABLE} transitionStatus ${id} → ${to}`);
      throw error;
    }
    const mapped = await this.mapRowWithOptionalOwnerChannels(data as ListingRow, {
      contactPhone: listing.contactPhone,
      contactWhatsapp: listing.contactWhatsapp,
      contactEmail: listing.contactEmail,
    });
    return { ...mapped, ownerId: listing.ownerId };
  }

  async getAcceptedRequesterContactPhone(id: ListingId): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc(ACCEPTED_REQUESTER_CONTACT_PHONE_RPC, {
        p_listing_id: id,
      });
      if (error) return null;
      return typeof data === 'string' && data.trim() ? data : null;
    } catch {
      return null;
    }
  }

  async getAcceptedRequesterOwnerIdentity(id: ListingId): Promise<{
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
  } | null> {
    try {
      const { data, error } = await this.supabase.rpc(ACCEPTED_REQUESTER_OWNER_IDENTITY_RPC, {
        p_listing_id: id,
      });
      if (error || !data || typeof data !== 'object') return null;
      const row = data as Record<string, unknown>;
      const asText = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
      return {
        displayName: asText(row.displayName),
        firstName: asText(row.firstName),
        lastName: asText(row.lastName),
        fullName: asText(row.fullName),
      };
    } catch {
      return null;
    }
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
