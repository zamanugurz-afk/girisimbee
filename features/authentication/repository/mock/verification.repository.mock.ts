/**
 * Mock verification repository — in-memory store (starts empty).
 */
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { canTransition } from '@/lib/domain/base';
import type { VerificationId, UserId } from '@/lib/domain/ids';
import type {
  Verification,
  CreateVerificationInput,
  UpdateVerificationInput,
  VerificationFilter,
} from '@/features/authentication/types/verification.types';
import type { VerificationRepository } from '@/features/authentication/repositories/verification.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createVerification } from '@/features/authentication/factories/verification.factory';
import { VERIFICATION_LIFECYCLE } from '@/features/authentication/types/verification.types';

export class MockVerificationRepository implements VerificationRepository {
  private verifications = new Map<VerificationId, Verification>();

  async findById(id: VerificationId, filter?: RepositoryFilter): Promise<Verification | null> {
    const v = this.verifications.get(id);
    if (!v) return null;
    if (!filter?.includeDeleted && v.deletedAt) return null;
    return v;
  }

  async findMany(filter: VerificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Verification>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.verifications.values()];
    if (!filter.includeDeleted) results = results.filter((v) => !v.deletedAt);
    if (filter.userId) results = results.filter((v) => v.userId === filter.userId);
    if (filter.companyId) results = results.filter((v) => v.companyId === filter.companyId);
    if (filter.type) results = results.filter((v) => v.type === filter.type);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((v) => statuses.includes(v.status));
    }
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
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
    return this.verifications.has(id);
  }

  async create(input: CreateVerificationInput): Promise<Verification> {
    const verification = createVerification(input);
    this.verifications.set(verification.id, verification);
    return verification;
  }

  async update(id: VerificationId, input: UpdateVerificationInput): Promise<Verification> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Verification', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.verifications.set(id, updated);
    return updated;
  }

  async softDelete(id: VerificationId): Promise<void> {
    const v = await this.findById(id);
    if (!v) throw new NotFoundError('Verification', id);
    this.verifications.set(id, { ...v, deletedAt: now(), updatedAt: now() });
  }

  async delete(id: VerificationId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: VerificationId): Promise<Verification> {
    const v = await this.findById(id, { includeDeleted: true });
    if (!v) throw new NotFoundError('Verification', id);
    const updated = { ...v, deletedAt: null, updatedAt: now() };
    this.verifications.set(id, updated);
    return updated;
  }

  async findPendingByUserAndType(userId: UserId, type: Verification['type']): Promise<Verification | null> {
    for (const v of this.verifications.values()) {
      if (!v.deletedAt && v.userId === userId && v.type === type && (v.status === 'pending' || v.status === 'in_review')) {
        return v;
      }
    }
    return null;
  }

  async transitionStatus(id: VerificationId, status: Verification['status']): Promise<Verification> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Verification', id);
    if (!canTransition(VERIFICATION_LIFECYCLE, existing.status, status)) {
      throw new InvalidTransitionError(existing.status, status);
    }
    const updated = { ...existing, status, updatedAt: now() };
    this.verifications.set(id, updated);
    return updated;
  }
}
