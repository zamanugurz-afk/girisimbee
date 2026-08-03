import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import type {
  AdminTableColumn,
  AdminTopUserRow,
} from '@/features/admin/panel/types/admin-panel.types';

const columns: AdminTableColumn<AdminTopUserRow>[] = [
  { key: 'full_name', header: 'Ad' },
  { key: 'username', header: 'Kullanıcı adı' },
  {
    key: 'listing_count',
    header: 'İlan sayısı',
    className: 'tabular-nums',
  },
  {
    key: 'last_active_at',
    header: 'Son aktivite',
    render: (row) => formatAdminDateTime(row.last_active_at),
  },
];

export function AdminTopUsersTable({
  rows,
  emptyTitle = 'Kullanıcı bulunamadı',
}: {
  rows: AdminTopUserRow[];
  emptyTitle?: string;
}) {
  return (
    <AdminTable
      columns={columns}
      rows={rows}
      emptyTitle={emptyTitle}
      emptyDescription="Bu dönem için aktif kullanıcı verisi yok."
    />
  );
}
