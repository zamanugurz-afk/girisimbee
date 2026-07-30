/**
 * Mock profile repository — in-memory marketplace profile store.
 */
import { now } from '@/lib/domain/factory';
import { canTransition } from '@/lib/domain/base';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import type { ProfileId, UserId } from '@/lib/domain/ids';
import type { Profile, CreateProfileInput, UpdateProfileInput, ProfileFilter, ProfileStatus } from '@/features/profiles/types/profile.types';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { PROFILE_LIFECYCLE } from '@/features/profiles/types/profile.types';
import { createProfile } from '@/features/profiles/factories/profile.factory';

export class MockProfileRepository implements ProfileRepository {
  private profiles = new Map<ProfileId, Profile>();
  private byUserId = new Map<UserId, ProfileId>();
  private byUsername = new Map<string, ProfileId>();

  async findById(id: ProfileId, filter?: RepositoryFilter): Promise<Profile | null> {
    const profile = this.profiles.get(id);
    if (!profile) return null;
    if (!filter?.includeDeleted && profile.deletedAt) return null;
    return profile;
  }

  async findByUserId(userId: UserId): Promise<Profile | null> {
    const id = this.byUserId.get(userId);
    if (!id) return null;
    return this.findById(id);
  }

  async findByUserIds(userIds: UserId[]): Promise<Profile[]> {
    const profiles = await Promise.all(userIds.map((id) => this.findByUserId(id)));
    return profiles.filter((p): p is Profile => Boolean(p));
  }

  async findByUsername(username: string): Promise<Profile | null> {
    const id = this.byUsername.get(username.trim().toLowerCase());
    if (!id) return null;
    return this.findById(id);
  }

  async isUsernameTaken(username: string, excludeProfileId?: ProfileId): Promise<boolean> {
    const id = this.byUsername.get(username.trim().toLowerCase());
    if (!id) return false;
    if (excludeProfileId && id === excludeProfileId) return false;
    return true;
  }

  async findMany(filter: ProfileFilter, pagination?: PaginationParams): Promise<PaginatedResult<Profile>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.profiles.values()];
    if (!filter.includeDeleted) results = results.filter((p) => !p.deletedAt);
    if (filter.userId) results = results.filter((p) => p.userId === filter.userId);
    if (filter.username) {
      results = results.filter((p) => p.username?.toLowerCase() === filter.username!.trim().toLowerCase());
    }
    if (filter.companyId) results = results.filter((p) => p.companyId === filter.companyId);
    if (filter.isVerified !== undefined) results = results.filter((p) => p.isVerified === filter.isVerified);
    if (filter.city) results = results.filter((p) => p.city === filter.city);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((p) => statuses.includes(p.status));
    }
    if (filter.query) {
      const q = filter.query.toLowerCase();
      results = results.filter((p) => p.displayName.toLowerCase().includes(q));
    }
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: ProfileFilter, pagination?: PaginationParams): Promise<PaginatedResult<Profile>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: ProfileFilter, pagination?: PaginationParams): Promise<PaginatedResult<Profile>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: ProfileFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: ProfileId): Promise<boolean> {
    return this.profiles.has(id);
  }

  async create(input: CreateProfileInput): Promise<Profile> {
    const profile = createProfile(input);
    this.profiles.set(profile.id, profile);
    this.byUserId.set(profile.userId, profile.id);
    if (profile.username) this.byUsername.set(profile.username.toLowerCase(), profile.id);
    return profile;
  }

  async update(id: ProfileId, input: UpdateProfileInput): Promise<Profile> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Profile', id);
    if (existing.username) this.byUsername.delete(existing.username.toLowerCase());
    const updated = { ...existing, ...input, updatedAt: now() };
    this.profiles.set(id, updated);
    if (updated.username) this.byUsername.set(updated.username.toLowerCase(), id);
    return updated;
  }

  async softDelete(id: ProfileId): Promise<void> {
    await this.transitionStatus(id, 'deleted');
    const profile = this.profiles.get(id)!;
    this.profiles.set(id, { ...profile, deletedAt: now() });
  }

  async delete(id: ProfileId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: ProfileId): Promise<Profile> {
    const profile = await this.findById(id, { includeDeleted: true });
    if (!profile) throw new NotFoundError('Profile', id);
    const updated = { ...profile, deletedAt: null, status: 'draft' as ProfileStatus, updatedAt: now() };
    this.profiles.set(id, updated);
    return updated;
  }

  async updateCompletenessScore(id: ProfileId): Promise<Profile> {
    const profile = await this.findById(id);
    if (!profile) throw new NotFoundError('Profile', id);
    let score = 20;
    if (profile.username) score += 10;
    if (profile.headline) score += 10;
    if (profile.bio) score += 15;
    if (profile.avatarUrl) score += 15;
    if (profile.coverUrl) score += 10;
    if (profile.city) score += 5;
    if (profile.companyName || profile.position) score += 10;
    if (profile.website) score += 5;
    return this.update(id, { completenessScore: Math.min(score, 100) } as UpdateProfileInput);
  }

  async transitionStatus(id: ProfileId, to: ProfileStatus): Promise<Profile> {
    const profile = await this.findById(id, { includeDeleted: true });
    if (!profile) throw new NotFoundError('Profile', id);
    if (!canTransition(PROFILE_LIFECYCLE, profile.status, to)) {
      throw new InvalidTransitionError(profile.status, to);
    }
    return this.update(id, { status: to });
  }
}

export const mockProfileRepository = new MockProfileRepository();
