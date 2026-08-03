'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { getProfileService } from '@/lib/persistence/container';
import type { Profile, UpdateProfileInput } from '@/features/profiles/types/profile.types';
import type { UserId } from '@/lib/domain/ids';
import {
  profileEditorSchema,
  suggestUsername,
  type ProfileEditorForm,
} from '@/features/profiles/validation/profile-editor.schema';
import { ProfileMediaField } from '@/features/profiles/components/profile-media-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ValidationError } from '@/lib/domain/errors';
import { VerificationRequestPanel } from '@/components/girisimco/trust/verification-request-panel';

function toFormValues(profile: Profile): ProfileEditorForm {
  return {
    displayName: profile.displayName,
    username: profile.username ?? '',
    headline: profile.headline ?? '',
    bio: profile.bio ?? '',
    city: profile.city ?? '',
    country: profile.country,
    companyName: profile.companyName ?? '',
    position: profile.position ?? '',
    website: profile.website ?? '',
    linkedInUrl: profile.linkedInUrl ?? '',
    twitterUrl: profile.twitterUrl ?? '',
    phone: profile.phone ?? '',
    avatarUrl: profile.avatarUrl,
    coverUrl: profile.coverUrl,
    emailVisible: profile.emailVisible,
    phoneVisible: profile.phoneVisible,
    websiteVisible: profile.websiteVisible,
  };
}

