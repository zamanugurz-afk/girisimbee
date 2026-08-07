import type { AdminTableColumn } from '@/features/admin/panel/types/admin-panel.types';
import { AdminEmptyState } from '@/features/admin/panel/components/AdminEmptyState';

export function AdminTable<T extends { id: string }>({
  columns,
  rows,
  emptyTitle,
  emptyDescription,
}: {
  columns: AdminTableColumn<T>[];
  rows: T[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (rows.length === 0) {
    return <AdminEmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/80 dark:border-white/10">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.id ?? col.key}
                className={`px-4 py-3 font-medium text-muted-foreground ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border/60 last:border-0 dark:border-white/5"
            >
              {columns.map((col) => (
                <td
                  key={col.id ?? col.key}
                  className={`px-4 py-3 text-foreground ${col.className ?? ''}`}
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
