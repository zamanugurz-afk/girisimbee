import { AccountPayments } from '@/features/account/components/AccountPayments';
import { DashboardPageHeader } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Ödemelerim — Kullanıcı Paneli — GirisimBee',
};

export default function DashboardOdemelerimPage() {
  return (
    <>
      <DashboardPageHeader
        title="Ödemelerim"
        description="Ödeme geçmişiniz ve fatura kayıtlarınız."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountPayments />
      </div>
    </>
  );
}
