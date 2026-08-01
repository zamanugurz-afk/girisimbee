import type { UserSecurityLogId, UserId } from '@/lib/domain/ids';

export type UserSecurityAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'password_reset_request'
  | 'password_reset_complete'
  | 'email_verified'
  | 'session_refresh'
  | 'profile_update'
  | 'settings_update'
  | 'consent_recorded';

export interface UserSecurityLog {
  id: UserSecurityLogId;
  userId: UserId;
  action: UserSecurityAction | string;
  device: string | null;
  browser: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export type CreateUserSecurityLogInput = {
  userId: UserId;
  action: UserSecurityAction | string;
  device?: string | null;
  browser?: string | null;
  ipAddress?: string | null;
};
