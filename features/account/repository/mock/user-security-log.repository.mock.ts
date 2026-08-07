import type { UserId, UserSecurityLogId } from '@/lib/domain/ids';
import type { UserSecurityLogRepository } from '@/features/account/repositories/user-security-log.repository';
import type {
  CreateUserSecurityLogInput,
  UserSecurityLog,
} from '@/features/account/types/user-security-log.types';
import { createUserSecurityLogEntity } from '@/features/account/repository/supabase/user-security-log.mapper';

export class MockUserSecurityLogRepository implements UserSecurityLogRepository {
  private rows = new Map<string, UserSecurityLog>();

  async create(input: CreateUserSecurityLogInput) {
    const entity = createUserSecurityLogEntity(input);
    this.rows.set(entity.id, entity);
    return entity;
  }

  async findById(id: UserSecurityLogId) {
    return this.rows.get(id) ?? null;
  }

  async listByUserId(userId: UserId, limit = 50) {
    return [...this.rows.values()]
      .filter((row) => row.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}
