'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CONSENT_PROCEDURE_CATEGORIES,
  CONSENT_PROCEDURE_CATEGORY_LABELS,
  CONSENT_PROCEDURE_OWNER_LABELS,
  CONSENT_PROCEDURE_STATUS_LABELS,
} from '@/features/admin/consent-procedures/constants/consent-procedure.constants';
import type {
  ConsentProcedureCategory,
  ConsentProcedureDraft,
  ConsentProcedureOwner,
  ConsentProcedureStatus,
  ConsentRetentionProcedure,
} from '@/features/admin/consent-procedures/types/consent-procedure.types';

const EMPTY_DRAFT: ConsentProcedureDraft = {
  code: '',
  title: '',
  category: 'signup',
  summary: '',
  legalBasis: '',
  storageLocation: '',
  storageProcedure: '',
  retentionPeriod: '',
  retrievalProcedure: '',
  retrievalAdminPath: '/admin/',
  retrievalApiPath: '',
  evidenceFormat: '',
  slaHours: 24,
  ownerRole: 'admin',
  status: 'draft',
  version: '2026-08-01',
};

export function ConsentProcedureEditorDialog({
  open,
  procedure,
  canEdit,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  procedure: ConsentRetentionProcedure | null;
  canEdit: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (draft: ConsentProcedureDraft) => void;
}) {
  const [draft, setDraft] = useState<ConsentProcedureDraft>(EMPTY_DRAFT);

  useEffect(() => {
    if (!open) return;
    if (procedure) {
      const { updatedAt: _a, updatedBy: _b, ...rest } = procedure;
      setDraft(rest);
    } else {
      setDraft({ ...EMPTY_DRAFT });
    }
  }, [open, procedure]);

  function patch<K extends keyof ConsentProcedureDraft>(key: K, value: ConsentProcedureDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canEdit) return;
    onSave(draft);
  }

  const readOnly = !canEdit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {procedure ? 'İzin prosedürünü düzenle' : 'Yeni izin prosedürü'}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="proc-title">Başlık</Label>
              <Input
                id="proc-title"
                value={draft.title}
                disabled={readOnly}
                onChange={(e) => patch('title', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proc-code">Kod (kalıcı anahtar)</Label>
              <Input
                id="proc-code"
                value={draft.code}
                disabled={readOnly || Boolean(procedure)}
                onChange={(e) => patch('code', e.target.value.trim())}
                placeholder="örn. signup.terms"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proc-version">Versiyon</Label>
              <Input
                id="proc-version"
                value={draft.version}
                disabled={readOnly}
                onChange={(e) => patch('version', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proc-category">Kategori</Label>
              <select
                id="proc-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={draft.category}
                disabled={readOnly}
                onChange={(e) => patch('category', e.target.value as ConsentProcedureCategory)}
              >
                {CONSENT_PROCEDURE_CATEGORIES.map((key) => (
                  <option key={key} value={key}>
                    {CONSENT_PROCEDURE_CATEGORY_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proc-status">Durum</Label>
              <select
                id="proc-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={draft.status}
                disabled={readOnly}
                onChange={(e) => patch('status', e.target.value as ConsentProcedureStatus)}
              >
                {(Object.keys(CONSENT_PROCEDURE_STATUS_LABELS) as ConsentProcedureStatus[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {CONSENT_PROCEDURE_STATUS_LABELS[key]}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="proc-summary">Özet</Label>
              <Textarea
                id="proc-summary"
                value={draft.summary}
                disabled={readOnly}
                onChange={(e) => patch('summary', e.target.value)}
                rows={2}
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="proc-legal">Hukuki dayanak</Label>
              <Input
                id="proc-legal"
                value={draft.legalBasis}
                disabled={readOnly}
                onChange={(e) => patch('legalBasis', e.target.value)}
                required
              />
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border/80 p-4 dark:border-white/10">
            <h3 className="text-sm font-semibold text-foreground">Saklama prosedürü</h3>
            <div className="space-y-1.5">
              <Label htmlFor="proc-storage-loc">Saklama yeri</Label>
              <Input
                id="proc-storage-loc"
                value={draft.storageLocation}
                disabled={readOnly}
                onChange={(e) => patch('storageLocation', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proc-storage-steps">Nasıl saklanır? (adım adım)</Label>
              <Textarea
                id="proc-storage-steps"
                value={draft.storageProcedure}
                disabled={readOnly}
                onChange={(e) => patch('storageProcedure', e.target.value)}
                rows={5}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proc-retention">Saklama süresi</Label>
              <Input
                id="proc-retention"
                value={draft.retentionPeriod}
                disabled={readOnly}
                onChange={(e) => patch('retentionPeriod', e.target.value)}
                required
              />
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border/80 p-4 dark:border-white/10">
            <h3 className="text-sm font-semibold text-foreground">Temin prosedürü</h3>
            <p className="text-xs text-muted-foreground">
              Bir makam veya kullanıcı izin kaydını istediğinde izlenecek adımlar.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="proc-retrieval-steps">Nasıl temin edilir? (adım adım)</Label>
              <Textarea
                id="proc-retrieval-steps"
                value={draft.retrievalProcedure}
                disabled={readOnly}
                onChange={(e) => patch('retrievalProcedure', e.target.value)}
                rows={5}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="proc-admin-path">Admin yolu</Label>
                <Input
                  id="proc-admin-path"
                  value={draft.retrievalAdminPath}
                  disabled={readOnly}
                  onChange={(e) => patch('retrievalAdminPath', e.target.value)}
                  placeholder="/admin/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proc-api-path">API yolu</Label>
                <Input
                  id="proc-api-path"
                  value={draft.retrievalApiPath}
                  disabled={readOnly}
                  onChange={(e) => patch('retrievalApiPath', e.target.value)}
                  placeholder="/api/admin/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proc-format">Kanıt formatı</Label>
                <Input
                  id="proc-format"
                  value={draft.evidenceFormat}
                  disabled={readOnly}
                  onChange={(e) => patch('evidenceFormat', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proc-sla">SLA (iş saati)</Label>
                <Input
                  id="proc-sla"
                  type="number"
                  min={1}
                  value={draft.slaHours}
                  disabled={readOnly}
                  onChange={(e) => patch('slaHours', Number(e.target.value) || 1)}
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="proc-owner">Sorumlu rol</Label>
                <select
                  id="proc-owner"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={draft.ownerRole}
                  disabled={readOnly}
                  onChange={(e) => patch('ownerRole', e.target.value as ConsentProcedureOwner)}
                >
                  {(Object.keys(CONSENT_PROCEDURE_OWNER_LABELS) as ConsentProcedureOwner[]).map(
                    (key) => (
                      <option key={key} value={key}>
                        {CONSENT_PROCEDURE_OWNER_LABELS[key]}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Kapat
            </Button>
            {canEdit ? (
              <Button type="submit">{procedure ? 'Kaydet' : 'Oluştur'}</Button>
            ) : null}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
