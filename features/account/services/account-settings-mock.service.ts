import type { AccountPanelSettingsData } from '@/features/account/types/account-settings.types';
import { MOCK_ACCOUNT_PANEL_SETTINGS } from '@/features/account/types/account-settings.constants';

export function getMockAccountPanelSettings(): AccountPanelSettingsData {
  return {
    notifications: { ...MOCK_ACCOUNT_PANEL_SETTINGS.notifications },
    privacy: { ...MOCK_ACCOUNT_PANEL_SETTINGS.privacy },
    preferences: { ...MOCK_ACCOUNT_PANEL_SETTINGS.preferences },
  };
}

export function getDefaultAccountPanelSettings(): AccountPanelSettingsData {
  return getMockAccountPanelSettings();
}
