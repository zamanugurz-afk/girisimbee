/** Account panel — Güvenlik UI types (mock only). */

export type AccountSessionStatus = 'active' | 'ended';

export interface AccountSecuritySession {
  id: string;
  loggedInAt: string;
  device: string;
  os: string;
  browser: string;
  ipAddress: string;
  status: AccountSessionStatus;
  isCurrent?: boolean;
}

export interface AccountTwoFactorState {
  emailVerified: boolean;
  phoneVerified: boolean;
  authenticatorEnabled: boolean;
  backupCodesRemaining: number;
}

export interface AccountSecurityData {
  sessions: AccountSecuritySession[];
  twoFactor: AccountTwoFactorState;
}

export interface AccountPasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
