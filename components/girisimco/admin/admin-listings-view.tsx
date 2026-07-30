'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getAdminService } from '@/lib/persistence/container';
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
  { value: 'all', label: 'Tümü' },
  { value: 'pending_review', label: 'İncelemede' },
  { value: 'published', label: 'Yayında' },
  { value: 'draft', label: 'Taslak' },
  { value: 'paused', label: 'Duraklatıldı' },
  { value: 'rejected', label: 'Reddedildi' },
  { value: 'archived', label: 'Arşiv' },
  { value: 'sold', label: 'Satıldı' },
  { value: 'expired', label: 'Süresi Doldu' },
];

export function AdminListingsView() {
  const service = useMemo(() => getAdminService(), []);
  const [items, setItems] = useState<Listing[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await service.searchListings({
        query: query.trim() || undefined,
        status: status === 'all' ? undefined : (status as ListingStatus),
      });
      setItems(result.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'İlanlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [service, query, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(
    id: ListingId,
    action: 'publish' | 'reject' | 'unpublish' | 'archive' | 'delete',
  ) {
    setBusyId(id);
    try {
      if (action === 'publish') await service.publishListing(id);
      else if (action === 'reject') {
        const reason = window.prompt('Red nedeni girin:');
        if (!reason?.trim()) return;
        await service.rejectListing(id, reason.trim());
      } else if (action === 'unpublish') await service.unpublishListing(id);
      else if (action === 'archive') await service.archiveListing(id);
      else if (action === 'delete') {
        if (!window.confirm('İlanı silmek istediğinize emin misiniz?')) return;
        await service.deleteListing(id);
      }
      toast.success('İşlem tamamlandı');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="İlan başlığı ara…"
          className="max-w-xs rounded-lg"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="rounded-lg" onClick={() => void load()}>
          Ara
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
          <p className="text-sm text-muted-foreground">İlan bulunamadı.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">İlan</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Görüntülenme</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tarih</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((listing) => (
                <tr key={listing.id} className="border-b border-border/80 last:border-0 dark:border-white/10">
                  <td className="px-4 py-3">
                    <Link href={`/ilan/${listing.slug}`} className="font-medium text-foreground hover:underline dark:text-white">
                      {listing.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{getListingStatusLabel(listing.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{listing.viewCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(listing.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      {listing.status === 'pending_review' && (
                        <>
                          <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" disabled={busyId === listing.id} onClick={() => void runAction(listing.id, 'publish')}>
                            Onayla
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs text-destructive" disabled={busyId === listing.id} onClick={() => void runAction(listing.id, 'reject')}>
                            Reddet
                          </Button>
                        </>
                      )}
                      {listing.status !== 'published' && listing.status !== 'pending_review' && (
                        <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" disabled={busyId === listing.id} onClick={() => void runAction(listing.id, 'publish')}>
                          Yayınla
                        </Button>
                      )}
                      {listing.status === 'published' && (
                        <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" disabled={busyId === listing.id} onClick={() => void runAction(listing.id, 'unpublish')}>
                          Yayından Kaldır
                        </Button>
                      )}
                      {listing.status !== 'archived' && (
                        <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" disabled={busyId === listing.id} onClick={() => void runAction(listing.id, 'archive')}>
                          Arşivle
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" className="h-8 rounded-lg text-xs" disabled={busyId === listing.id} onClick={() => void runAction(listing.id, 'delete')}>
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
