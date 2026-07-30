/**
 * Supabase report repository — marketplace_reports.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { canTransition } from '@/lib/domain/base';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { ReportId, UserId } from '@/lib/domain/ids';
import type { Report, CreateReportInput, UpdateReportInput, ReportFilter } from '@/features/shared/types/report.types';
import type { ReportRepository } from '@/features/shared/repositories/report.repository';
import { createReport } from '@/features/shared/factories/report.factory';
import { REPORT_LIFECYCLE } from '@/features/shared/types/report.types';
import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';

const TABLE = 'marketplace_reports';

interface ReportRow {
  id: string;
  reporter_id: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  description: string | null;
  status: string;
  reviewer_id: string | null;
  reviewed_at: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function mapReportRow(row: ReportRow): Report {
  return {
    id: row.id as ReportId,
    reporterId: row.reporter_id as UserId,
    entityType: row.entity_type as Report['entityType'],
    entityId: row.entity_id,
    reason: row.reason as Report['reason'],
    description: row.description,
    status: row.status as Report['status'],
    reviewerId: row.reviewer_id as UserId | null,
    reviewedAt: row.reviewed_at,
    resolution: row.resolution,
    ...fromTimestamps(row),
    ...fromSoftDeletable(row),
  };
}

export class SupabaseReportRepository implements ReportRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: ReportId, filter?: RepositoryFilter): Promise<Report | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapReportRow(data as ReportRow) : null;
  }

  async findMany(filter: ReportFilter, pagination?: PaginationParams): Promise<PaginatedResult<Report>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    let query = this.supabase.from(TABLE).select('*', { count: 'exact' });
    if (!filter.includeDeleted) query = query.is('deleted_at', null);
    if (filter.reporterId) query = query.eq('reporter_id', filter.reporterId);
    if (filter.entityType) query = query.eq('entity_type', filter.entityType);
    if (filter.entityId) query = query.eq('entity_id', filter.entityId);
    if (filter.reason) query = query.eq('reason', filter.reason);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      query = query.in('status', statuses);
    }
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, end);
    if (error) throw error;
    return paginatedResult((data ?? []).map((r) => mapReportRow(r as ReportRow)), count ?? 0, page, limit);
  }

  async paginate(filter: ReportFilter, pagination?: PaginationParams): Promise<PaginatedResult<Report>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: ReportFilter, pagination?: PaginationParams): Promise<PaginatedResult<Report>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: ReportFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: ReportId): Promise<boolean> {
    const { count, error } = await this.supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('id', id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateReportInput): Promise<Report> {
    const report = createReport(input);
    const { data, error } = await this.supabase.from(TABLE).insert({
      id: report.id,
      reporter_id: report.reporterId,
      entity_type: report.entityType,
      entity_id: report.entityId,
      reason: report.reason,
      description: report.description,
      status: report.status,
    }).select('*').single();
    if (error) throw error;
    return mapReportRow(data as ReportRow);
  }

  async update(id: ReportId, input: UpdateReportInput): Promise<Report> {
    const row: Record<string, unknown> = { updated_at: now() };
    if (input.status !== undefined) row.status = input.status;
    if (input.reviewerId !== undefined) row.reviewer_id = input.reviewerId;
    if (input.reviewedAt !== undefined) row.reviewed_at = input.reviewedAt;
    if (input.resolution !== undefined) row.resolution = input.resolution;
    const { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    return mapReportRow(data as ReportRow);
  }

  async softDelete(id: ReportId): Promise<void> {
    const { error } = await this.supabase.from(TABLE).update({ status: 'deleted', deleted_at: now(), updated_at: now() }).eq('id', id);
    if (error) throw error;
  }

  async delete(id: ReportId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: ReportId): Promise<Report> {
    const { data, error } = await this.supabase.from(TABLE).update({ status: 'submitted', deleted_at: null, updated_at: now() }).eq('id', id).select('*').single();
    if (error) throw error;
    return mapReportRow(data as ReportRow);
  }

  async findByEntity(entityType: Report['entityType'], entityId: string): Promise<Report[]> {
    const { data } = await this.findMany({ entityType, entityId }, { page: 1, limit: 100 });
    return data;
  }

  async transitionStatus(id: ReportId, status: Report['status']): Promise<Report> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Report', id);
    if (!canTransition(REPORT_LIFECYCLE, existing.status, status)) {
      throw new InvalidTransitionError(existing.status, status);
    }
    return this.update(id, { status });
  }
}
