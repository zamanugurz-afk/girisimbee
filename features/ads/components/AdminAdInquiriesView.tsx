'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ExternalLink,
  Handshake,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Store,
  Trash2,
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
import { adsAdminApi } from '@/features/ads/lib/ad-inquiry-api';
import {
  AD_INQUIRY_KIND_LABELS,
  AD_INQUIRY_STATUS_LABELS,
  ADS_ROUTES,
  MARKET_AD_PRICE_LABEL,
  PARTNERSHIP_TYPE_LABELS,
} from '@/features/ads/constants/ad-inquiry.constants';
import type {
  AdInquiry,
  AdInquiryKind,
  AdInquiryStatus,
  PartnershipType,
} from '@/features/ads/types/ad-inquiry.types';
import { AD_INQUIRY_STATUSES } from '@/features/ads/types/ad-inquiry.types';
import { ADMIN_ROUTES } from '@/features/admin/panel/constants/admin-nav.constants';
import { cn } from '@/lib/utils';

type KindTab = 'all' | AdInquiryKind;

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

function partnershipLabel(type: string | null) {
  if (!type) return '—';
  return PARTNERSHIP_TYPE_LABELS[type as PartnershipType] ?? type;
}

function summaryOf(item: AdInquiry) {
  if (item.kind === 'market_ad') {
    return { title: item.title ?? 'MARKET reklamı', subtitle: item.description ?? '' };
  }
  return {
    title: partnershipLabel(item.partnershipType),
    subtitle: item.message ?? '',
  };
}

