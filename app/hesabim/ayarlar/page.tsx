import { AccountHeader } from '@/features/account/components/AccountHeader';
import { AccountSettings } from '@/features/account/components/AccountSettings';

export const metadata = {
  title: 'Ayarlar — Hesabım — Girisimco',
};

export default function HesabimAyarlarPage() {
  return (
    <>
      <AccountHeader
        title="Ayarlar"
        description="Bildirim, gizlilik ve hesap tercihlerinizi yönetin."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountSettings />
      </div>
    </>
  );
}
