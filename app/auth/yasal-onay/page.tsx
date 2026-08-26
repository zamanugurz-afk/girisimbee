'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LEGAL_ROUTES } from '@/features/authentication/constants/legal-routes';
import { LegalDocLink } from '@/features/authentication/components/legal-doc-link';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { GirisimbeeLogo } from '@/components/girisimco/logo';

/**
 * Post-OAuth legal gate — Google login authenticates identity only.
 * Terms acceptance and KVKK acknowledgment happen here in the UI.
 */
function OAuthLegalAcceptanceForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/';

  // Only when this gate was opened with an explicit reset destination.
  useEffect(() => {
    const nextIsReset =
      next === AUTH_ROUTES.resetPassword || next === AUTH_ROUTES.resetPasswordLegacy;
    if (nextIsReset || params.get('type') === 'recovery') {
      router.replace(AUTH_ROUTES.resetPassword);
    }
  }, [next, params, router]);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [ackKvkk, setAckKvkk] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [ackCookies, setAckCookies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptTerms || !ackKvkk || !acceptPrivacy || !ackCookies) {
      toast.error('Lütfen zorunlu alanları tamamlayın.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/legal-acceptance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acceptTerms,
          acknowledgeKvkk: ackKvkk,
          acceptPrivacy,
          acknowledgeCookies: ackCookies,
          source: 'oauth_gate',
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Kayıt başarısız');
      toast.success('Yasal bilgilendirme tamamlandı');
      router.replace(next.startsWith('/') ? next : '/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-12">
      <div className="mb-6">
        <GirisimbeeLogo />
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Yasal bilgilendirme</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Google ile giriş kimliğinizi doğrular. Kullanıcı sözleşmesi kabulü ve KVKK aydınlatması
        ayrıdır; lütfen aşağıdaki metinleri inceleyin.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="flex items-start gap-3 text-sm">
          <Checkbox checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(v === true)} />
          <span>
            <LegalDocLink href={LEGAL_ROUTES.terms}>Kullanıcı sözleşmesi</LegalDocLink>
            ’ni okudum ve kabul ediyorum.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox checked={ackKvkk} onCheckedChange={(v) => setAckKvkk(v === true)} />
          <span>
            <LegalDocLink href={LEGAL_ROUTES.kvkk}>KVKK aydınlatma metni</LegalDocLink>
            ’ni okudum (bilgilendirme; açık rıza değildir).
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox checked={acceptPrivacy} onCheckedChange={(v) => setAcceptPrivacy(v === true)} />
          <span>
            <LegalDocLink href={LEGAL_ROUTES.privacy}>Gizlilik politikası</LegalDocLink>
            ’nı kabul ediyorum.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox checked={ackCookies} onCheckedChange={(v) => setAckCookies(v === true)} />
          <span>
            <LegalDocLink href={LEGAL_ROUTES.cookies}>Çerez politikası</LegalDocLink>
            ’nı okudum. Tercihlerimi çerez panelinden yönetebilirim.
          </span>
        </label>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Kaydediliyor…' : 'Devam et'}
        </Button>
      </form>
    </main>
  );
}

export default function OAuthLegalAcceptancePage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-lg px-4 py-12 text-sm text-muted-foreground">Yükleniyor…</main>}>
      <OAuthLegalAcceptanceForm />
    </Suspense>
  );
}
