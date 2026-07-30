/**
 * Supabase verification repository — marketplace_verifications.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { canTransition } from '@/lib/domain/base';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { VerificationId, UserId, CompanyId } from '@/lib/domain/ids';
import type {
  Verification,
  CreateVerificationInput,
  UpdateVerificationInput,
  VerificationFilter,
} from '@/features/authentication/types/verification.types';
import type { VerificationRepository } from '@/features/authentication/repositories/verification.repository';
import { createVerification } from '@/features/authentication/factories/verification.factory';
import { VERIFICATION_LIFECYCLE } from '@/features/authentication/types/verification.types';
import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';

const TABLE = 'marketplace_verifications';

interface VerificationRow {
  id: string;
  user_id: string;
  company_id: string | null;
  type: string;
  status: string;
  document_urls: string[];
  reviewer_id: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function mapVerificationRow(row: VerificationRow): Verification {
  return {
    id: row.id as VerificationId,
    userId: row.user_id as UserId,
    companyId: row.company_id as CompanyId | null,
    type: row.type as Verification['type'],
    status: row.status as Verification['status'],
    documentUrls: Array.isArray(row.document_urls) ? row.document_urls : [],
    reviewerId: row.reviewer_id as UserId | null,
    reviewedAt: row.reviewed_at,
    rejectionReason: row.rejection_reason,
    expiresAt: row.expires_at,
    metadata: row.metadata ?? {},
    ...fromTimestamps(row),
    ...fromSoftDeletable(row),
  };
}

export class SupabaseVerificationRepository implements VerificationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: VerificationId, filter?: RepositoryFilter): Promise<Verification | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapVerificationRow(data as VerificationRow) : null;
  }

  async findMany(filter: VerificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Verification>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    let query = this.supabase.from(TABLE).select('*', { count: 'exact' });
    if (!filter.includeDeleted) query = query.is('deleted_at', null);
    if (filter.userId) query = query.eq('user_id', filter.userId);
    if (filter.companyId) query = query.eq('company_id', filter.companyId);
    if (filter.type) query = query.eq('type', filter.type);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      query = query.in('status', statuses);
    }
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, end);
    if (error) throw error;
    return paginatedResult((data ?? []).map((r) => mapVerificationRow(r as VerificationRow)), count ?? 0, page, limit);
  }

  async paginate(filter: VerificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Verification>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: VerificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Verification>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: VerificationFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: VerificationId): Promise<boolean> {
    const { count, error } = await this.supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('id', id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateVerificationInput): Promise<Verification> {
    const verification = createVerification(input);
    const { data, error } = await this.supabase.from(TABLE).insert({
      id: verification.id,
      user_id: verification.userId,
      company_id: verification.companyId,
      type: verification.type,
      status: verification.status,
      document_urls: verification.documentUrls,
      metadata: verification.metadata,
    }).select('*').single();
    if (error) throw error;
    return mapVerificationRow(data as VerificationRow);
  }

  async update(id: VerificationId, input: UpdateVerificationInput): Promise<Verification> {
    const row: Record<string, unknown> = { updated_at: now() };
    if (input.status !== undefined) row.status = input.status;
    if (input.reviewerId !== undefined) row.reviewer_id = input.reviewerId;
    if (input.reviewedAt !== undefined) row.reviewed_at = input.reviewedAt;
    if (input.rejectionReason !== undefined) row.rejection_reason = input.rejectionReason;
    if (input.expiresAt !== undefined) row.expires_at = input.expiresAt;
    if (input.documentUrls !== undefined) row.document_urls = input.documentUrls;
    const { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    return mapVerificationRow(data as VerificationRow);
  }

  async softDelete(id: VerificationId): Promise<void> {
    const { error } = await this.supabase.from(TABLE).update({ deleted_at: now(), updated_at: now() }).eq('id', id);
    if (error) throw error;
  }

  async delete(id: VerificationId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: VerificationId): Promise<Verification> {
    const { data, error } = await this.supabase.from(TABLE).update({ deleted_at: null, updated_at: now() }).eq('id', id).select('*').single();
    if (error) throw error;
    return mapVerificationRow(data as VerificationRow);
  }

  async findPendingByUserAndType(userId: UserId, type: Verification['type']): Promise<Verification | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .in('status', ['pending', 'in_review'])
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw error;
    return data ? mapVerificationRow(data as VerificationRow) : null;
  }

  async transitionStatus(id: VerificationId, status: Verification['status']): Promise<Verification> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Verification', id);
    if (!canTransition(VERIFICATION_LIFECYCLE, existing.status, status)) {
      throw new InvalidTransitionError(existing.status, status);
    }
    return this.update(id, { status });
  }
}
