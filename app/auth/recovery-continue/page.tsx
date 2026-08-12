import Link from 'next/link';
import { AuthLayout, AuthLink } from '@/features/authentication/components/auth-layout';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Şifre Sıfırlamaya Devam — Girisimbee',
};

type PageProps = {
  searchParams: { token_hash?: string; type?: string };
};

/**
 * Anti-prefetch gate: GET only renders a confirm form.
 * verifyOtp runs only on POST /api/auth/verify-recovery after the user clicks.
 */
export default function RecoveryContinuePage({ searchParams }: PageProps) {
  const tokenHash =
    typeof searchParams.token_hash === 'string' ? searchParams.token_hash.trim() : '';

  if (!tokenHash) {
    return (
      <AuthLayout
        title="Şifre Sıfırla"
        description="Bağlantı eksik veya geçersiz."
        footer={
          <>
            <AuthLink href={AUTH_ROUTES.forgotPassword}>Yeni sıfırlama bağlantısı</AuthLink>
          </>
        }
      >
        <div className="space-y-4 rounded-xl border border-border/70 bg-muted/30 p-4">
          <p className="text-sm text-foreground">
            Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Yeni bir bağlantı isteyin.
          </p>
          <Button asChild className="w-full">
            <Link href={AUTH_ROUTES.forgotPassword}>Yeni sıfırlama bağlantısı</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Şifre Sıfırla"
      description="Şifre sıfırlamaya devam etmek için aşağıdaki butona tıklayın."
      footer={
        <>
          <AuthLink href={AUTH_ROUTES.login}>Giriş sayfasına dön</AuthLink>
        </>
      }
    >
      <form method="POST" action="/api/auth/verify-recovery" className="space-y-4">
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value="recovery" />
        <Button type="submit" className="w-full rounded-lg bg-primary dark:bg-white dark:text-primary-foreground">
          Şifre Sıfırlamaya Devam Et
        </Button>
      </form>
    </AuthLayout>
  );
}
