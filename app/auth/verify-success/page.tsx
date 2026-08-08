import { AuthLayout } from '@/features/authentication/components/auth-layout';
import { VerifySuccessPanel } from '@/features/authentication/components/verify-success-panel';

export const metadata = {
  title: 'E-posta Doğrulandı — Girisimbee',
};

export default function VerifySuccessPage() {
  return (
    <AuthLayout
      title="E-posta adresiniz doğrulandı!"
      description={
        <>
          Hesabınız başarıyla aktif hale getirildi.
          <br />
          Artık Girişimbee platformunu kullanmaya başlayabilirsiniz.
        </>
      }
    >
      <VerifySuccessPanel />
    </AuthLayout>
  );
}
