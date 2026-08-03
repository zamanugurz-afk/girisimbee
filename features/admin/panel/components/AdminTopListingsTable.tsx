import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import type {
  AdminTableColumn,
  AdminTopListingRow,
} from '@/features/admin/panel/types/admin-panel.types';

const columns: AdminTableColumn<AdminTopListingRow>[] = [
  { key: 'title', header: 'İlan', className: 'min-w-[180px]' },
  { key: 'owner', header: 'Sahip' },
  {
    key: 'view_count',
    header: 'Görüntülenme',
    className: 'tabular-nums',
  },
  {
    key: 'favorite_count',
    header: 'Favori',
    className: 'tabular-nums',
  },
];

export function AdminTopListingsTable({
  rows,
  emptyTitle = 'İlan bulunamadı',
}: {
  rows: AdminTopListingRow[];
  emptyTitle?: string;
}) {
  return (
    <AdminTable
      columns={columns}
      rows={rows}
      emptyTitle={emptyTitle}
      emptyDescription="Bu dönem için sıralama verisi yok."
    />
  );
}
