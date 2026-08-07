import type { UserConsentId, UserId } from '@/lib/domain/ids';
import type { UserConsentRepository } from '@/features/account/repositories/user-consent.repository';
import type {
  CreateUserConsentInput,
  UserConsent,
} from '@/features/account/types/user-consent.types';
import { createUserConsentEntity } from '@/features/account/repository/supabase/user-consent.mapper';

export class MockUserConsentRepository implements UserConsentRepository {
  private rows = new Map<string, UserConsent>();

  async create(input: CreateUserConsentInput) {
    const entity = createUserConsentEntity(input);
    this.rows.set(entity.id, entity);
    return entity;
  }

  async findById(id: UserConsentId) {
    return this.rows.get(id) ?? null;
  }

  async findLatestByUserId(userId: UserId) {
    return (
      [...this.rows.values()]
        .filter((row) => row.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
    );
  }

  async listByUserId(userId: UserId) {
    return [...this.rows.values()]
      .filter((row) => row.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
