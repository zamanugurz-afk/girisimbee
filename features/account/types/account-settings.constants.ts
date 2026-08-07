import type {
  AccountDateFormat,
  AccountLanguage,
  AccountPanelSettingsData,
  AccountProfileVisibility,
} from '@/features/account/types/account-settings.types';

export const ACCOUNT_PROFILE_VISIBILITY_LABELS: Record<AccountProfileVisibility, string> = {
  public: 'Herkese açık',
  connections: 'Yalnızca bağlantılar',
  private: 'Gizli',
};

export const ACCOUNT_LANGUAGE_LABELS: Record<AccountLanguage, string> = {
  tr: 'Türkçe',
  en: 'English',
};

export const ACCOUNT_DATE_FORMAT_LABELS: Record<AccountDateFormat, string> = {
  'dd.mm.yyyy': 'GG.AA.YYYY',
  'mm/dd/yyyy': 'AA/GG/YYYY',
  'yyyy-mm-dd': 'YYYY-AA-GG',
};

export const ACCOUNT_TIMEZONE_OPTIONS = [
  'Europe/Istanbul',
  'Europe/London',
  'Europe/Berlin',
  'UTC',
] as const;

/** Default / mock settings for /hesabim/ayarlar */
export const MOCK_ACCOUNT_PANEL_SETTINGS: AccountPanelSettingsData = {
  notifications: {
    systemNotifications: true,
    favoriteNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
  },
  privacy: {
    emailVisible: false,
    phoneVisible: false,
    linkedInVisible: true,
    websiteVisible: true,
  },
  preferences: {
    language: 'tr',
    timezone: 'Europe/Istanbul',
    dateFormat: 'dd.mm.yyyy',
  },
};
