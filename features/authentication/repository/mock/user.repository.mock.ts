/**
 * Mock user repository — in-memory account store (starts empty).
 */
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { canTransition } from '@/lib/domain/base';
import type { UserId } from '@/lib/domain/ids';
import type { User, CreateUserInput, UpdateUserInput, UserFilter, UserStatus } from '@/features/authentication/types/user.types';
import type { UserRepository } from '@/features/authentication/repositories/user.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createUser } from '@/features/authentication/factories/user.factory';
import { USER_LIFECYCLE } from '@/features/authentication/types/user.types';

export class MockUserRepository implements UserRepository {
  private users = new Map<UserId, User>();

  async findById(id: UserId, filter?: RepositoryFilter): Promise<User | null> {
    const u = this.users.get(id);
    if (!u) return null;
    if (!filter?.includeDeleted && u.deletedAt) return null;
    return u;
  }

  async findMany(filter: UserFilter, pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.users.values()];
    if (!filter.includeDeleted) results = results.filter((u) => !u.deletedAt);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((u) => statuses.includes(u.status));
    }
    if (filter.role) results = results.filter((u) => u.role === filter.role);
    if (filter.emailVerified !== undefined) results = results.filter((u) => u.emailVerified === filter.emailVerified);
    if (filter.query) {
      const q = filter.query.toLowerCase();
      results = results.filter((u) => u.email.toLowerCase().includes(q));
    }
    if (filter.activeSince) {
      results = results.filter((u) => u.lastLoginAt && u.lastLoginAt >= filter.activeSince!);
    }
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: UserFilter, pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: UserFilter, pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: UserFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: UserId): Promise<boolean> {
    return this.users.has(id);
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = createUser(input);
    this.users.set(user.id, user);
    return user;
  }

  async update(id: UserId, input: UpdateUserInput): Promise<User> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('User', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.users.set(id, updated);
    return updated;
  }

  async softDelete(id: UserId): Promise<void> {
    await this.transitionStatus(id, 'deleted');
  }

  async delete(id: UserId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: UserId): Promise<User> {
    const u = await this.findById(id, { includeDeleted: true });
    if (!u) throw new NotFoundError('User', id);
    const updated = { ...u, status: 'active' as UserStatus, deletedAt: null, updatedAt: now() };
    this.users.set(id, updated);
    return updated;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (!u.deletedAt && u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (!u.deletedAt && u.phone === phone) return u;
    }
    return null;
  }

  async updateLastLogin(id: UserId, at: string): Promise<void> {
    const u = await this.findById(id);
    if (!u) throw new NotFoundError('User', id);
    this.users.set(id, { ...u, lastLoginAt: at, updatedAt: now() });
  }

  async transitionStatus(id: UserId, status: UserStatus): Promise<User> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('User', id);
    if (!canTransition(USER_LIFECYCLE, existing.status, status)) {
      throw new InvalidTransitionError(existing.status, status);
    }
    const updated = {
      ...existing,
      status,
      deletedAt: status === 'deleted' ? now() : existing.deletedAt,
      updatedAt: now(),
    };
    this.users.set(id, updated);
    return updated;
  }
}
