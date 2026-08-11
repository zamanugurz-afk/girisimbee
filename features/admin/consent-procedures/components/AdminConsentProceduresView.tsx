'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Archive, Eye, Plus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { ConsentProcedureEditorDialog } from '@/features/admin/consent-procedures/components/ConsentProcedureEditorDialog';
import {
  CONSENT_PROCEDURE_CATEGORIES,
  CONSENT_PROCEDURE_CATEGORY_LABELS,
  CONSENT_PROCEDURE_OWNER_LABELS,
  CONSENT_PROCEDURE_STATUS_LABELS,
} from '@/features/admin/consent-procedures/constants/consent-procedure.constants';
import {
  cloneConsentProcedures,
  createConsentProcedureId,
  replaceConsentProcedures,
  resetConsentProcedures,
} from '@/features/admin/consent-procedures/mock/consent-procedures.mock';
import type {
  ConsentProcedureCategory,
  ConsentProcedureDraft,
  ConsentRetentionProcedure,
} from '@/features/admin/consent-procedures/types/consent-procedure.types';
import { PERMISSIONS } from '@/features/authorization/permission.constants';
import { useRbac } from '@/features/authorization/hooks/use-rbac';
import type { AdminTableColumn } from '@/features/admin/panel/types/admin-panel.types';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import { cn } from '@/lib/utils';

