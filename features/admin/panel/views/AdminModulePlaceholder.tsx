import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminEmptyState } from '@/features/admin/panel/components/AdminEmptyState';

/** Skeleton placeholder for admin modules that will be built later. */
export function AdminModulePlaceholder({
  title,
  description,
  emptyTitle = 'Bu modül yakında hazır olacak',
  emptyDescription = 'Yönetim paneli iskeleti hazır. Bu bölümün ayrıntılı ekranları sonraki adımlarda geliştirilecek.',
  icon = Construction,
}: {
  title: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  icon?: LucideIcon;
}) {
  return (
    <AdminPageShell title={title} description={description}>
      <AdminEmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={icon}
      />
    </AdminPageShell>
  );
}
