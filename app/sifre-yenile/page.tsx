import { AuthLayout, AuthLink } from '@/features/authentication/components/auth-layout';
import { ResetPasswordForm } from '@/features/authentication/components/reset-password-form';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export const metadata = {
  title: 'Yeni Şifre — Girisimco',
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Yeni Şifre Belirle"
      description="Hesabınız için yeni bir şifre oluşturun."
      footer={
        <>
          <AuthLink href={AUTH_ROUTES.login}>Giriş sayfasına dön</AuthLink>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
