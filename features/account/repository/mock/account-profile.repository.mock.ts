import type { AccountProfileId, UserId } from '@/lib/domain/ids';
import type { AccountProfileRepository } from '@/features/account/repositories/account-profile.repository';
import type {
  AccountProfile,
  CreateAccountProfileInput,
  UpdateAccountProfileInput,
} from '@/features/account/types/account-profile.types';
import { createAccountProfileEntity } from '@/features/account/repository/supabase/account-profile.mapper';

export class MockAccountProfileRepository implements AccountProfileRepository {
  private rows = new Map<string, AccountProfile>();

  async findById(id: AccountProfileId) {
    return this.rows.get(id) ?? null;
  }

  async findByUserId(userId: UserId) {
    return [...this.rows.values()].find((row) => row.userId === userId) ?? null;
  }

  async findByUsername(username: string) {
    const needle = username.toLowerCase();
    return [...this.rows.values()].find((row) => row.username === needle) ?? null;
  }

  async upsert(input: CreateAccountProfileInput) {
    const existing = await this.findByUserId(input.userId);
    const next = existing
      ? {
          ...existing,
          ...input,
          updatedAt: new Date().toISOString(),
        }
      : createAccountProfileEntity(input);
    this.rows.set(next.id, next as AccountProfile);
    return next as AccountProfile;
  }

  async update(userId: UserId, input: UpdateAccountProfileInput) {
    const existing = await this.findByUserId(userId);
    if (!existing) throw new Error('Account profile not found');
    const next = { ...existing, ...input, updatedAt: new Date().toISOString() };
    this.rows.set(next.id, next);
    return next;
  }

  async touchLastLogin(userId: UserId) {
    const existing = await this.findByUserId(userId);
    if (!existing) return;
    const next = {
      ...existing,
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.rows.set(next.id, next);
  }
}
