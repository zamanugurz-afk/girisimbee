'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AccountPrivacySettings } from '@/features/account/components/AccountPrivacySettings';
import {
  getDefaultAccountPanelSettings,
  getMockAccountPanelSettings,
} from '@/features/account/services/account-settings-mock.service';
import type { AccountPanelSettingsData } from '@/features/account/types/account-settings.types';
import { DashboardPageHeader } from '@/features/dashboard/panel';

export default function DashboardGizlilikPage() {
  const initial = useMemo(() => getMockAccountPanelSettings(), []);
  const [settings, setSettings] = useState<AccountPanelSettingsData>(initial);
  const [saved, setSaved] = useState<AccountPanelSettingsData>(initial);
  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);

  return (
    <>
      <DashboardPageHeader
        title="Gizlilik"
        description="Profilinizde hangi bilgilerin görüneceğini yönetin."
      />
      <div className="space-y-6 px-5 py-8 sm:px-8">
        <AccountPrivacySettings
          value={settings.privacy}
          onChange={(privacy) => setSettings({ ...settings, privacy })}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="rounded-2xl"
            disabled={!dirty}
            onClick={() => {
              setSaved(settings);
              toast.success('Gizlilik ayarları kaydedildi (geçici)');
            }}
          >
            Kaydet
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={() => {
              const defaults = getDefaultAccountPanelSettings();
              setSettings(defaults);
              setSaved(defaults);
              toast.message('Varsayılanlara dönüldü');
            }}
          >
            Varsayılanlar
          </Button>
        </div>
      </div>
    </>
  );
}
