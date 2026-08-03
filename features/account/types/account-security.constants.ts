import type { AccountSecurityData } from '@/features/account/types/account-security.types';

export const ACCOUNT_SESSION_STATUS_LABELS = {
  active: 'Aktif',
  ended: 'Sonlandırıldı',
} as const;

/** Mock security data — no Supabase */
export const MOCK_ACCOUNT_SECURITY: AccountSecurityData = {
  sessions: [
    {
      id: 'ses-001',
      loggedInAt: '2026-08-01T22:10:00.000Z',
      device: 'Masaüstü',
      os: 'Windows 11',
      browser: 'Chrome 127',
      ipAddress: '176.88.***.**',
      status: 'active',
      isCurrent: true,
    },
    {
      id: 'ses-002',
      loggedInAt: '2026-07-28T14:35:00.000Z',
      device: 'Mobil',
      os: 'iOS 17',
      browser: 'Safari',
      ipAddress: '85.102.***.**',
      status: 'active',
    },
    {
      id: 'ses-003',
      loggedInAt: '2026-07-12T09:05:00.000Z',
      device: 'Tablet',
      os: 'Android 14',
      browser: 'Chrome Mobile',
      ipAddress: '212.156.***.**',
      status: 'ended',
    },
  ],
  twoFactor: {
    emailVerified: true,
    phoneVerified: false,
    authenticatorEnabled: false,
    backupCodesRemaining: 0,
  },
};
