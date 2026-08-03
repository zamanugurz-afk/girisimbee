'use client';

import { useMemo, useState } from 'react';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import { MOCK_ADMIN_SETTINGS } from '@/features/admin/panel/mock/admin-panel.mock';
import type {
  AdminMockSetting,
  AdminTableColumn,
} from '@/features/admin/panel/types/admin-panel.types';

const PAGE_SIZE = 5;

const columns: AdminTableColumn<AdminMockSetting>[] = [
  { key: 'label', header: 'Ayar' },
  { key: 'key', header: 'Anahtar' },
  { key: 'value', header: 'Değer' },
  { key: 'editableBy', header: 'Düzenleme yetkisi' },
];

export function AdminSettingsView() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_ADMIN_SETTINGS;
    return MOCK_ADMIN_SETTINGS.filter(
      (s) =>
        s.label.toLowerCase().includes(q)
        || s.key.toLowerCase().includes(q)
        || s.value.toLowerCase().includes(q),
    );
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const rows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <AdminPageShell
      title="Ayarlar"
      description="Sistem ayarları — mock veriler (salt okunur iskelet)"
      toolbar={
        <AdminSearch
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          placeholder="Ayar ara…"
        />
      }
    >
      <AdminTable
        columns={columns}
        rows={rows}
        emptyTitle="Ayar bulunamadı"
        emptyDescription="Arama kriterlerinize uygun ayar yok."
      />
      <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
    </AdminPageShell>
  );
}
