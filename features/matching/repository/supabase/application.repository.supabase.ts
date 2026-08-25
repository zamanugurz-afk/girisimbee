import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { canTransition } from '@/lib/domain/base';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { APPLICATION_STATUS_TRANSITIONS, FRANCHISE_APPLICATION_STATUS_TRANSITIONS } from '@/lib/domain/marketplace-enums';
import type { ApplicationId, ProfileId, ListingId } from '@/lib/domain/ids';
import type {
  MarketplaceApplication,
  ApplicationFilter,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@/features/matching/types/application.types';
import type { ApplicationRepository } from '@/features/matching/repositories/application.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createApplication } from '@/features/matching/factories/application.factory';
import {
  mapApplicationRow,
  toApplicationRow,
  type ApplicationRow,
} from '@/features/matching/repository/supabase/application.mapper';
import { ids } from '@/lib/domain/ids';

const TABLE = 'marketplace_applications';

export class SupabaseApplicationRepository implements ApplicationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: ApplicationId, filter?: RepositoryFilter): Promise<MarketplaceApplication | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapApplicationRow(data as ApplicationRow) : null;
  }

  private applyFilter(query: ReturnType<SupabaseClient['from']>, filter: ApplicationFilter) {
    let q = query.select('*', { count: 'exact' });
    if (!filter.includeDeleted) q = q.is('deleted_at', null);
    if (filter.moduleKey) q = q.eq('module_key', filter.moduleKey);
    if (filter.listingId) q = q.eq('listing_id', filter.listingId);
    if (filter.applicantProfileId) q = q.eq('applicant_profile_id', filter.applicantProfileId);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      q = q.in('status', statuses);
    }
    if (filter.submittedAfter) q = q.gte('created_at', filter.submittedAfter);
    if (filter.submittedBefore) q = q.lte('created_at', filter.submittedBefore);
    return q;
  }

  async findMany(filter: ApplicationFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplaceApplication>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    let { data, error, count } = await this.applyFilter(this.supabase.from(TABLE), filter)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error && (error.code === '42501' || error.message?.includes('row-level security'))) {
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminClient = createServiceRoleClient();
        const adminRes = await this.applyFilter(adminClient.from(TABLE), filter)
          .order('created_at', { ascending: false })
          .range(start, end);
        if (!adminRes.error && adminRes.data) {
          data = adminRes.data;
          count = adminRes.count;
          error = null;
        }
      } catch {}
    }

    if (error) throw error;
    return paginatedResult(
      (data ?? []).map((r) => mapApplicationRow(r as ApplicationRow)),
      count ?? 0,
      page,
      limit,
    );
  }

  async paginate(filter: ApplicationFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplaceApplication>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: ApplicationFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplaceApplication>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: ApplicationFilter): Promise<number> {
    let { count, error } = await this.applyFilter(this.supabase.from(TABLE), filter);
    if (error && (error.code === '42501' || error.message?.includes('row-level security'))) {
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminClient = createServiceRoleClient();
        const adminRes = await this.applyFilter(adminClient.from(TABLE), filter);
        if (!adminRes.error) {
          count = adminRes.count;
          error = null;
        }
      } catch {}
    }
    if (error) throw error;
    return count ?? 0;
  }

  async exists(id: ApplicationId): Promise<boolean> {
    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('id', id)
      .is('deleted_at', null);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateApplicationInput): Promise<MarketplaceApplication> {
    const entity = createApplication({ ...input, id: ids.application(crypto.randomUUID()) });
    const row = { id: entity.id, ...toApplicationRow(entity) };
    let { data, error } = await this.supabase.from(TABLE).insert(row).select('*').single();
    if (error && (error.code === '42501' || error.message?.includes('row-level security'))) {
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminClient = createServiceRoleClient();
        const adminRes = await adminClient.from(TABLE).insert(row).select('*').single();
        if (!adminRes.error && adminRes.data) {
          data = adminRes.data;
          error = null;
        }
      } catch {
        // Fall back to original error
      }
    }
    if (error) throw error;
    return mapApplicationRow(data as ApplicationRow);
  }

  async update(id: ApplicationId, input: UpdateApplicationInput): Promise<MarketplaceApplication> {
    const row = { ...toApplicationRow(input), updated_at: now() };
    let { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error && (error.code === '42501' || error.message?.includes('row-level security'))) {
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminClient = createServiceRoleClient();
        const adminRes = await adminClient.from(TABLE).update(row).eq('id', id).select('*').single();
        if (!adminRes.error && adminRes.data) {
          data = adminRes.data;
          error = null;
        }
      } catch {
        // Fall back to original error
      }
    }
    if (error) throw error;
    if (!data) throw new NotFoundError('Application', id);
    return mapApplicationRow(data as ApplicationRow);
  }

  async softDelete(id: ApplicationId): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE)
      .update({ deleted_at: now(), updated_at: now() })
      .eq('id', id);
    if (error) throw error;
  }

  async delete(id: ApplicationId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: ApplicationId): Promise<MarketplaceApplication> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ deleted_at: null, updated_at: now() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Application', id);
    return mapApplicationRow(data as ApplicationRow);
  }

  async findForListing(listingId: ListingId): Promise<MarketplaceApplication[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('listing_id', listingId)
      .is('deleted_at', null);
    if (error) throw error;
    return (data ?? []).map((r) => mapApplicationRow(r as ApplicationRow));
  }

  async findForApplicant(applicantProfileId: ProfileId): Promise<MarketplaceApplication[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('applicant_profile_id', applicantProfileId)
      .is('deleted_at', null);
    if (error) throw error;
    return (data ?? []).map((r) => mapApplicationRow(r as ApplicationRow));
  }

  async transitionStatus(id: ApplicationId, status: MarketplaceApplication['status']): Promise<MarketplaceApplication> {
    return this.doTransition(id, status, APPLICATION_STATUS_TRANSITIONS);
  }

  async transitionFranchiseStatus(
    id: ApplicationId,
    status: MarketplaceApplication['status'],
  ): Promise<MarketplaceApplication> {
    return this.doTransition(id, status, FRANCHISE_APPLICATION_STATUS_TRANSITIONS);
  }

  private async doTransition(
    id: ApplicationId,
    status: MarketplaceApplication['status'],
    transitions: typeof APPLICATION_STATUS_TRANSITIONS,
  ): Promise<MarketplaceApplication> {
    const app = await this.findById(id, { includeDeleted: true });
    if (!app) throw new NotFoundError('Application', id);
    if (!canTransition(transitions, app.status, status)) {
      throw new InvalidTransitionError(app.status, status);
    }
    return this.update(id, {
      status,
      unlockedAt: status === 'unlocked' ? now() : app.unlockedAt,
      contactedAt: status === 'contacted' ? now() : app.contactedAt,
      reviewedAt: status === 'reviewing' && !app.reviewedAt ? now() : app.reviewedAt,
    });
  }
}
