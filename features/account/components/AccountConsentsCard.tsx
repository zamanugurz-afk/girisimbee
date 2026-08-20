'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { UserConsent } from '@/features/account/types/user-consent.types';
import { LEGAL_ROUTES } from '@/features/authentication/constants/legal-routes';
import { LEGAL_COMMERCIAL_MESSAGE_STATUS } from '@/features/legal/config/legal-third-party.config';
import { openCookiePreferences } from '@/features/legal/lib/cookie-prefs';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function StatusRow({ label, accepted, note }: { label: string; accepted: boolean; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 dark:border-white/10">
      <div className="min-w-0">
        <span className="text-sm text-foreground">{label}</span>
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </div>
      <Badge variant={accepted ? 'default' : 'outline'}>
        {accepted ? 'Kayıtlı' : 'Yok'}
      </Badge>
    </div>
  );
}

export function AccountConsentsCard({
  consent,
  onUpdated,
}: {
  consent: UserConsent | null;
  onUpdated?: () => void;
}) {
  const [marketing, setMarketing] = useState(consent?.marketingAccepted ?? false);
  const [sms, setSms] = useState(consent?.smsAccepted ?? false);
  const [email, setEmail] = useState(consent?.emailAccepted ?? false);
  const [saving, setSaving] = useState(false);

  async function saveOptional(next: {
    marketingAccepted?: boolean;
    smsAccepted?: boolean;
    emailAccepted?: boolean;
  }) {
    setSaving(true);
    try {
      const res = await fetch('/api/account/consents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Güncelleme başarısız');
      toast.success('İzin tercihleri güncellendi');
      onUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Güncelleme başarısız');
      setMarketing(consent?.marketingAccepted ?? false);
      setSms(consent?.smsAccepted ?? false);
      setEmail(consent?.emailAccepted ?? false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6 transition-all">
      <h2 className="font-display text-lg font-semibold text-foreground">
        İzinler ve Gizlilik Tercihleri
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Kullanıcı sözleşmesi kabulü ve KVKK aydınlatması bilgilendirme kaydı. Ticari ileti ve
        kanal izinlerini buradan geri çekebilirsiniz.
      </p>

      {!consent ? (
        <p className="mt-6 rounded-lg border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground dark:border-white/10">
          Henüz kayıtlı bir yasal kabul bulunmuyor.
        </p>
      ) : (
        <div className="mt-5 space-y-2">
          <StatusRow
            label="Kullanıcı sözleşmesi"
            accepted={consent.termsAccepted}
            note={consent.termsVersion ?? undefined}
          />
          <StatusRow
            label="Gizlilik politikası"
            accepted={consent.privacyAccepted}
            note={consent.privacyVersion ?? undefined}
          />
          <StatusRow
            label="KVKK aydınlatma (bilgilendirme)"
            accepted={consent.kvkkAccepted}
            note={consent.kvkkAckVersion ?? undefined}
          />
          <StatusRow
            label="Çerez politikası bilgilendirme"
            accepted={consent.cookiesAccepted}
            note={consent.cookiesVersion ?? undefined}
          />
          <p className="pt-2 text-xs text-muted-foreground">
            Son kayıt: {formatDate(consent.createdAt)}
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3 rounded-lg border border-border/70 p-3 dark:border-white/10">
        <p className="text-sm font-medium">Geri çekilebilir izinler</p>
        {!LEGAL_COMMERCIAL_MESSAGE_STATUS.marketingSendEnabled ? (
          <p className="text-xs text-muted-foreground">
            Ticari elektronik ileti gönderimi şu an kapalı (İYS yapılandırılmadı). İzin kaydı
            tutulabilir; gönderim yapılmaz.
          </p>
        ) : null}
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Ticari elektronik ileti</span>
          <Switch
            checked={marketing}
            disabled={saving}
            onCheckedChange={(v) => {
              setMarketing(v);
              void saveOptional({ marketingAccepted: v });
            }}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>SMS bilgilendirme</span>
          <Switch
            checked={sms}
            disabled={saving}
            onCheckedChange={(v) => {
              setSms(v);
              void saveOptional({ smsAccepted: v });
            }}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>E-posta bilgilendirme</span>
          <Switch
            checked={email}
            disabled={saving}
            onCheckedChange={(v) => {
              setEmail(v);
              void saveOptional({ emailAccepted: v });
            }}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => openCookiePreferences()}>
          Çerez tercihleri
        </Button>
        <Button type="button" size="sm" variant="ghost" asChild>
          <Link href={LEGAL_ROUTES.explicitConsent}>Açık rıza metinleri</Link>
        </Button>
        <Button type="button" size="sm" variant="ghost" asChild>
          <Link href={LEGAL_ROUTES.kvkk}>KVKK aydınlatma</Link>
        </Button>
      </div>
    </section>
  );
}
