'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { getProfileService } from '@/lib/persistence/container';
import type { Profile, UpdateProfileInput } from '@/features/profiles/types/profile.types';
import type { UserId } from '@/lib/domain/ids';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const settingsSchema = z.object({
  displayName: z.string().min(2, 'En az 2 karakter').max(100),
  headline: z.string().max(160).optional(),
  bio: z.string().max(2000).optional(),
  city: z.string().max(100).optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export function ProfileSettingsForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { displayName: '', headline: '', bio: '', city: '' },
  });

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      try {
        const service = getProfileService();
        let existing = await service.getByUserId(user!.id as UserId);

        if (!existing) {
          existing = await service.create({
            userId: user!.id as UserId,
            displayName: user!.displayName ?? user!.email.split('@')[0],
          });
        }

        setProfile(existing);
        form.reset({
          displayName: existing.displayName,
          headline: existing.headline ?? '',
          bio: existing.bio ?? '',
          city: existing.city ?? '',
        });
      } catch {
        toast.error('Profil yüklenemedi');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user, form]);

  async function onSubmit(values: SettingsForm) {
    if (!profile) return;
    setSaving(true);
    try {
      const service = getProfileService();
      const input: UpdateProfileInput = {
        displayName: values.displayName,
        headline: values.headline || null,
        bio: values.bio || null,
        city: values.city || null,
      };
      const updated = await service.update(profile.id, input);
      if (updated.status === 'draft') {
        await service.publish(profile.id);
      }
      setProfile(updated);
      toast.success('Profiliniz kaydedildi');
      router.refresh();
    } catch {
      toast.error('Profil kaydedilemedi');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {profile && (
        <div className="rounded-xl border border-border/80 bg-muted/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-sm text-muted-foreground">
            Profil tamamlama:{' '}
            <span className="font-semibold text-foreground">
              %{profile.completenessScore}
            </span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all dark:bg-white"
              style={{ width: `${profile.completenessScore}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="displayName">Görünen Ad</Label>
        <Input id="displayName" {...form.register('displayName')} />
        {form.formState.errors.displayName && (
          <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="headline">Başlık</Label>
        <Input id="headline" placeholder="Örn. SaaS Kurucusu & Yatırımcı" {...form.register('headline')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Hakkımda</Label>
        <Textarea id="bio" rows={4} placeholder="Kendinizi kısaca tanıtın…" {...form.register('bio')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Şehir</Label>
        <Input id="city" placeholder="İstanbul" {...form.register('city')} />
      </div>

      <Button type="submit" disabled={saving} className="rounded-lg">
        {saving ? 'Kaydediliyor…' : 'Profili Kaydet'}
      </Button>
    </form>
  );
}