export function AdminConsentProceduresView() {
  const { hasPermission } = useRbac();
  const canManage = hasPermission(PERMISSIONS.SETTINGS_MANAGE);

  const [rows, setRows] = useState<ConsentRetentionProcedure[]>(() => cloneConsentProcedures());
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | ConsentProcedureCategory>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ConsentRetentionProcedure | null>(null);
  const [guideId, setGuideId] = useState<string | null>(null);

  const guide = useMemo(
    () => rows.find((row) => row.id === guideId) ?? null,
    [guideId, rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return rows
      .filter((row) => category === 'all' || row.category === category)
      .filter((row) => {
        if (!q) return true;
        return (
          row.title.toLocaleLowerCase('tr-TR').includes(q)
          || row.code.toLocaleLowerCase('tr-TR').includes(q)
          || row.storageLocation.toLocaleLowerCase('tr-TR').includes(q)
          || row.retrievalAdminPath.toLocaleLowerCase('tr-TR').includes(q)
        );
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'tr'));
  }, [rows, query, category]);

  function persist(next: ConsentRetentionProcedure[]) {
    setRows(next);
    replaceConsentProcedures(next);
  }

  function openCreate() {
    if (!canManage) {
      toast.error('Prosedür eklemek için süper yönetici yetkisi gerekir.');
      return;
    }
    setEditing(null);
    setEditorOpen(true);
  }

  function openEdit(row: ConsentRetentionProcedure) {
    setEditing(row);
    setEditorOpen(true);
  }

  function handleSave(draft: ConsentProcedureDraft) {
    if (!canManage) return;
    const title = draft.title.trim();
    const code = draft.code.trim();
    if (!title || !code) {
      toast.error('Başlık ve kod zorunlu.');
      return;
    }
    const now = new Date().toISOString();
    if (draft.id) {
      persist(
        rows.map((row) =>
          row.id === draft.id
            ? {
                ...row,
                ...draft,
                title,
                code,
                updatedAt: now,
                updatedBy: 'admin',
              }
            : row,
        ),
      );
      toast.success('Prosedür güncellendi');
    } else {
      if (rows.some((row) => row.code === code)) {
        toast.error('Bu kod zaten kullanılıyor.');
        return;
      }
      persist([
        {
          ...draft,
          id: createConsentProcedureId(),
          title,
          code,
          updatedAt: now,
          updatedBy: 'admin',
        },
        ...rows,
      ]);
      toast.success('Prosedür oluşturuldu');
    }
    setEditorOpen(false);
  }

  function archiveRow(id: string) {
    if (!canManage) return;
    persist(
      rows.map((row) =>
        row.id === id
          ? { ...row, status: 'archived', updatedAt: new Date().toISOString(), updatedBy: 'admin' }
          : row,
      ),
    );
    toast.success('Prosedür arşivlendi');
  }

  function handleReset() {
    if (!canManage) return;
    resetConsentProcedures();
    setRows(cloneConsentProcedures());
    toast.success('Varsayılan prosedürlere dönüldü');
  }

  const columns: AdminTableColumn<ConsentRetentionProcedure>[] = [
    {
      key: 'title',
      header: 'İzin',
      render: (row) => (
        <div className="min-w-[14rem]">
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-xs text-muted-foreground">{row.code}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (row) => (
        <Badge variant="secondary">{CONSENT_PROCEDURE_CATEGORY_LABELS[row.category]}</Badge>
      ),
    },
    {
      key: 'storageLocation',
      header: 'Saklama yeri',
      render: (row) => (
        <p className="max-w-[16rem] truncate text-xs text-muted-foreground" title={row.storageLocation}>
          {row.storageLocation}
        </p>
      ),
    },
    {
      key: 'slaHours',
      header: 'SLA',
      render: (row) => <span className="tabular-nums">{row.slaHours}s</span>,
    },
    {
      key: 'ownerRole',
      header: 'Sorumlu',
      render: (row) => CONSENT_PROCEDURE_OWNER_LABELS[row.ownerRole],
    },
    {
      key: 'status',
      header: 'Durum',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'default' : 'outline'}>
          {CONSENT_PROCEDURE_STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      key: 'id',
      header: '',
      className: 'w-[1%] whitespace-nowrap',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1"
            onClick={() => setGuideId(row.id)}
          >
            <Eye className="h-3.5 w-3.5" />
            Temin
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => openEdit(row)}>
            {canManage ? 'Düzenle' : 'Görüntüle'}
          </Button>
          {canManage && row.status !== 'archived' ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              aria-label="Arşivle"
              onClick={() => archiveRow(row.id)}
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="İzin saklama & temin"
      description="Her iznin nerede saklandığını ve talep edildiğinde nasıl temin edileceğini buradan yönetin. Operasyon playbook’u — yasal metinler /yasal/* altında kalır."
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-950 dark:text-amber-100">
        Bu ekran şu an <strong>tarayıcı localStorage mock</strong> prosedür kataloğudur. Canlı KVKK audit
        kayıtları için{' '}
        <Link href="/admin/kvkk-izinleri" className="font-medium underline">
          KVKK İzinleri
        </Link>{' '}
        sayfasını kullanın.
      </div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <AdminSearch
            value={query}
            onChange={setQuery}
            placeholder="Başlık, kod, saklama yeri…"
            className="sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              label="Tümü"
              active={category === 'all'}
              onClick={() => setCategory('all')}
            />
            {CONSENT_PROCEDURE_CATEGORIES.map((key) => (
              <FilterChip
                key={key}
                label={CONSENT_PROCEDURE_CATEGORY_LABELS[key]}
                active={category === key}
                onClick={() => setCategory(key)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage ? (
            <>
              <Button type="button" variant="outline" className="gap-1.5" onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Varsayılanlar
              </Button>
              <Button type="button" className="gap-1.5" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Prosedür ekle
              </Button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Düzenleme yalnızca süper yönetici içindir.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AdminTable
          columns={columns}
          rows={filtered}
          emptyTitle="Prosedür bulunamadı"
          emptyDescription="Filtreyi temizleyin veya yeni prosedür ekleyin."
        />

        <aside className="rounded-2xl border border-border/80 bg-card p-4 dark:border-white/10">
          <h2 className="font-display text-base font-semibold">Temin rehberi</h2>
          {guide ? (
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{guide.title}</p>
                <p className="text-xs text-muted-foreground">{guide.code}</p>
              </div>
              <GuideBlock label="Saklama yeri" body={guide.storageLocation} />
              <GuideBlock label="Saklama süresi" body={guide.retentionPeriod} />
              <GuideBlock label="Temin adımları" body={guide.retrievalProcedure} pre />
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Nereden
                </p>
                {guide.retrievalAdminPath ? (
                  <Link
                    href={guide.retrievalAdminPath}
                    className="block text-sm font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    {guide.retrievalAdminPath}
                  </Link>
                ) : null}
                {guide.retrievalApiPath ? (
                  <Input readOnly value={guide.retrievalApiPath} className="font-mono text-xs" />
                ) : null}
              </div>
              <GuideBlock
                label="Kanıt / SLA"
                body={`${guide.evidenceFormat} · ${guide.slaHours} iş saati · ${CONSENT_PROCEDURE_OWNER_LABELS[guide.ownerRole]}`}
              />
              <p className="text-[11px] text-muted-foreground">
                Son güncelleme: {formatAdminDateTime(guide.updatedAt)}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Soldaki listeden <strong>Temin</strong> ile bir izin seçin. Talep geldiğinde adımlar
              burada açılır.
            </p>
          )}
        </aside>
      </div>

      <ConsentProcedureEditorDialog
        open={editorOpen}
        procedure={editing}
        canEdit={canManage}
        onOpenChange={setEditorOpen}
        onSave={handleSave}
      />
    </AdminPageShell>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium transition-colors',
        active
          ? 'bg-[#0B1220] text-white'
          : 'bg-[#F1F3F7] text-[#475569] hover:bg-[#E8EAF0] dark:bg-muted dark:text-muted-foreground',
      )}
    >
      {label}
    </button>
  );
}

function GuideBlock({ label, body, pre }: { label: string; body: string; pre?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          'text-sm text-foreground',
          pre && 'whitespace-pre-wrap rounded-lg bg-muted/50 p-2.5 text-[13px] leading-relaxed',
        )}
      >
        {body}
      </p>
    </div>
  );
}
