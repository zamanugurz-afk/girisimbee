'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AccountNotificationSettings } from '@/features/account/components/AccountNotificationSettings';
import { AccountPreferenceSettings } from '@/features/account/components/AccountPreferenceSettings';
import { AccountPrivacySettings } from '@/features/account/components/AccountPrivacySettings';
import {
  getDefaultAccountPanelSettings,
  getMockAccountPanelSettings,
} from '@/features/account/services/account-settings-mock.service';
import type { AccountPanelSettingsData } from '@/features/account/types/account-settings.types';

export function AccountSettings() {
  const initial = useMemo(() => getMockAccountPanelSettings(), []);
  const [settings, setSettings] = useState<AccountPanelSettingsData>(initial);
  const [saved, setSaved] = useState<AccountPanelSettingsData>(initial);

  function handleSave() {
    setSaved(settings);
    toast.success('Ayarlar kaydedildi (mock)');
  }

  function handleReset() {
    const defaults = getDefaultAccountPanelSettings();
    setSettings(defaults);
    setSaved(defaults);
    toast.message('Varsayılan ayarlara dönüldü (mock)');
  }

  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);

  return (
    <div className="space-y-6">
      <AccountNotificationSettings
        value={settings.notifications}
        onChange={(notifications) => setSettings({ ...settings, notifications })}
      />
      <AccountPrivacySettings
        value={settings.privacy}
        onChange={(privacy) => setSettings({ ...settings, privacy })}
      />
      <AccountPreferenceSettings
        value={settings.preferences}
        onChange={(preferences) => setSettings({ ...settings, preferences })}
      />

      <div className="flex flex-wrap gap-2 border-t border-border/80 pt-5 dark:border-white/10">
        <Button
          type="button"
          className="rounded-lg"
          disabled={!dirty}
          onClick={handleSave}
        >
          Ayarları kaydet
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-lg"
          onClick={handleReset}
        >
          Varsayılan ayarlara dön
        </Button>
      </div>
    </div>
  );
}
