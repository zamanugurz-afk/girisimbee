'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-200/70 bg-sky-50/40 px-3.5 py-2.5 dark:border-sky-800/40 dark:bg-sky-950/20">
      <div className="min-w-0">
        <span className="text-xs font-semibold text-slate-900 dark:text-white">{label}</span>
        {note ? <p className="text-[11px] text-slate-500 dark:text-zinc-400">{note}</p> : null}
      </div>
      <span
        className={cn(
          'rounded-md px-2 py-0.5 text-[10px] font-bold',
          accepted
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
        )}
      >
        {accepted ? 'Kayıtlı' : 'Bekliyor'}
      </span>
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
  const activeConsent = consent ?? {
    termsAccepted: true,
    privacyAccepted: true,
    kvkkAccepted: true,
    cookiesAccepted: true,
    marketingAccepted: false,
    smsAccepted: false,
    emailAccepted: false,
    createdAt: new Date().toISOString(),
    termsVersion: 'v1.0',
    privacyVersion: 'v1.0',
    kvkkAckVersion: 'v1.0',
    cookiesVersion: 'v1.0',
  };

  const [marketing, setMarketing] = useState(activeConsent.marketingAccepted);
  const [sms, setSms] = useState(activeConsent.smsAccepted);
  const [email, setEmail] = useState(activeConsent.emailAccepted);
  const [saving, setSaving] = useState(false);

  async function saveOptional(next: {
    marketingAccepted?: boolean;
    smsAccepted?: boolean;
    emailAccepted?: boolean;
  }) {
    setSaving(true);
    try {
      await fetch('/api/account/consents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      toast.success('İzin tercihleri güncellendi');
      onUpdated?.();
    } catch {
      toast.error('İzinler kaydedilemedi');
      setMarketing(activeConsent.marketingAccepted);
      setSms(activeConsent.smsAccepted);
      setEmail(activeConsent.emailAccepted);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6 transition-all">
      <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
        İzinler ve Gizlilik Tercihleri
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
        Kullanıcı sözleşmesi kabulü ve KVKK aydınlatması bilgilendirme kaydı. Ticari ileti ve
        kanal izinlerini buradan geri çekebilirsiniz.
      </p>

      <div className="mt-4 space-y-2">
        <StatusRow
          label="Kullanıcı sözleşmesi"
          accepted={activeConsent.termsAccepted}
          note={activeConsent.termsVersion ?? undefined}
        />
        <StatusRow
          label="Gizlilik politikası"
          accepted={activeConsent.privacyAccepted}
          note={activeConsent.privacyVersion ?? undefined}
        />
        <StatusRow
          label="KVKK aydınlatma (bilgilendirme)"
          accepted={activeConsent.kvkkAccepted}
          note={activeConsent.kvkkAckVersion ?? undefined}
        />
        <StatusRow
          label="Çerez politikası bilgilendirme"
          accepted={activeConsent.cookiesAccepted}
          note={activeConsent.cookiesVersion ?? undefined}
        />
        <p className="pt-1 text-[11px] text-slate-400 dark:text-zinc-500">
          Son kayıt: {formatDate(activeConsent.createdAt)}
        </p>
      </div>

      <div className="mt-4 space-y-3 rounded-2xl border border-amber-200/80 bg-amber-50/30 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
        <p className="text-xs font-bold text-slate-900 dark:text-white">Geri çekilebilir izinler</p>
        {!LEGAL_COMMERCIAL_MESSAGE_STATUS.marketingSendEnabled ? (
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
            Ticari elektronik ileti gönderimi şu an kapalı (İYS yapılandırılmadı). İzin kaydı
            tutulabilir; gönderim yapılmaz.
          </p>
        ) : null}
        <label className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-800 dark:text-zinc-200">
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
        <label className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-800 dark:text-zinc-200">
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
        <label className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-800 dark:text-zinc-200">
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

      <div className="mt-4 flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
        <Button type="button" size="sm" variant="outline" className="h-8 rounded-xl text-xs font-semibold" onClick={() => openCookiePreferences()}>
          Çerez Tercihleri
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-8 rounded-xl text-xs font-semibold" asChild>
          <Link href={LEGAL_ROUTES.explicitConsent}>Açık Rıza Metinleri</Link>
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-8 rounded-xl text-xs font-semibold" asChild>
          <Link href={LEGAL_ROUTES.kvkk}>KVKK Aydınlatma</Link>
        </Button>
      </div>
    </section>
  );
}
