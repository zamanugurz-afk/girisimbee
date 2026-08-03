import type { AccountNotificationCardData } from '@/features/account/types/account-notifications.types';

export type AccountNotificationsPageLoadResult =
  | { ok: true; data: AccountNotificationCardData[] }
  | { ok: false; error: string };
