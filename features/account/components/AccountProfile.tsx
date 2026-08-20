'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ids } from '@/lib/domain/ids';
import { getAccountService } from '@/lib/persistence/container';
import { syncMarketplaceProfilePhone } from '@/features/listings/lib/resolve-publish-contact-phone';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AccountConsentsCard } from '@/features/account/components/AccountConsentsCard';
import { AccountEmailVerifyDialog } from '@/features/account/components/AccountEmailVerifyDialog';
import { AccountPhoneVerifyDialog } from '@/features/account/components/AccountPhoneVerifyDialog';
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
  const { user, refreshSession } = useAuth();
  const [loadError] = useState<string | null>(
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
  const [emailVerifyOpen, setEmailVerifyOpen] = useState(false);
  const [phoneVerifyOpen, setPhoneVerifyOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  /** Auth `email_confirmed_at` — not the mock profile flag. */
  const emailVerified = Boolean(user?.emailVerified);
  const emailDisplay = (profile?.email?.trim() || user?.email || '').trim();

  // Keep local profile flag in sync when Auth confirms email (no full reload).
  useEffect(() => {
    if (!emailVerified) return;
    setProfile((prev) => {
      if (!prev) return prev;
      if (prev.emailVerified && prev.email) return prev;
      return {
        ...prev,
        emailVerified: true,
        email: prev.email?.trim() || user?.email || prev.email,
      };
    });
    setEmailVerifyOpen(false);
    void getAccountService()
      .updateProfile(ids.user(userId), {
        emailVerified: true,
        ...(user?.email ? { email: user.email } : {}),
      })
      .catch(() => undefined);
  }, [emailVerified, user?.email, userId]);

  // After clicking the verify link in another tab, refresh session on focus.
  useEffect(() => {
    if (emailVerified) return;

    function refreshFromAuth() {
      void refreshSession();
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') refreshFromAuth();
    }

    window.addEventListener('focus', refreshFromAuth);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', refreshFromAuth);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [emailVerified, refreshSession]);

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

  const activeProfile: AccountProfile = profile ?? {
    id: ids.accountProfile(userId),
    userId: ids.user(userId),
    firstName: user?.displayName?.split(' ')[0] ?? null,
    lastName: user?.displayName?.split(' ').slice(1).join(' ') ?? null,
    username: user?.username ?? null,
    email: emailDisplay,
    phone: null,
    role: 'user',
    status: 'active',
    emailVerified: emailVerified,
    phoneVerified: false,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  async function saveProfile(next: {
    firstName: string;
    lastName: string;
    username: string;
    phone: string;
  }) {
    setSaving(true);
    try {
      const nextPhone = next.phone.trim() || null;
      const phoneChanged = (activeProfile?.phone ?? null) !== nextPhone;
      const updated = await getAccountService().updateProfile(ids.user(userId), {
        firstName: next.firstName.trim() || null,
        lastName: next.lastName.trim() || null,
        username: next.username.trim() || null,
        phone: nextPhone,
        ...(phoneChanged ? { phoneVerified: false } : {}),
      });
      setProfile(updated);
      setEditOpen(false);
      toast.success('Profil bilgileri güncellendi');
      if (nextPhone) {
        void syncMarketplaceProfilePhone(ids.user(userId), nextPhone).catch(() => {
          /* marketplace sync best-effort — publish form also resolves account phone */
        });
      }
      if (phoneChanged && nextPhone) {
        toast.message('Telefon değişti', {
          description: 'Yeni numarayı doğrulamanız gerekiyor.',
        });
      }
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
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <AccountProfileCard
            profile={activeProfile}
            emailVerified={emailVerified}
            emailDisplay={emailDisplay}
            onEdit={() => setEditOpen(true)}
            onVerifyEmail={() => setEmailVerifyOpen(true)}
            onVerifyPhone={() => setPhoneVerifyOpen(true)}
          />
          <AccountSettingsSummaryCard settings={settings} />
        </div>

        <div className="space-y-6">
          <AccountConsentsCard consent={consent} />
        </div>
      </div>

      <AccountProfileEditModal
        open={editOpen}
        profile={activeProfile}
        saving={saving}
        onClose={() => {
          if (!saving) setEditOpen(false);
        }}
        onSave={saveProfile}
      />

      <AccountEmailVerifyDialog
        open={emailVerifyOpen}
        email={emailDisplay}
        onClose={() => setEmailVerifyOpen(false)}
      />

      <AccountPhoneVerifyDialog
        open={phoneVerifyOpen}
        profile={activeProfile}
        onClose={() => setPhoneVerifyOpen(false)}
        onVerified={(patch) => {
          setProfile((prev) => (prev ? { ...prev, ...patch, phoneVerified: true } : prev));
          if (patch.phone) {
            void syncMarketplaceProfilePhone(ids.user(userId), patch.phone).catch(() => {});
          }
        }}
      />
    </div>
  );
}
