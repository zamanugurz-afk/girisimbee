import { Ticket } from 'lucide-react';
import { AdminModulePlaceholder } from '@/features/admin/panel/views/AdminModulePlaceholder';

export const metadata = { title: 'Kuponlar — Yönetim' };

export default function AdminCouponsPage() {
  return (
    <AdminModulePlaceholder
      title="Kuponlar"
      description="İndirim kuponları ve kampanya kodları yönetimi."
      emptyTitle="Kupon yönetimi yakında"
      emptyDescription="Kupon oluşturma, kullanım takibi ve kampanya kuralları bu ekranda geliştirilecek."
      icon={Ticket}
    />
  );
}
