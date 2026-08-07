/** Account panel — Ayarlar UI types (mock only). No theme / photo / city. */

export type AccountProfileVisibility = 'public' | 'connections' | 'private';

export type AccountLanguage = 'tr' | 'en';

export type AccountDateFormat = 'dd.mm.yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';

export interface AccountNotificationSettingsState {
  systemNotifications: boolean;
  favoriteNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface AccountPrivacySettingsState {
  emailVisible: boolean;
  phoneVisible: boolean;
  linkedInVisible: boolean;
  websiteVisible: boolean;
}

export interface AccountPreferenceSettingsState {
  language: AccountLanguage;
  timezone: string;
  dateFormat: AccountDateFormat;
}

export interface AccountPanelSettingsData {
  notifications: AccountNotificationSettingsState;
  privacy: AccountPrivacySettingsState;
  preferences: AccountPreferenceSettingsState;
}
