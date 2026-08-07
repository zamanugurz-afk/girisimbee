'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AccountNotificationSettings } from '@/features/account/components/AccountNotificationSettings';
import { AccountPreferenceSettings } from '@/features/account/components/AccountPreferenceSettings';
import { AccountPrivacySettings } from '@/features/account/components/AccountPrivacySettings';
import { getDefaultAccountPanelSettings } from '@/features/account/services/account-settings-mock.service';
import type { AccountPanelSettingsData } from '@/features/account/types/account-settings.types';

const PREFS_STORAGE_KEY = 'gc.account.panel.extras';

function readExtras(): Pick<AccountPanelSettingsData, 'privacy' | 'preferences'> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Pick<AccountPanelSettingsData, 'privacy' | 'preferences'>;
  } catch {
    return null;
  }
}

function writeExtras(data: Pick<AccountPanelSettingsData, 'privacy' | 'preferences'>) {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

export function AccountSettings() {
  const defaults = useMemo(() => getDefaultAccountPanelSettings(), []);
  const [settings, setSettings] = useState<AccountPanelSettingsData>(defaults);
  const [saved, setSaved] = useState<AccountPanelSettingsData>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/account/settings');
        const json = (await res.json()) as {
          data?: { settings?: AccountPanelSettingsData };
          error?: string;
        };
        if (!res.ok) throw new Error(json.error ?? 'Ayarlar yüklenemedi');
        const extras = readExtras();
        const next: AccountPanelSettingsData = {
          notifications: json.data?.settings?.notifications ?? defaults.notifications,
          privacy: extras?.privacy ?? json.data?.settings?.privacy ?? defaults.privacy,
          preferences: extras?.preferences ?? json.data?.settings?.preferences ?? defaults.preferences,
        };
        if (!cancelled) {
          setSettings(next);
          setSaved(next);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'Ayarlar yüklenemedi');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [defaults]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications: settings.notifications,
          privacy: settings.privacy,
          preferences: settings.preferences,
          profileVisibility: settings.privacy.emailVisible ? 'public' : 'private',
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Ayarlar kaydedilemedi');
      writeExtras({ privacy: settings.privacy, preferences: settings.preferences });
      setSaved(settings);
      toast.success('Ayarlar kaydedildi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    const next = getDefaultAccountPanelSettings();
    setSettings(next);
    setSaved(next);
    writeExtras({ privacy: next.privacy, preferences: next.preferences });
    void fetch('/api/account/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notifications: next.notifications,
        profileVisibility: 'public',
        privacy: next.privacy,
        preferences: next.preferences,
      }),
    }).then((res) => {
      if (res.ok) toast.message('Varsayılan ayarlara dönüldü');
      else toast.error('Varsayılanlar kaydedilemedi');
    });
  }

  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Ayarlar yükleniyor…</p>;
  }

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
          disabled={!dirty || saving}
          onClick={() => void handleSave()}
        >
          {saving ? 'Kaydediliyor…' : 'Ayarları kaydet'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-lg"
          disabled={saving}
          onClick={handleReset}
        >
          Varsayılan ayarlara dön
        </Button>
      </div>
    </div>
  );
}
