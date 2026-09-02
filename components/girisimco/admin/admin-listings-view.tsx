'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ExternalLink, Flame, Sparkles, Star, Zap } from 'lucide-react';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import type { Listing, ListingStatus } from '@/features/listings/types/listing.entity.types';
import type { ListingId } from '@/lib/domain/ids';
import { getListingStatusLabel } from '@/features/listings/utils/listing-status-labels';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: 'pending_review', label: 'İncelemede' },
  { value: 'published', label: 'Yayında' },
  { value: 'draft', label: 'Taslak' },
  { value: 'paused', label: 'Duraklatıldı' },
  { value: 'rejected', label: 'Reddedildi' },
  { value: 'archived', label: 'Arşiv' },
  { value: 'sold', label: 'Satıldı' },
  { value: 'expired', label: 'Süresi Doldu' },
];

const MODULE_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tüm Kategoriler' },
  { value: 'entrepreneurs', label: 'Girişimci (Yatırım Arıyorum)' },
  { value: 'investors', label: 'Yatırımcı (Yatırım Yapıyorum)' },
  { value: 'candidates', label: 'İş Arayan (Kariyer)' },
  { value: 'employers', label: 'İşveren (İlan Ver)' },
  { value: 'founders', label: 'Kurucu Ortak (Founders)' },
  { value: 'franchise', label: 'Bayilik / Franchise' },
];

export function AdminListingsView() {
  const [items, setItems] = useState<Listing[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [urgentFilter, setUrgentFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.searchListings({
        query: query.trim() || undefined,
        status: status === 'all' ? undefined : (status as ListingStatus),
        moduleKey: moduleFilter === 'all' ? undefined : (moduleFilter as any),
        isUrgent: urgentFilter === 'all' ? undefined : urgentFilter === 'true',
        isFeatured: featuredFilter === 'all' ? undefined : featuredFilter === 'true',
      });
      setItems(result.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'İlanlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [query, status, moduleFilter, urgentFilter, featuredFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(
    id: ListingId,
    action:
      | 'publish'
      | 'reject'
      | 'unpublish'
      | 'archive'
      | 'delete'
      | 'mark_urgent'
      | 'remove_urgent'
      | 'feature'
      | 'unfeature',
  ) {
    setBusyId(id);
    try {
      if (action === 'publish') await adminApi.patchListing(id, { action: 'approve' });
      else if (action === 'reject') {
        const reason = window.prompt('Red nedeni girin:');
        if (!reason?.trim()) return;
        await adminApi.patchListing(id, { action: 'reject', reason: reason.trim() });
      } else if (action === 'unpublish') await adminApi.patchListing(id, { action: 'unpublish' });
      else if (action === 'archive') await adminApi.patchListing(id, { action: 'archive' });
      else if (action === 'mark_urgent') await adminApi.patchListing(id, { action: 'mark_urgent' });
      else if (action === 'remove_urgent') await adminApi.patchListing(id, { action: 'remove_urgent' });
      else if (action === 'feature') await adminApi.patchListing(id, { action: 'feature' });
      else if (action === 'unfeature') await adminApi.patchListing(id, { action: 'unfeature' });
      else if (action === 'delete') {
        if (!window.confirm('İlanı silmek istediğinize emin misiniz?')) return;
        await adminApi.patchListing(id, { action: 'delete' });
      }
      toast.success('İşlem başarıyla tamamlandı');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="İlan başlığı ara…"
          className="max-w-xs rounded-lg"
          onKeyDown={(e) => {
            if (e.key === 'Enter') void load();
          }}
        />

        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-48 rounded-lg">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            {MODULE_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={urgentFilter} onValueChange={setUrgentFilter}>
          <SelectTrigger className="w-36 rounded-lg">
            <SelectValue placeholder="Süper İlan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm İlanlar</SelectItem>
            <SelectItem value="true">⚡ Sadece Süper</SelectItem>
            <SelectItem value="false">Standart</SelectItem>
          </SelectContent>
        </Select>

        <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
          <SelectTrigger className="w-36 rounded-lg">
            <SelectValue placeholder="Vitrin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Vitrin</SelectItem>
            <SelectItem value="true">⭐ Sadece Vitrin</SelectItem>
            <SelectItem value="false">Normal</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="rounded-lg" onClick={() => void load()}>
          Filtrele
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Yükleniyor…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
          <p className="text-sm text-muted-foreground">İlan bulunamadı.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">İlan & Kategori</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Özellikler</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Görüntülenme</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tarih</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((listing) => (
                <tr key={listing.id} className="border-b border-border/80 last:border-0 dark:border-white/10">
                  <td className="px-4 py-3">
                    <Link
                      href={`/ilan/${listing.slug}`}
                      target="_blank"
                      className="font-medium text-foreground hover:underline dark:text-white"
                    >
                      {listing.title}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {listing.city && <span>📍 {listing.city}</span>}
                      {listing.moduleKey && (
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                          {listing.moduleKey}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{getListingStatusLabel(listing.status)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {listing.isUrgent && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          <Zap className="h-3 w-3" /> Süper
                        </span>
                      )}
                      {listing.isFeatured && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                          <Star className="h-3 w-3" /> Vitrin
                        </span>
                      )}
                      {!listing.isUrgent && !listing.isFeatured && (
                        <span className="text-xs text-muted-foreground">Standart</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{listing.viewCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(listing.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      {listing.isUrgent ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-amber-600"
                          disabled={busyId === listing.id}
                          onClick={() => void runAction(listing.id, 'remove_urgent')}
                        >
                          Süper Kaldır
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-amber-600 hover:text-amber-700"
                          disabled={busyId === listing.id}
                          onClick={() => void runAction(listing.id, 'mark_urgent')}
                        >
                          <Zap className="mr-0.5 h-3 w-3" /> Süper Yap
                        </Button>
                      )}

                      {listing.isFeatured ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-purple-600"
                          disabled={busyId === listing.id}
                          onClick={() => void runAction(listing.id, 'unfeature')}
                        >
                          Vitrin Kaldır
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-purple-600 hover:text-purple-700"
                          disabled={busyId === listing.id}
                          onClick={() => void runAction(listing.id, 'feature')}
                        >
                          <Star className="mr-0.5 h-3 w-3" /> Vitrin Yap
                        </Button>
                      )}

                      {listing.status === 'pending_review' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-emerald-600"
                            disabled={busyId === listing.id}
                            onClick={() => void runAction(listing.id, 'publish')}
                          >
                            Onayla
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-destructive"
                            disabled={busyId === listing.id}
                            onClick={() => void runAction(listing.id, 'reject')}
                          >
                            Reddet
                          </Button>
                        </>
                      )}
                      {listing.status !== 'published' && listing.status !== 'pending_review' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          disabled={busyId === listing.id}
                          onClick={() => void runAction(listing.id, 'publish')}
                        >
                          Yayınla
                        </Button>
                      )}
                      {listing.status === 'published' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          disabled={busyId === listing.id}
                          onClick={() => void runAction(listing.id, 'unpublish')}
                        >
                          Kaldır
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        disabled={busyId === listing.id}
                        onClick={() => void runAction(listing.id, 'delete')}
                      >
                        Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
