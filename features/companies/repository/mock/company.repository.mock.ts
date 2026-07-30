/**
 * Mock company repository — in-memory company store.
 */
import { now } from '@/lib/domain/factory';
import { canTransition } from '@/lib/domain/base';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import type { CompanyId, UserId } from '@/lib/domain/ids';
import type { Company, CreateCompanyInput, UpdateCompanyInput, CompanyFilter, CompanyStatus } from '@/features/companies/types/company.types';
import type { CompanyRepository } from '@/features/companies/repositories/company.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { COMPANY_LIFECYCLE } from '@/features/companies/types/company.types';
import { createCompany } from '@/features/companies/factories/company.factory';

export class MockCompanyRepository implements CompanyRepository {
  private companies = new Map<CompanyId, Company>();
  private slugIndex = new Map<string, CompanyId>();

  async findById(id: CompanyId, filter?: RepositoryFilter): Promise<Company | null> {
    const company = this.companies.get(id);
    if (!company) return null;
    if (!filter?.includeDeleted && company.deletedAt) return null;
    return company;
  }

  async findByIds(ids: CompanyId[]): Promise<Company[]> {
    const companies = await Promise.all(ids.map((id) => this.findById(id)));
    return companies.filter((c): c is Company => Boolean(c));
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const id = this.slugIndex.get(slug.trim().toLowerCase());
    if (!id) return null;
    return this.findById(id);
  }

  async isSlugTaken(slug: string, excludeCompanyId?: CompanyId): Promise<boolean> {
    const id = this.slugIndex.get(slug.trim().toLowerCase());
    if (!id) return false;
    if (excludeCompanyId && id === excludeCompanyId) return false;
    return true;
  }

  async findByOwnerId(ownerId: UserId): Promise<Company[]> {
    const { data } = await this.findMany({ ownerId }, { page: 1, limit: 100 });
    return data;
  }

  async findMany(filter: CompanyFilter, pagination?: PaginationParams): Promise<PaginatedResult<Company>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.companies.values()];
    if (!filter.includeDeleted) results = results.filter((c) => !c.deletedAt);
    if (filter.ownerId) results = results.filter((c) => c.ownerId === filter.ownerId);
    if (filter.industry) results = results.filter((c) => c.industry === filter.industry);
    if (filter.city) results = results.filter((c) => c.city === filter.city);
    if (filter.isVerified !== undefined) results = results.filter((c) => c.isVerified === filter.isVerified);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((c) => statuses.includes(c.status));
    }
    if (filter.query) {
      const q = filter.query.toLowerCase();
      results = results.filter((c) => c.name.toLowerCase().includes(q));
    }
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: CompanyFilter, pagination?: PaginationParams): Promise<PaginatedResult<Company>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: CompanyFilter, pagination?: PaginationParams): Promise<PaginatedResult<Company>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: CompanyFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: CompanyId): Promise<boolean> {
    return this.companies.has(id);
  }

  async create(input: CreateCompanyInput): Promise<Company> {
    const company = createCompany(input);
    this.companies.set(company.id, company);
    this.slugIndex.set(company.slug.toLowerCase(), company.id);
    return company;
  }

  async update(id: CompanyId, input: UpdateCompanyInput): Promise<Company> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Company', id);
    if (existing.slug) this.slugIndex.delete(existing.slug.toLowerCase());
    const updated = {
      ...existing,
      ...input,
      slug: input.slug ? input.slug.toLowerCase() : existing.slug,
      updatedAt: now(),
    };
    this.slugIndex.set(updated.slug.toLowerCase(), id);
    this.companies.set(id, updated);
    return updated;
  }

  async softDelete(id: CompanyId): Promise<void> {
    await this.transitionStatus(id, 'deleted');
    const company = this.companies.get(id)!;
    this.companies.set(id, { ...company, deletedAt: now() });
  }

  async delete(id: CompanyId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: CompanyId): Promise<Company> {
    const company = await this.findById(id, { includeDeleted: true });
    if (!company) throw new NotFoundError('Company', id);
    const updated = { ...company, deletedAt: null, status: 'draft' as CompanyStatus, updatedAt: now() };
    this.companies.set(id, updated);
    return updated;
  }

  async transitionStatus(id: CompanyId, to: CompanyStatus): Promise<Company> {
    const company = await this.findById(id, { includeDeleted: true });
    if (!company) throw new NotFoundError('Company', id);
    if (!canTransition(COMPANY_LIFECYCLE, company.status, to)) {
      throw new InvalidTransitionError(company.status, to);
    }
    return this.update(id, { status: to });
  }
}

export const mockCompanyRepository = new MockCompanyRepository();
