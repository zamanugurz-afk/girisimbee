import { AccountSettings } from '@/features/account/components/AccountSettings';
import { DashboardPageHeader } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Ayarlar — Kullanıcı Paneli — GirisimBee',
};

export default function DashboardAyarlarPage() {
  return (
    <>
      <DashboardPageHeader
        title="Ayarlar"
        description="Bildirim, gizlilik ve hesap tercihleriniz."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountSettings />
      </div>
    </>
  );
}
