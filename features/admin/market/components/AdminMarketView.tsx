'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { canManageMarket } from '@/features/admin/market/lib/market-permissions';
import { marketAdminApi } from '@/features/admin/market/lib/market-admin-api';
import {
  MARKET_MAX_PUBLISHED,
  MARKET_STATUS_LABELS,
  type MarketItem,
  type MarketItemStatus,
} from '@/features/admin/market/types/market.types';
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

export function AdminMarketView() {
  const { user } = useAuth();
  const canWrite = canManageMarket(user?.role, user?.rawRole);
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const publishedCount = useMemo(
    () => items.filter((item) => item.status === 'published').length,
    [items],
  );

  async function load() {
    setLoading(true);
    try {
      const next = await marketAdminApi.list();
      setItems(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'MARKET kartları yüklenemedi');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

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

  async function handleSave() {
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
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim() || null,
        linkUrl: form.linkUrl.trim() || null,
        ctaLabel: form.ctaLabel.trim() || 'İncele',
        sortOrder: Number(form.sortOrder) || 0,
        status: nextStatus,
      };
      if (editing) {
        await marketAdminApi.update(editing.id, payload);
        toast.success('Kart güncellendi');
      } else {
        await marketAdminApi.create(payload);
        toast.success('Kart oluşturuldu');
      }
      setDialogOpen(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(item: MarketItem, publish: boolean) {
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
    try {
      await marketAdminApi.publish(item.id, publish);
      toast.success(publish ? 'Kart yayınlandı' : 'Kart taslağa alındı');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Yayın işlemi başarısız');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item: MarketItem) {
    if (!canWrite) return;
    if (!window.confirm(`“${item.title}” silinsin mi?`)) return;
    setBusyId(item.id);
    try {
      await marketAdminApi.remove(item.id);
      toast.success('Kart silindi');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Silme başarısız');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminPageShell
      title="MARKET"
      description="Sponsorlu MARKET reklamlarını yönetin. Yalnızca admin ve süper admin reklam oluşturabilir. En fazla 5 kart yayınlanabilir."
      toolbar={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Yayında: <span className="font-medium text-foreground">{publishedCount}</span> /{' '}
            {MARKET_MAX_PUBLISHED}
            <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400">
              Canlı veri
            </span>
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              Admin / süper admin
            </span>
            {!canWrite ? (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                Salt okunur
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
      {loading ? (
        <AdminLoadingState />
      ) : items.length === 0 ? (
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
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{item.title}</h3>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {MARKET_STATUS_LABELS[item.status]}
                  </Badge>
                </div>
                {item.description ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                ) : null}
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {canWrite ? (
                    <>
                      <Button type="button" size="sm" variant="outline" onClick={() => openEdit(item)}>
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Düzenle
                      </Button>
                      {item.status === 'published' ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busyId === item.id}
                          onClick={() => void handlePublish(item, false)}
                        >
                          {busyId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Archive className="mr-1 h-3.5 w-3.5" />}
                          Taslak
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          disabled={busyId === item.id}
                          onClick={() => void handlePublish(item, true)}
                        >
                          {busyId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1 h-3.5 w-3.5" />}
                          Yayınla
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={busyId === item.id}
                        onClick={() => void handleDelete(item)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Sil
                      </Button>
                    </>
                  ) : (
                    <Button type="button" size="sm" variant="outline" disabled>
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      Salt okunur
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Kartı düzenle' : 'Yeni MARKET kartı'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="market-title">Başlık</Label>
              <Input
                id="market-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="market-description">Açıklama</Label>
              <Textarea
                id="market-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="market-image">Görsel URL</Label>
              <Input
                id="market-image"
                value={form.imageUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="market-link">Bağlantı</Label>
              <Input
                id="market-link"
                value={form.linkUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
                placeholder="/market veya https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="market-cta">CTA</Label>
                <Input
                  id="market-cta"
                  value={form.ctaLabel}
                  onChange={(e) => setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="market-sort">Sıra</Label>
                <Input
                  id="market-sort"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="market-status">Durum</Label>
              <select
                id="market-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value as MarketItemStatus }))
                }
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayında</option>
                <option value="archived">Arşiv</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleSave()}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}
