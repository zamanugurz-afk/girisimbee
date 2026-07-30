/**
 * Mock report repository — in-memory store (starts empty).
 */
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { canTransition } from '@/lib/domain/base';
import type { ReportId } from '@/lib/domain/ids';
import type { Report, CreateReportInput, UpdateReportInput, ReportFilter } from '@/features/shared/types/report.types';
import type { ReportRepository } from '@/features/shared/repositories/report.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createReport } from '@/features/shared/factories/report.factory';
import { REPORT_LIFECYCLE } from '@/features/shared/types/report.types';

export class MockReportRepository implements ReportRepository {
  private reports = new Map<ReportId, Report>();

  async findById(id: ReportId, filter?: RepositoryFilter): Promise<Report | null> {
    const r = this.reports.get(id);
    if (!r) return null;
    if (!filter?.includeDeleted && r.deletedAt) return null;
    return r;
  }

  async findMany(filter: ReportFilter, pagination?: PaginationParams): Promise<PaginatedResult<Report>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.reports.values()];
    if (!filter.includeDeleted) results = results.filter((r) => !r.deletedAt);
    if (filter.reporterId) results = results.filter((r) => r.reporterId === filter.reporterId);
    if (filter.entityType) results = results.filter((r) => r.entityType === filter.entityType);
    if (filter.entityId) results = results.filter((r) => r.entityId === filter.entityId);
    if (filter.reason) results = results.filter((r) => r.reason === filter.reason);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((r) => statuses.includes(r.status));
    }
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
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
    return this.reports.has(id);
  }

  async create(input: CreateReportInput): Promise<Report> {
    const report = createReport(input);
    this.reports.set(report.id, report);
    return report;
  }

  async update(id: ReportId, input: UpdateReportInput): Promise<Report> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Report', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.reports.set(id, updated);
    return updated;
  }

  async softDelete(id: ReportId): Promise<void> {
    const r = await this.findById(id);
    if (!r) throw new NotFoundError('Report', id);
    this.reports.set(id, { ...r, status: 'deleted', deletedAt: now(), updatedAt: now() });
  }

  async delete(id: ReportId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: ReportId): Promise<Report> {
    const r = await this.findById(id, { includeDeleted: true });
    if (!r) throw new NotFoundError('Report', id);
    const updated = { ...r, status: 'submitted' as Report['status'], deletedAt: null, updatedAt: now() };
    this.reports.set(id, updated);
    return updated;
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
    const updated = { ...existing, status, updatedAt: now() };
    this.reports.set(id, updated);
    return updated;
  }
}
