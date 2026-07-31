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

export class MockApplicationRepository implements ApplicationRepository {
  private applications = new Map<ApplicationId, MarketplaceApplication>();

  async findById(id: ApplicationId, filter?: RepositoryFilter): Promise<MarketplaceApplication | null> {
    const app = this.applications.get(id);
    if (!app) return null;
    if (!filter?.includeDeleted && app.deletedAt) return null;
    return app;
  }

  async findMany(filter: ApplicationFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplaceApplication>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.applications.values()];
    if (!filter.includeDeleted) results = results.filter((a) => !a.deletedAt);
    if (filter.moduleKey) results = results.filter((a) => a.moduleKey === filter.moduleKey);
    if (filter.listingId) results = results.filter((a) => a.listingId === filter.listingId);
    if (filter.applicantProfileId) results = results.filter((a) => a.applicantProfileId === filter.applicantProfileId);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((a) => statuses.includes(a.status));
    }
    if (filter.submittedAfter) {
      results = results.filter((a) => a.createdAt >= filter.submittedAfter!);
    }
    if (filter.submittedBefore) {
      results = results.filter((a) => a.createdAt <= filter.submittedBefore!);
    }
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: ApplicationFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplaceApplication>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: ApplicationFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplaceApplication>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: ApplicationFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: ApplicationId): Promise<boolean> {
    return this.applications.has(id);
  }

  async create(input: CreateApplicationInput): Promise<MarketplaceApplication> {
    const app = createApplication(input);
    this.applications.set(app.id, app);
    return app;
  }

  async update(id: ApplicationId, input: UpdateApplicationInput): Promise<MarketplaceApplication> {
    const existing = this.applications.get(id);
    if (!existing) throw new NotFoundError('Application', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.applications.set(id, updated);
    return updated;
  }

  async softDelete(id: ApplicationId): Promise<void> {
    const existing = this.applications.get(id);
    if (!existing) throw new NotFoundError('Application', id);
    this.applications.set(id, { ...existing, deletedAt: now(), updatedAt: now() });
  }

  async delete(id: ApplicationId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: ApplicationId): Promise<MarketplaceApplication> {
    const existing = this.applications.get(id);
    if (!existing) throw new NotFoundError('Application', id);
    const updated = { ...existing, deletedAt: null, updatedAt: now() };
    this.applications.set(id, updated);
    return updated;
  }

  async findForListing(listingId: ListingId): Promise<MarketplaceApplication[]> {
    return [...this.applications.values()].filter((a) => a.listingId === listingId && !a.deletedAt);
  }

  async findForApplicant(applicantProfileId: ProfileId): Promise<MarketplaceApplication[]> {
    return [...this.applications.values()].filter(
      (a) => a.applicantProfileId === applicantProfileId && !a.deletedAt,
    );
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
    const app = this.applications.get(id);
    if (!app) throw new NotFoundError('Application', id);
    if (!canTransition(transitions, app.status, status)) {
      throw new InvalidTransitionError(app.status, status);
    }
    const updated = {
      ...app,
      status,
      unlockedAt: status === 'unlocked' ? now() : app.unlockedAt,
      contactedAt: status === 'contacted' ? now() : app.contactedAt,
      reviewedAt: status === 'reviewing' && !app.reviewedAt ? now() : app.reviewedAt,
      updatedAt: now(),
    };
    this.applications.set(id, updated);
    return updated;
  }
}
