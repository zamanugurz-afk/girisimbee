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

export type { AccountProfileRepository } from '@/features/account/repositories/account-profile.repository';
export type { UserConsentRepository } from '@/features/account/repositories/user-consent.repository';
export type { UserSettingsRepository } from '@/features/account/repositories/user-settings.repository';
export type { UserSecurityLogRepository } from '@/features/account/repositories/user-security-log.repository';

export { AccountService } from '@/features/account/services/account.service';
export type { BootstrapAccountInput } from '@/features/account/services/account.service';

export { MockAccountProfileRepository } from '@/features/account/repository/mock/account-profile.repository.mock';
export { MockUserConsentRepository } from '@/features/account/repository/mock/user-consent.repository.mock';
export { MockUserSettingsRepository } from '@/features/account/repository/mock/user-settings.repository.mock';
export { MockUserSecurityLogRepository } from '@/features/account/repository/mock/user-security-log.repository.mock';

export { SupabaseAccountProfileRepository } from '@/features/account/repository/supabase/account-profile.repository.supabase';
export { SupabaseUserConsentRepository } from '@/features/account/repository/supabase/user-consent.repository.supabase';
export { SupabaseUserSettingsRepository } from '@/features/account/repository/supabase/user-settings.repository.supabase';
export { SupabaseUserSecurityLogRepository } from '@/features/account/repository/supabase/user-security-log.repository.supabase';
