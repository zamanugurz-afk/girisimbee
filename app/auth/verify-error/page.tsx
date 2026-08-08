import { Suspense } from 'react';
import { AuthLayout } from '@/features/authentication/components/auth-layout';
import { VerifyErrorPanel } from '@/features/authentication/components/verify-error-panel';

export const metadata = {
  title: 'Doğrulama Başarısız — Girisimbee',
};

export default function VerifyErrorPage() {
  return (
    <AuthLayout
      title="Doğrulama başarısız"
      description="Doğrulama bağlantısı geçersiz veya süresi dolmuş olabilir."
    >
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
        <VerifyErrorPanel />
      </Suspense>
    </AuthLayout>
  );
}
