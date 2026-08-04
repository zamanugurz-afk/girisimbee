'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Archive,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Store,
  Trash2,
  Upload,
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminEmptyState } from '@/features/admin/panel/components/AdminEmptyState';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { canManageMarket } from '@/features/admin/market/lib/market-permissions';
import {
  MARKET_MAX_PUBLISHED,
  MARKET_STATUS_LABELS,
  type MarketItem,
  type MarketItemStatus,
} from '@/features/admin/market/types/market.types';
import {
  cloneMockMarketItems,
  createMockMarketId,
} from '@/features/admin/market/mock/market.mock';
import { cn } from '@/lib/utils';

type FormState = {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  ctaLabel: string;
  sortOrder: string;
  status: MarketItemStatus;
};

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  imageUrl: '',
  linkUrl: '',
  ctaLabel: 'İncele',
  sortOrder: '0',
  status: 'draft',
};

function toForm(item: MarketItem): FormState {
  return {
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl ?? '',
    linkUrl: item.linkUrl ?? '',
    ctaLabel: item.ctaLabel,
    sortOrder: String(item.sortOrder),
    status: item.status,
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

export function AdminMarketView() {
  const { user } = useAuth();
  const canWrite = canManageMarket(user?.role, user?.rawRole);
  const [items, setItems] = useState<MarketItem[]>(() => cloneMockMarketItems());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const publishedCount = useMemo(
    () => items.filter((item) => item.status === 'published').length,
    [items],
  );

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(item: MarketItem) {
    setEditing(item);
    setForm(toForm(item));
    setDialogOpen(true);
  }

  function handleSave() {
    if (!canWrite) return;
    if (!form.title.trim()) {
      toast.error('Başlık zorunludur.');
      return;
    }

    const nextStatus = form.status;
    const publishedOthers = items.filter(
      (item) =>
        item.status === 'published' && (!editing || item.id !== editing.id),
    ).length;
    if (nextStatus === 'published' && publishedOthers >= MARKET_MAX_PUBLISHED) {
      toast.error(`En fazla ${MARKET_MAX_PUBLISHED} MARKET kartı yayınlanabilir.`);
      return;
    }

    setSaving(true);
    const stamp = nowIso();
    try {
      if (editing) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === editing.id
              ? {
                  ...item,
                  title: form.title.trim(),
                  description: form.description.trim(),
                  imageUrl: form.imageUrl.trim() || null,
                  linkUrl: form.linkUrl.trim() || null,
                  ctaLabel: form.ctaLabel.trim() || 'İncele',
                  sortOrder: Number(form.sortOrder) || 0,
                  status: nextStatus,
                  publishedAt:
                    nextStatus === 'published'
                      ? item.publishedAt ?? stamp
                      : item.publishedAt,
                  updatedAt: stamp,
                }
              : item,
          ),
        );
        toast.success('Kart güncellendi (mock)');
      } else {
        const created: MarketItem = {
          id: createMockMarketId(),
          title: form.title.trim(),
          description: form.description.trim(),
          imageUrl: form.imageUrl.trim() || null,
          linkUrl: form.linkUrl.trim() || null,
          ctaLabel: form.ctaLabel.trim() || 'İncele',
          sortOrder: Number(form.sortOrder) || 0,
          status: nextStatus,
          publishedAt: nextStatus === 'published' ? stamp : null,
          createdBy: user?.id ?? null,
          createdAt: stamp,
          updatedAt: stamp,
          deletedAt: null,
        };
        setItems((prev) => [created, ...prev]);
        toast.success('Kart oluşturuldu (mock)');
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  }

  function handlePublish(item: MarketItem, publish: boolean) {
    if (!canWrite) return;
    if (publish) {
      const publishedOthers = items.filter(
        (row) => row.status === 'published' && row.id !== item.id,
      ).length;
      if (publishedOthers >= MARKET_MAX_PUBLISHED) {
        toast.error(`En fazla ${MARKET_MAX_PUBLISHED} MARKET kartı yayınlanabilir.`);
        return;
      }
    }

    setBusyId(item.id);
    const stamp = nowIso();
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id
          ? {
              ...row,
              status: publish ? 'published' : 'draft',
              publishedAt: publish ? row.publishedAt ?? stamp : row.publishedAt,
              updatedAt: stamp,
            }
          : row,
      ),
    );
    toast.success(publish ? 'Kart yayınlandı (mock)' : 'Kart taslağa alındı (mock)');
    setBusyId(null);
  }

  function handleDelete(item: MarketItem) {
    if (!canWrite) return;
    if (!window.confirm(`“${item.title}” silinsin mi?`)) return;
    setBusyId(item.id);
    setItems((prev) => prev.filter((row) => row.id !== item.id));
    toast.success('Kart silindi (mock)');
    setBusyId(null);
  }

  return (
    <AdminPageShell
      title="MARKET"
      description="Sponsorlu MARKET reklamlarını yönetin. Yalnızca admin ve süper admin reklam oluşturabilir; kullanıcılar reklam veremez. En fazla 5 kart yayınlanabilir. Şimdilik mock veri kullanılıyor."
      toolbar={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Yayında: <span className="font-medium text-foreground">{publishedCount}</span> /{' '}
            {MARKET_MAX_PUBLISHED}
            <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
              Mock veri
            </span>
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              Admin / süper admin
            </span>
            {!canWrite ? (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                Salt okunur (moderator)
              </span>
            ) : null}
          </p>
          {canWrite ? (
            <Button type="button" size="sm" className="rounded-xl" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Yeni kart
            </Button>
          ) : null}
        </div>
      }
    >
      {items.length === 0 ? (
        <AdminEmptyState
          icon={Store}
          title="Henüz MARKET kartı yok"
          description="Ana sayfada göstermek için yeni bir kart oluşturun."
          action={
            canWrite ? (
              <Button type="button" size="sm" className="rounded-xl" onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" />
                İlk kartı oluştur
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className={cn(
                'flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm',
                'dark:border-white/10',
              )}
            >
              <div className="relative aspect-[16/9] bg-muted">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Store className="h-8 w-8 opacity-40" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {item.description || 'Açıklama yok'}
                    </p>
                  </div>
                  <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                    {MARKET_STATUS_LABELS[item.status]}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Sıra: {item.sortOrder}
                  {item.linkUrl ? ` · ${item.linkUrl}` : ''}
                </p>
                {canWrite ? (
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      disabled={busyId === item.id}
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Düzenle
                    </Button>
                    {item.status === 'published' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        disabled={busyId === item.id}
                        onClick={() => handlePublish(item, false)}
                      >
                        <Archive className="mr-1 h-3.5 w-3.5" />
                        Yayından kaldır
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-lg"
                        disabled={busyId === item.id}
                        onClick={() => handlePublish(item, true)}
                      >
                        <Upload className="mr-1 h-3.5 w-3.5" />
                        Yayınla
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-lg text-destructive"
                      disabled={busyId === item.id}
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Sil
                    </Button>
                  </div>
                ) : (
                  <p className="mt-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    Görüntüleme modu
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Kartı düzenle' : 'Yeni MARKET kartı'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="market-title">Başlık</Label>
              <Input
                id="market-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-desc">Açıklama</Label>
              <Textarea
                id="market-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-image">Görsel URL</Label>
              <Input
                id="market-image"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-link">Fırsat bağlantısı URL</Label>
              <Input
                id="market-link"
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="/kesfet veya https://..."
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="market-cta">CTA metni</Label>
                <Input
                  id="market-cta"
                  value={form.ctaLabel}
                  onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="market-sort">Sıra</Label>
                <Input
                  id="market-sort"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-status">Durum</Label>
              <select
                id="market-status"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as MarketItemStatus }))
                }
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayında</option>
                <option value="archived">Arşiv</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              onClick={() => handleSave()}
              disabled={saving || !canWrite}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}

