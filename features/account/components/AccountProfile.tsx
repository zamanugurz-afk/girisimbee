'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ids } from '@/lib/domain/ids';
import { getAccountService } from '@/lib/persistence/container';
import { AccountConsentsCard } from '@/features/account/components/AccountConsentsCard';
import { AccountProfileCard } from '@/features/account/components/AccountProfileCard';
import { AccountProfileEditModal } from '@/features/account/components/AccountProfileEditModal';
import { AccountSettingsSummaryCard } from '@/features/account/components/AccountSettingsSummaryCard';
import type { AccountProfile } from '@/features/account/types/account-profile.types';
import type { AccountProfilePageLoadResult } from '@/features/account/types/account-profile-page.types';
import type { UserConsent } from '@/features/account/types/user-consent.types';
import type { UserSettings } from '@/features/account/types/user-settings.types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AccountProfile({
  userId,
  initial,
}: {
  userId: string;
  initial: AccountProfilePageLoadResult;
}) {
  const [loadError, setLoadError] = useState<string | null>(
    initial.ok ? null : initial.error,
  );
  const [profile, setProfile] = useState<AccountProfile | null>(
    initial.ok ? initial.data.profile : null,
  );
  const [consent] = useState<UserConsent | null>(
    initial.ok ? initial.data.consent : null,
  );
  const [settings] = useState<UserSettings | null>(
    initial.ok ? initial.data.settings : null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (loadError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-10 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Profil yüklenemedi
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-5 rounded-lg"
          onClick={() => window.location.reload()}
        >
          Yeniden dene
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-dashed border-border/80 px-5 py-12 text-center dark:border-white/10">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Profil kaydı bulunamadı
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bu hesap için henüz bir profil satırı yok. Herkese açık profilinizi
            tamamlamak için profil düzenleme sayfasına gidin.
          </p>
          <Button asChild className="mt-5 rounded-lg" size="sm">
            <Link href="/ayarlar">Profili tamamla</Link>
          </Button>
        </div>
        <AccountConsentsCard consent={consent} />
        <AccountSettingsSummaryCard settings={settings} />
      </div>
    );
  }

  async function saveProfile(next: {
    firstName: string;
    lastName: string;
    username: string;
    phone: string;
  }) {
    setSaving(true);
    try {
      const updated = await getAccountService().updateProfile(ids.user(userId), {
        firstName: next.firstName.trim() || null,
        lastName: next.lastName.trim() || null,
        username: next.username.trim() || null,
        phone: next.phone.trim() || null,
      });
      setProfile(updated);
      setEditOpen(false);
      toast.success('Profil bilgileri güncellendi');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Profil güncellenemedi.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AccountProfileCard
        profile={profile}
        onEdit={() => setEditOpen(true)}
      />
      <AccountConsentsCard consent={consent} />
      <AccountSettingsSummaryCard settings={settings} />

      <AccountProfileEditModal
        open={editOpen}
        profile={profile}
        saving={saving}
        onClose={() => {
          if (!saving) setEditOpen(false);
        }}
        onSave={saveProfile}
      />
    </div>
  );
}
