export type {
  AccountProfile,
  AccountProfileStatus,
  CreateAccountProfileInput,
  UpdateAccountProfileInput,
} from '@/features/account/types/account-profile.types';

export type {
  UserConsent,
  CreateUserConsentInput,
} from '@/features/account/types/user-consent.types';

export type {
  UserSettings,
  ProfileVisibilitySetting,
  CreateUserSettingsInput,
  UpdateUserSettingsInput,
} from '@/features/account/types/user-settings.types';

export type {
  UserSecurityLog,
  UserSecurityAction,
  CreateUserSecurityLogInput,
} from '@/features/account/types/user-security-log.types';

export type {
  AccountProfilePageData,
  AccountProfilePageLoadResult,
} from '@/features/account/types/account-profile-page.types';

export type {
  AccountNavId,
  AccountNavItem,
  AccountDashboardStats,
  AccountHubStats,
  AccountQuickAction,
} from '@/features/account/types/account-panel.types';

export {
  ACCOUNT_PANEL_BASE,
  ACCOUNT_NAV_ITEMS,
  ACCOUNT_QUICK_ACTIONS,
  MOCK_ACCOUNT_DASHBOARD_STATS,
  EMPTY_ACCOUNT_HUB_STATS,
} from '@/features/account/types/account-panel.constants';

export { getMockAccountDashboardStats } from '@/features/account/services/account-panel-mock.service';

export { AccountSidebar } from '@/features/account/components/AccountSidebar';
export { AccountHeader } from '@/features/account/components/AccountHeader';
export { AccountDashboard } from '@/features/account/components/AccountDashboard';
export { AccountStats } from '@/features/account/components/AccountStats';
export { QuickActions } from '@/features/account/components/QuickActions';
export { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
export { AccountEmptyState } from '@/features/account/components/AccountEmptyState';
export { AccountLoadingSkeleton } from '@/features/account/components/AccountLoadingSkeleton';
export { AccountMyListings } from '@/features/account/components/AccountMyListings';
export { AccountShowcase } from '@/features/account/components/AccountShowcase';
export { AccountFavorites } from '@/features/account/components/AccountFavorites';
export { AccountNotifications } from '@/features/account/components/AccountNotifications';
export { AccountPayments } from '@/features/account/components/AccountPayments';
export { AccountProfile as AccountProfileView } from '@/features/account/components/AccountProfile';
export { AccountSecurity } from '@/features/account/components/AccountSecurity';
export { AccountSettings } from '@/features/account/components/AccountSettings';
export { AccountPanelLayout } from '@/features/account/layout/AccountPanelLayout';

export type { AccountProfileRepository } from '@/features/account/repositories/account-profile.repository';
export type { UserConsentRepository } from '@/features/account/repositories/user-consent.repository';
export type { UserSettingsRepository } from '@/features/account/repositories/user-settings.repository';
export type { UserSecurityLogRepository } from '@/features/account/repositories/user-security-log.repository';

export { AccountService } from '@/features/account/services/account.service';
export type { BootstrapAccountInput } from '@/features/account/services/account.service';

export {
  MockAccountProfileRepository,
  createEmptyAccountProfile,
} from '@/features/account/repository/mock/account-profile.repository.mock';
export { MockUserConsentRepository } from '@/features/account/repository/mock/user-consent.repository.mock';
export { MockUserSettingsRepository } from '@/features/account/repository/mock/user-settings.repository.mock';
export { MockUserSecurityLogRepository } from '@/features/account/repository/mock/user-security-log.repository.mock';

export { SupabaseAccountProfileRepository } from '@/features/account/repository/supabase/account-profile.repository.supabase';
export { SupabaseUserConsentRepository } from '@/features/account/repository/supabase/user-consent.repository.supabase';
export { SupabaseUserSettingsRepository } from '@/features/account/repository/supabase/user-settings.repository.supabase';
export { SupabaseUserSecurityLogRepository } from '@/features/account/repository/supabase/user-security-log.repository.supabase';
