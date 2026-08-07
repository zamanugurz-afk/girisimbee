import type { AccountDashboardStats } from '@/features/account/types/account-panel.types';
import { MOCK_ACCOUNT_DASHBOARD_STATS } from '@/features/account/types/account-panel.constants';

/**
 * Skeleton service — returns mock panel stats only.
 * No Supabase / no business rules.
 */
export function getMockAccountDashboardStats(): AccountDashboardStats {
  return MOCK_ACCOUNT_DASHBOARD_STATS;
}
