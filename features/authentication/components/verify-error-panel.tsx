'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AuthLink } from '@/features/authentication/components/auth-layout';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

const REASON_COPY: Record<string, string> = {
  missing_code: 'Doğrulama bağlantısı eksik veya geçersiz görünüyor.',
  exchange_failed: 'Doğrulama bağlantısı geçersiz veya süresi dolmuş olabilir.',
  provider_error: 'Doğrulama sağlayıcısından bir hata döndü.',
  config_missing: 'Sunucu yapılandırması eksik. Lütfen daha sonra tekrar deneyin.',
  bootstrap_failed: 'Hesap doğrulandı ancak profil hazırlığı tamamlanamadı.',
};

export function VerifyErrorPanel() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') ?? 'exchange_failed';
  const email = searchParams.get('email') ?? '';
  const { resendVerification } = useAuth();
  const [sending, setSending] = useState(false);

  const detail = useMemo(
    () => REASON_COPY[reason] ?? REASON_COPY.exchange_failed,
    [reason],
  );

  async function handleResend() {
    if (!email) {
      toast.error('Tekrar göndermek için e-posta adresiniz gerekli');
      return;
    }
    setSending(true);
    const { error } = await resendVerification(email);
    setSending(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Doğrulama e-postası tekrar gönderildi');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-9 w-9" aria-hidden />
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-[#F8FAFC] px-4 py-4 text-sm dark:border-white/10 dark:bg-white/5">
        <p className="leading-relaxed text-muted-foreground">{detail}</p>
      </div>

      <div className="space-y-3">
        {email ? (
          <Button
            type="button"
            className="w-full rounded-lg"
            size="lg"
            onClick={handleResend}
            disabled={sending}
          >
            {sending ? 'Gönderiliyor…' : 'Tekrar Gönder'}
          </Button>
        ) : (
          <Button asChild className="w-full rounded-lg" size="lg">
            <Link href={AUTH_ROUTES.verifyEmail}>Tekrar Gönder</Link>
          </Button>
        )}
        <p className="text-center text-sm text-muted-foreground">
          <AuthLink href={AUTH_ROUTES.home}>Ana sayfaya dön</AuthLink>
          {' · '}
          <AuthLink href={AUTH_ROUTES.login}>Giriş Yap</AuthLink>
        </p>
      </div>
    </div>
  );
}
