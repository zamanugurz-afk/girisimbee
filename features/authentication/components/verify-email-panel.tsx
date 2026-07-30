'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AuthLink } from '@/features/authentication/components/auth-layout';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const { resendVerification } = useAuth();
  const [sending, setSending] = useState(false);

  async function handleResend() {
    if (!email) {
      toast.error('E-posta adresi bulunamadı');
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
    <div className="space-y-4">
      <p className="rounded-lg border border-border/80 bg-[#F8FAFC] p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
        {email ? (
          <>
            <strong className="text-foreground">{email}</strong> adresine doğrulama
            bağlantısı gönderdik. E-postanızdaki bağlantıya tıklayarak hesabınızı aktifleştirin.
          </>
        ) : (
          'E-posta adresinize doğrulama bağlantısı gönderdik.'
        )}
      </p>
      {email && (
        <Button
          variant="outline"
          className="w-full rounded-lg"
          onClick={handleResend}
          disabled={sending}
        >
          {sending ? 'Gönderiliyor…' : 'Doğrulama E-postasını Tekrar Gönder'}
        </Button>
      )}
      <p className="text-center text-sm text-muted-foreground">
        Doğruladıktan sonra{' '}
        <AuthLink href={AUTH_ROUTES.login}>giriş yapabilirsiniz</AuthLink>.
      </p>
    </div>
  );
}
