'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LifeBuoy, Loader2, Mail, Phone, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminEmptyState } from '@/features/admin/panel/components/AdminEmptyState';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';
import { supportAdminApi } from '@/features/support-inbox/lib/support-inquiry-api';
import {
  SUPPORT_INQUIRY_CHANNEL_LABELS,
  SUPPORT_INQUIRY_STATUS_LABELS,
  SUPPORT_INQUIRY_SUBJECT_LABELS,
  SUPPORT_ROUTES,
} from '@/features/support-inbox/constants/support-inquiry.constants';
import type {
  SupportInquiry,
  SupportInquiryStatus,
} from '@/features/support-inbox/types/support-inquiry.types';
import { SUPPORT_INQUIRY_STATUSES } from '@/features/support-inbox/types/support-inquiry.types';
import { cn } from '@/lib/utils';

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminSupportInquiriesView() {
  const [items, setItems] = useState<SupportInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | SupportInquiryStatus>('all');
  const [selected, setSelected] = useState<SupportInquiry | null>(null);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<SupportInquiryStatus>('new');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await supportAdminApi.list({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setItems(list);
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Yüklenemedi';
      const friendly = /marketplace_support_inquiries|schema cache|does not exist/i.test(raw)
        ? 'Destek tablosu henüz kurulmadı. Migration’ı uygulayın.'
        : raw;
      toast.error(friendly);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const newCount = useMemo(
    () => items.filter((i) => i.status === 'new').length,
    [items],
  );

  function openDetail(item: SupportInquiry) {
    setSelected(item);
    setNote(item.adminNote ?? '');
    setStatus(item.status);
  }

  async function saveDetail(nextStatus?: SupportInquiryStatus) {
    if (!selected) return;
    setBusy(true);
    try {
      const item = await supportAdminApi.update(selected.id, {
        status: nextStatus ?? status,
        adminNote: note.trim() || null,
      });
      setSelected(item);
      setStatus(item.status);
      setNote(item.adminNote ?? '');
      setItems((prev) => prev.map((row) => (row.id === item.id ? item : row)));
      toast.success('Kaydedildi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kaydedilemedi');
    } finally {
      setBusy(false);
    }
  }

  async function removeInquiry(item: SupportInquiry) {
    if (!window.confirm('Bu destek talebi silinsin mi?')) return;
    setBusy(true);
    try {
      await supportAdminApi.remove(item.id);
      setItems((prev) => prev.filter((row) => row.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
      toast.success('Silindi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Silinemedi');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminPageShell
      title="Destek talepleri"
      description={`Sitedeki /destek formundan gelen talepler. Yeni: ${newCount}`}
      toolbar={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={SUPPORT_ROUTES.public} target="_blank" rel="noreferrer">
              Formu aç
            </a>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', loading && 'animate-spin')} />
            Yenile
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as 'all' | SupportInquiryStatus)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            {SUPPORT_INQUIRY_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {SUPPORT_INQUIRY_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <AdminLoadingState />
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={LifeBuoy}
          title="Destek talebi yok"
          description="Kullanıcılar /destek üzerinden gönderdiğinde burada listelenir."
        />
      ) : (
        <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-card">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                onClick={() => openDetail(item)}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{item.fullName}</span>
                    <Badge variant="secondary">{SUPPORT_INQUIRY_STATUS_LABELS[item.status]}</Badge>
                    <Badge variant="outline">{SUPPORT_INQUIRY_SUBJECT_LABELS[item.subject]}</Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{item.message}</p>
                  <p className="text-xs text-muted-foreground">{formatWhen(item.createdAt)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      void removeInquiry(item);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.fullName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="flex flex-wrap gap-3 text-muted-foreground">
                  <a className="inline-flex items-center gap-1 hover:text-foreground" href={`mailto:${selected.email}`}>
                    <Mail className="h-3.5 w-3.5" />
                    {selected.email}
                  </a>
                  {selected.phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {selected.phone}
                    </span>
                  ) : null}
                </p>
                <p>
                  <span className="text-muted-foreground">Kanal: </span>
                  {SUPPORT_INQUIRY_CHANNEL_LABELS[selected.channel]}
                  {' · '}
                  <span className="text-muted-foreground">Konu: </span>
                  {SUPPORT_INQUIRY_SUBJECT_LABELS[selected.subject]}
                </p>
                <p className="whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/30 p-3">
                  {selected.message}
                </p>
                <div className="space-y-2">
                  <Label>Durum</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as SupportInquiryStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORT_INQUIRY_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {SUPPORT_INQUIRY_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminNote">Admin notu</Label>
                  <Textarea
                    id="adminNote"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" disabled={busy} onClick={() => setSelected(null)}>
                  Kapat
                </Button>
                <Button type="button" disabled={busy} onClick={() => void saveDetail()}>
                  {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                  Kaydet
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}
