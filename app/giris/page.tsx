import { Suspense } from 'react';
import { AuthLayout, AuthLink } from '@/features/authentication/components/auth-layout';
import { LoginForm } from '@/features/authentication/components/login-form';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export const metadata = {
  title: 'Giriş Yap — Girisimco',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Giriş Yap"
      description="Hesabınıza giriş yapın ve fırsatları keşfedin."
      footer={
        <>
          Hesabınız yok mu? <AuthLink href={AUTH_ROUTES.register}>Kayıt olun</AuthLink>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
