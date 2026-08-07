import { AccountSecurity } from '@/features/account/components/AccountSecurity';
import { DashboardPageHeader } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Güvenlik — Kullanıcı Paneli — GirisimBee',
};

export default function DashboardGuvenlikPage() {
  return (
    <>
      <DashboardPageHeader
        title="Güvenlik"
        description="Şifre, oturumlar ve hesap güvenliği ayarlarınız."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountSecurity />
      </div>
    </>
  );
}
