import { Search } from 'lucide-react';
import { AdminModulePlaceholder } from '@/features/admin/panel/views/AdminModulePlaceholder';

export const metadata = { title: 'SEO — Yönetim' };

export default function AdminSeoPage() {
  return (
    <AdminModulePlaceholder
      title="SEO"
      description="Meta etiketleri, sitemap ve arama görünürlüğü ayarları."
      emptyTitle="SEO yönetimi yakında"
      emptyDescription="Sayfa meta alanları, yönlendirmeler ve indeksleme kontrolleri bu ekranda geliştirilecek."
      icon={Search}
    />
  );
}
