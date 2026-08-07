import { AccountHeader } from '@/features/account/components/AccountHeader';
import { AccountPayments } from '@/features/account/components/AccountPayments';

export const metadata = {
  title: 'Ödemelerim — Hesabım — Girisimbee',
};

export default function HesabimOdemelerimPage() {
  return (
    <>
      <AccountHeader
        title="Ödemelerim"
        description="Paket ödeme geçmişinizi görüntüleyin. Kart bilgileri saklanmaz."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountPayments />
      </div>
    </>
  );
}
