import { AuthLayout, AuthLink } from '@/features/authentication/components/auth-layout';
import { ForgotPasswordForm } from '@/features/authentication/components/forgot-password-form';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export const metadata = {
  title: 'Şifremi Unuttum — Girisimbee',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Şifremi Unuttum"
      description="E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz."
      footer={
        <>
          <AuthLink href={AUTH_ROUTES.login}>Giriş sayfasına dön</AuthLink>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
