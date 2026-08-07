import { Suspense } from 'react';
import { AuthLayout } from '@/features/authentication/components/auth-layout';
import { VerifyEmailPanel } from '@/features/authentication/components/verify-email-panel';

export const metadata = {
  title: 'E-posta Doğrulama — GirisimBee',
};

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="E-postanızı Doğrulayın"
      description="Hesabınızı aktifleştirmek için e-posta adresinizi doğrulamanız gerekiyor."
    >
      <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-muted" />}>
        <VerifyEmailPanel />
      </Suspense>
    </AuthLayout>
  );
}
