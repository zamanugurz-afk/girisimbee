import { AccountHeader } from '@/features/account/components/AccountHeader';
import { AccountSecurity } from '@/features/account/components/AccountSecurity';

export const metadata = {
  title: 'Güvenlik — Hesabım — Girisimco',
};

export default function HesabimGuvenlikPage() {
  return (
    <>
      <AccountHeader
        title="Güvenlik"
        description="Şifre, oturumlar, iki adımlı doğrulama ve hesap işlemleri."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountSecurity />
      </div>
    </>
  );
}
