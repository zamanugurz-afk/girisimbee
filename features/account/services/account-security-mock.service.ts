import type { AccountSecurityData } from '@/features/account/types/account-security.types';
import { MOCK_ACCOUNT_SECURITY } from '@/features/account/types/account-security.constants';

export function getMockAccountSecurity(): AccountSecurityData {
  return {
    sessions: MOCK_ACCOUNT_SECURITY.sessions.map((session) => ({ ...session })),
    twoFactor: { ...MOCK_ACCOUNT_SECURITY.twoFactor },
  };
}
