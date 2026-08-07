import type { UserId, UserSecurityLogId } from '@/lib/domain/ids';
import type {
  CreateUserSecurityLogInput,
  UserSecurityLog,
} from '@/features/account/types/user-security-log.types';

export interface UserSecurityLogRepository {
  create(input: CreateUserSecurityLogInput): Promise<UserSecurityLog>;
  findById(id: UserSecurityLogId): Promise<UserSecurityLog | null>;
  listByUserId(userId: UserId, limit?: number): Promise<UserSecurityLog[]>;
}
