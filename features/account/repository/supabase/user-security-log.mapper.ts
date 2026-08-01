import { ids } from '@/lib/domain/ids';
import type {
  CreateUserSecurityLogInput,
  UserSecurityLog,
} from '@/features/account/types/user-security-log.types';

export interface UserSecurityLogRow {
  id: string;
  user_id: string;
  action: string;
  device: string | null;
  browser: string | null;
  ip_address: string | null;
  created_at: string;
}

export function mapUserSecurityLogRow(row: UserSecurityLogRow): UserSecurityLog {
  return {
    id: ids.userSecurityLog(row.id),
    userId: ids.user(row.user_id),
    action: row.action,
    device: row.device,
    browser: row.browser,
    ipAddress: row.ip_address,
    createdAt: row.created_at,
  };
}

export function createUserSecurityLogEntity(input: CreateUserSecurityLogInput): UserSecurityLog {
  return {
    id: ids.userSecurityLog(crypto.randomUUID()),
    userId: input.userId,
    action: input.action,
    device: input.device ?? null,
    browser: input.browser ?? null,
    ipAddress: input.ipAddress ?? null,
    createdAt: new Date().toISOString(),
  };
}

export function toUserSecurityLogInsert(entity: UserSecurityLog) {
  return {
    id: entity.id,
    user_id: entity.userId,
    action: entity.action,
    device: entity.device,
    browser: entity.browser,
    ip_address: entity.ipAddress,
    created_at: entity.createdAt,
  };
}
