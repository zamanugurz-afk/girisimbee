import type { AccountProfile } from '@/features/account/types/account-profile.types';
import type { UserConsent } from '@/features/account/types/user-consent.types';
import type { UserSettings } from '@/features/account/types/user-settings.types';

export interface AccountProfilePageData {
  profile: AccountProfile | null;
  consent: UserConsent | null;
  settings: UserSettings | null;
}

export type AccountProfilePageLoadResult =
  | { ok: true; data: AccountProfilePageData }
  | { ok: false; error: string };
