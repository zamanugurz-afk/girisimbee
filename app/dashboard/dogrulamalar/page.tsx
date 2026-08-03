import { BadgeCheck } from 'lucide-react';
import { DashboardPlaceholderPage } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Doğrulamalar — Kullanıcı Paneli — Girisimco',
};

export default function DashboardDogrulamalarPage() {
  return (
    <DashboardPlaceholderPage
      title="Doğrulamalar"
      description="E-posta, telefon, kullanıcı, şirket ve yatırımcı doğrulamalarınız."
      emptyTitle="Doğrulama merkezi"
      emptyDescription="Doğrulama başvurularınız burada listelenecek. Şimdilik profil düzenleme sayfasından devam edebilirsiniz."
      icon={BadgeCheck}
      cta={{ label: 'Profil doğrulamasına git', href: '/ayarlar#dogrulama' }}
    />
  );
}