export function ProfileEditorForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkedInVisible, setLinkedInVisible] = useState(true);

  const form = useForm<ProfileEditorForm>({
    resolver: zodResolver(profileEditorSchema),
    defaultValues: {
      displayName: '',
      username: '',
      headline: '',
      bio: '',
      city: '',
      country: 'TR',
      companyName: '',
      position: '',
      website: '',
      linkedInUrl: '',
      twitterUrl: '',
      phone: '',
      avatarUrl: null,
      coverUrl: null,
      emailVisible: false,
      phoneVisible: false,
      websiteVisible: true,
    },
  });

  const initialValues = useMemo(
    () => (profile ? toFormValues(profile) : null),
    [profile],
  );

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      try {
        const service = getProfileService();
        const existing = await service.ensureProfile(
          user!.id as UserId,
          user!.displayName ?? user!.email.split('@')[0],
          user!.email,
        );
        setProfile(existing);
        const values = toFormValues(existing);
        if (!values.username) {
          values.username = suggestUsername(existing.displayName || user!.email.split('@')[0]);
        }
        form.reset(values);
        setLinkedInVisible(existing.websiteVisible);
      } catch {
        toast.error('Profil yüklenemedi');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [user, form]);

  async function onSubmit(values: ProfileEditorForm) {
    if (!profile || !user) return;
    setSaving(true);
    try {
      const service = getProfileService();
      const available = await service.isUsernameAvailable(values.username, profile.id);
      if (!available) {
        form.setError('username', { message: 'Bu kullanıcı adı zaten alınmış.' });
        return;
      }

      const input: UpdateProfileInput = {
        displayName: values.displayName,
        username: values.username,
        // Preserve removed UI fields — do not wipe existing DB values
        headline: profile.headline,
        bio: profile.bio,
        city: profile.city,
        country: profile.country || 'TR',
        companyName: profile.companyName,
        position: profile.position,
        website: values.website || null,
        linkedInUrl: values.linkedInUrl || null,
        twitterUrl: profile.twitterUrl,
        phone: values.phone || null,
        avatarUrl: values.avatarUrl,
        coverUrl: values.coverUrl,
        email: user.email,
        emailVisible: values.emailVisible,
        phoneVisible: values.phoneVisible,
        websiteVisible: values.websiteVisible,
      };

      let updated = await service.update(profile.id, input);
      if (updated.status === 'draft') {
        updated = await service.publish(profile.id);
      }
      setProfile(updated);
      form.reset(toFormValues(updated));
      toast.success('Profiliniz kaydedildi');
      router.refresh();
    } catch (err) {
      if (err instanceof ValidationError && err.fieldErrors.username) {
        form.setError('username', { message: err.fieldErrors.username[0] });
      } else {
        toast.error(err instanceof Error ? err.message : 'Profil kaydedilemedi');
      }
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (initialValues) form.reset(initialValues);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile || !user) return null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <ProfileMediaField
        userId={user.id}
        kind="cover"
        label="Kapak Görseli"
        value={form.watch('coverUrl') ?? null}
        onChange={(url) => form.setValue('coverUrl', url, { shouldDirty: true })}
        disabled={saving}
      />

      <ProfileMediaField
        userId={user.id}
        kind="avatar"
        label="Profil Fotoğrafı"
        value={form.watch('avatarUrl') ?? null}
        onChange={(url) => form.setValue('avatarUrl', url, { shouldDirty: true })}
        disabled={saving}
      />

      <section className="space-y-4 rounded-2xl border border-border/80 p-5 dark:border-white/10">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Profil bilgileri
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="displayName">Ad Soyad</Label>
            <Input id="displayName" {...form.register('displayName')} />
            {form.formState.errors.displayName && (
              <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Kullanıcı Adı</Label>
            <Input id="username" {...form.register('username')} />
            {form.formState.errors.username && (
              <p className="text-xs text-destructive">{form.formState.errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" {...form.register('phone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedInUrl">LinkedIn</Label>
            <Input id="linkedInUrl" type="url" placeholder="https://linkedin.com/in/..." {...form.register('linkedInUrl')} />
            {form.formState.errors.linkedInUrl && (
              <p className="text-xs text-destructive">{form.formState.errors.linkedInUrl.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">İnternet sitesi</Label>
            <Input id="website" type="url" placeholder="https://" {...form.register('website')} />
            {form.formState.errors.website && (
              <p className="text-xs text-destructive">{form.formState.errors.website.message}</p>
            )}
          </div>
        </div>
      </section>

      {profile.username && (
        <Button asChild variant="outline" size="sm" className="rounded-2xl">
          <Link href={`/profil/${profile.username}`}>Herkese açık profili görüntüle</Link>
        </Button>
      )}

      <Separator />

      <div id="dogrulama">
        <VerificationRequestPanel
          userVerified={profile.isVerified}
          investorVerified={profile.investorVerified}
        />
      </div>

      <Separator />

      <section id="gizlilik" className="space-y-4 rounded-2xl border border-border/80 p-5 dark:border-white/10">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Gizlilik ayarları
        </h2>
        <PrivacySwitch
          label="E-posta görünürlüğü"
          description={user.email}
          checked={form.watch('emailVisible')}
          onCheckedChange={(v) => form.setValue('emailVisible', v, { shouldDirty: true })}
        />
        <PrivacySwitch
          label="Telefon görünürlüğü"
          description="Profilinizde telefon numaranızı göster"
          checked={form.watch('phoneVisible')}
          onCheckedChange={(v) => form.setValue('phoneVisible', v, { shouldDirty: true })}
        />
        <PrivacySwitch
          label="LinkedIn görünürlüğü"
          description="Profilinizde LinkedIn bağlantınızı göster"
          checked={linkedInVisible}
          onCheckedChange={setLinkedInVisible}
        />
        <PrivacySwitch
          label="İnternet sitesi görünürlüğü"
          description="Profilinizde internet sitenizi göster"
          checked={form.watch('websiteVisible')}
          onCheckedChange={(v) => form.setValue('websiteVisible', v, { shouldDirty: true })}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving} className="rounded-2xl">
          {saving ? 'Kaydediliyor…' : 'Profili Kaydet'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving || !form.formState.isDirty}
          className="rounded-2xl"
          onClick={handleCancel}
        >
          Değişiklikleri İptal Et
        </Button>
      </div>
    </form>
  );
}

function PrivacySwitch({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/80 p-4 dark:border-white/10">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
