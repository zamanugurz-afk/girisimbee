import { AuthLayout, AuthLink } from '@/features/authentication/components/auth-layout';
import { RegisterForm } from '@/features/authentication/components/register-form';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export const metadata = {
  title: 'Kayıt Ol — GirisimBee',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Hesap Oluştur"
      description="GirisimBee'ya katılın ve doğru fırsatları keşfedin."
      footer={
        <>
          Zaten hesabınız var mı? <AuthLink href={AUTH_ROUTES.login}>Giriş yapın</AuthLink>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
