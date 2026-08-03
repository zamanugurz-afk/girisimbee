import { Package } from 'lucide-react';
import { AdminModulePlaceholder } from '@/features/admin/panel/views/AdminModulePlaceholder';

export const metadata = { title: 'Paketler — Yönetim' };

/** Skeleton entry for packages module (legacy packages UI remains available for later migration). */
export default function AdminPackagesPage() {
  return (
    <AdminModulePlaceholder
      title="Paketler"
      description="Abonelik ve vitrin paketlerinin yönetimi."
      emptyTitle="Paket yönetimi yakında"
      emptyDescription="Paket tanımları, fiyatlandırma ve aktivasyon akışları bu ekranda geliştirilecek."
      icon={Package}
    />
  );
}