export function AdminAdInquiriesView() {
  const [items, setItems] = useState<AdInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [kindTab, setKindTab] = useState<KindTab>('partnership');
  const [statusFilter, setStatusFilter] = useState<'all' | AdInquiryStatus>('all');
  const [selected, setSelected] = useState<AdInquiry | null>(null);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<AdInquiryStatus>('new');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adsAdminApi.list({
        kind: kindTab === 'all' ? undefined : kindTab,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setItems(list);
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Talepler yüklenemedi';
      const friendly = /marketplace_ad_inquiries|schema cache|does not exist/i.test(raw)
        ? 'Tablo henüz kurulmadı. Supabase SQL Editor’da scripts/apply-ad-inquiries.sql dosyasını çalıştırın.'
        : raw;
      toast.error(friendly);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [kindTab, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const allNew = items.filter((i) => i.status === 'new').length;
    const reviewing = items.filter((i) => i.status === 'reviewing').length;
    const partnerships = items.filter((i) => i.kind === 'partnership').length;
    const marketAds = items.filter((i) => i.kind === 'market_ad').length;
    return { allNew, reviewing, partnerships, marketAds, total: items.length };
  }, [items]);

  function openDetail(item: AdInquiry) {
    setSelected(item);
    setNote(item.adminNote ?? '');
    setStatus(item.status);
  }

  async function saveDetail(nextStatus?: AdInquiryStatus) {
    if (!selected) return;
    setBusy(true);
    const statusToSave = nextStatus ?? status;
    try {
      const updated = await adsAdminApi.update(selected.id, {
        status: statusToSave,
        adminNote: note.trim() || null,
      });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setSelected(updated);
      setStatus(updated.status);
      toast.success('Talep güncellendi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Güncellenemedi');
    } finally {
      setBusy(false);
    }
  }

  async function quickStatus(item: AdInquiry, next: AdInquiryStatus) {
    setBusy(true);
    try {
      const updated = await adsAdminApi.update(item.id, { status: next });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      if (selected?.id === updated.id) {
        setSelected(updated);
        setStatus(updated.status);
      }
      toast.success(`Durum: ${AD_INQUIRY_STATUS_LABELS[next]}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Güncellenemedi');
    } finally {
      setBusy(false);
    }
  }

  async function removeInquiry(item: AdInquiry) {
    const label =
      item.kind === 'partnership'
        ? item.fullName
        : item.title || item.fullName;
    if (!window.confirm(`“${label}” talebini silmek istediğinize emin misiniz?`)) {
      return;
    }
    setBusy(true);
    try {
      await adsAdminApi.remove(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
      toast.success('Talep silindi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Silinemedi');
    } finally {
      setBusy(false);
    }
  }

  const tabs: { id: KindTab; label: string; icon: typeof Handshake }[] = [
    { id: 'partnership', label: 'Özel işbirliği', icon: Handshake },
    { id: 'market_ad', label: 'MARKET reklamı', icon: Store },
    { id: 'all', label: 'Tümü', icon: Building2 },
  ];

  return (
    <AdminPageShell
      title="Reklam & İşbirliği"
      description="Özel işbirliği taleplerini ve MARKET reklam başvurularını buradan takip edin. Durum güncelleyin, not ekleyin, iletişim bilgisine ulaşın."
      toolbar={
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Listelenen" value={stats.total} />
            <StatCard label="Yeni" value={stats.allNew} accent={stats.allNew > 0} />
            <StatCard label="İnceleniyor" value={stats.reviewing} />
            <StatCard
              label={kindTab === 'market_ad' ? 'MARKET' : 'İşbirliği'}
              value={kindTab === 'market_ad' ? stats.marketAds : stats.partnerships}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1 rounded-xl border border-border/80 bg-muted/30 p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = kindTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setKindTab(tab.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                      active
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm durumlar</SelectItem>
                {AD_INQUIRY_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {AD_INQUIRY_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', loading && 'animate-spin')} />
              Yenile
            </Button>

            <Button asChild variant="outline" size="sm" className="ml-auto rounded-xl">
              <Link href={ADMIN_ROUTES.market}>
                <Store className="mr-1.5 h-4 w-4" aria-hidden />
                MARKET yönetimi
              </Link>
            </Button>
          </div>
        </div>
      }
    >
      {loading ? (
        <AdminLoadingState />
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={kindTab === 'market_ad' ? Store : Handshake}
          title={
            kindTab === 'partnership'
              ? 'Henüz özel işbirliği talebi yok'
              : kindTab === 'market_ad'
                ? 'Henüz MARKET reklam başvurusu yok'
                : 'Henüz talep yok'
          }
          description="/reklam sayfasından gelen talepler burada listelenir. Özel işbirliği formu gönderildiğinde anında bu panoya düşer."
          action={
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link href={ADS_ROUTES.public} target="_blank" rel="noreferrer">
                Public formu aç
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/80">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/80 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">Tür</th>
                <th className="px-4 py-3 font-medium">Firma / iletişim</th>
                <th className="px-4 py-3 font-medium">Talep özeti</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const summary = summaryOf(item);
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      'border-b border-border/60 last:border-0',
                      item.status === 'new' && 'bg-primary/[0.03]',
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatWhen(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{AD_INQUIRY_KIND_LABELS[item.kind]}</Badge>
                      {item.kind === 'market_ad' ? (
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {MARKET_AD_PRICE_LABEL}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{item.fullName}</div>
                      {item.company ? (
                        <div className="text-xs text-muted-foreground">{item.company}</div>
                      ) : null}
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        <a
                          href={`mailto:${item.email}`}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <Mail className="h-3 w-3" aria-hidden />
                          {item.email}
                        </a>
                        {item.phone ? (
                          <a
                            href={`tel:${item.phone}`}
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Phone className="h-3 w-3" aria-hidden />
                            {item.phone}
                          </a>
                        ) : null}
                      </div>
                    </td>
                    <td className="max-w-[280px] px-4 py-3">
                      <div className="truncate font-medium">{summary.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{summary.subtitle}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status === 'new' ? 'default' : 'secondary'}>
                        {AD_INQUIRY_STATUS_LABELS[item.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {item.status === 'new' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-lg text-xs"
                            disabled={busy}
                            onClick={() => void quickStatus(item, 'reviewing')}
                          >
                            İncele
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-lg"
                          onClick={() => openDetail(item)}
                        >
                          Detay
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={busy}
                          onClick={() => void removeInquiry(item)}
                          aria-label="Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selected ? AD_INQUIRY_KIND_LABELS[selected.kind] : 'Talep'}
            </DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  İletişim
                </p>
                <p className="mt-1 font-semibold">{selected.fullName}</p>
                {selected.company ? (
                  <p className="text-muted-foreground">{selected.company}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline" className="rounded-lg">
                    <a href={`mailto:${selected.email}`}>
                      <Mail className="mr-1.5 h-3.5 w-3.5" />
                      E-posta
                    </a>
                  </Button>
                  {selected.phone ? (
                    <Button asChild size="sm" variant="outline" className="rounded-lg">
                      <a href={`tel:${selected.phone}`}>
                        <Phone className="mr-1.5 h-3.5 w-3.5" />
                        Ara
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>

              <DetailRow label="Kayıt" value={formatWhen(selected.createdAt)} />

              {selected.kind === 'market_ad' ? (
                <>
                  <DetailRow label="Başlık" value={selected.title ?? '—'} />
                  <DetailRow label="Açıklama" value={selected.description ?? '—'} />
                  <DetailRow label="CTA" value={selected.ctaLabel ?? '—'} />
                  <DetailRow
                    label="Fiyat"
                    value={
                      selected.priceTl
                        ? `${selected.priceTl.toLocaleString('tr-TR')} TL`
                        : MARKET_AD_PRICE_LABEL
                    }
                  />
                  {selected.marketItemId ? (
                    <DetailRow
                      label="Yayınlanan kart"
                      value={
                        <Link
                          href={`/market/${selected.marketItemId}`}
                          className="text-primary hover:underline"
                          target="_blank"
                        >
                          /market/{selected.marketItemId}
                        </Link>
                      }
                    />
                  ) : (
                    <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      Ödeme sonrası otomatik yayınlanmayan kayıtlar için{' '}
                      <Link
                        href={ADMIN_ROUTES.market}
                        className="font-medium text-primary hover:underline"
                      >
                        MARKET yönetimi
                      </Link>
                      ’nden kart oluşturun.
                    </p>
                  )}
                  {selected.imageUrl ? (
                    <DetailRow
                      label="Görsel"
                      value={
                        <a
                          href={selected.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          Aç <ExternalLink className="h-3 w-3" />
                        </a>
                      }
                    />
                  ) : null}
                  {selected.linkUrl ? (
                    <DetailRow
                      label="Link"
                      value={
                        <a
                          href={selected.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                        >
                          {selected.linkUrl} <ExternalLink className="h-3 w-3" />
                        </a>
                      }
                    />
                  ) : null}
                </>
              ) : (
                <>
                  <DetailRow label="İşbirliği türü" value={partnershipLabel(selected.partnershipType)} />
                  <DetailRow label="Mesaj / brief" value={selected.message ?? '—'} />
                </>
              )}

              <div className="space-y-1.5">
                <Label>Durum</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as AdInquiryStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_INQUIRY_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {AD_INQUIRY_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(
                    [
                      ['reviewing', 'İncelemede'],
                      ['accepted', 'Kabul'],
                      ['rejected', 'Red'],
                      ['closed', 'Kapat'],
                    ] as const
                  ).map(([value, label]) => (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-lg text-xs"
                      disabled={busy}
                      onClick={() => void saveDetail(value)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-note">Admin notu</Label>
                <Textarea
                  id="admin-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Görüşme özeti, teklif, sonraki adım…"
                />
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={busy || !selected}
              onClick={() => {
                if (selected) void removeInquiry(selected);
              }}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Sil
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Kapat
              </Button>
              <Button onClick={() => void saveDetail()} disabled={busy}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Kaydet
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm',
        accent && 'border-primary/30 bg-primary/[0.04]',
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 whitespace-pre-wrap text-foreground">{value}</div>
    </div>
  );
}
