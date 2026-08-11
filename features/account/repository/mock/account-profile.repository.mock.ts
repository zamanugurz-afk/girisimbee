import { ids, type AccountProfileId, type UserId } from '@/lib/domain/ids';
import type { AccountProfileRepository } from '@/features/account/repositories/account-profile.repository';
import type {
  AccountProfile,
  CreateAccountProfileInput,
  UpdateAccountProfileInput,
} from '@/features/account/types/account-profile.types';
import { createAccountProfileEntity } from '@/features/account/repository/supabase/account-profile.mapper';

/** Safe empty account profile for missing rows (no DB). */
export function createEmptyAccountProfile(userId: UserId): AccountProfile {
  return createAccountProfileEntity({
    userId,
    firstName: null,
    lastName: null,
    username: null,
    email: null,
    phone: null,
    role: 'user',
    status: 'active',
    emailVerified: false,
    phoneVerified: false,
  });
}

export class MockAccountProfileRepository implements AccountProfileRepository {
  private rows = new Map<string, AccountProfile>();

  private ensureByUserId(userId: UserId): AccountProfile {
    const existing = [...this.rows.values()].find((row) => row.userId === userId);
    if (existing) return existing;
    const created = createEmptyAccountProfile(userId);
    this.rows.set(created.id, created);
    return created;
  }

  async findById(id: AccountProfileId) {
    const hit = this.rows.get(id);
    if (hit) return hit;
    return this.ensureByUserId(ids.user(String(id)));
  }

  async findByUserId(userId: UserId) {
    return this.ensureByUserId(userId);
  }

  async findByUsername(username: string) {
    const needle = username.toLowerCase();
    return [...this.rows.values()].find((row) => row.username === needle) ?? null;
  }

  async upsert(input: CreateAccountProfileInput) {
    const existing = [...this.rows.values()].find((row) => row.userId === input.userId);
    if (existing) {
      // Match live repo: never blind-overwrite role on conflict.
      return this.update(input.userId, {
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        email: input.email,
        phone: input.phone,
        emailVerified: input.emailVerified,
        phoneVerified: input.phoneVerified,
        status: input.status,
      });
    }
    const created = createAccountProfileEntity(input);
    this.rows.set(created.id, created);
    return created;
  }

  async update(userId: UserId, input: UpdateAccountProfileInput) {
    const existing = this.ensureByUserId(userId);
    const { role: _ignoredRole, ...safe } = input;
    void _ignoredRole;
    const next = { ...existing, ...safe, updatedAt: new Date().toISOString() };
    this.rows.set(next.id, next);
    return next;
  }

  async touchLastLogin(userId: UserId) {
    const existing = this.ensureByUserId(userId);
    const next = {
      ...existing,
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.rows.set(next.id, next);
  }
}
