'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Download, Loader2, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { ADMIN_ROUTES } from '@/features/admin/panel/constants/admin-nav.constants';

type KvkkRecord = {
  id: string;
  userId: string;
  profileId: string;
  listingId: string | null;
  source: string;
  consentVersion: string;
  allAccepted: boolean;
  consentedAt: string;
  consents: Record<string, boolean>;
};

type Pagination = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export function AdminKvkkConsentsView() {
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<KvkkRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listingId, setListingId] = useState(() => searchParams.get('listingId') ?? '');
  const [userId, setUserId] = useState(() => searchParams.get('userId') ?? '');
  const [profileId, setProfileId] = useState(() => searchParams.get('profileId') ?? '');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '50', page: '1' });
      if (listingId.trim()) params.set('listingId', listingId.trim());
      if (userId.trim()) params.set('userId', userId.trim());
      if (profileId.trim()) params.set('profileId', profileId.trim());

      const res = await fetch(`/api/admin/kvkk-consents?${params}`);
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        data?: { records?: KvkkRecord[]; pagination?: Pagination };
      };
      if (!res.ok) throw new Error(json.error ?? 'Yüklenemedi');
      setRecords(json.data?.records ?? []);
      setPagination(json.data?.pagination ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [listingId, userId, profileId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function downloadEvidence(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/kvkk-consents/${id}/evidence`);
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        data?: { evidence?: unknown; record?: unknown };
      };
      if (!res.ok) throw new Error(json.error ?? 'Kanıt alınamadı');
      const blob = new Blob([JSON.stringify(json.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kvkk-evidence-${id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Kanıt dosyası indirildi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kanıt alınamadı');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminPageShell
      title="KVKK İzin Kayıtları"
      description="İlan yayın ve aday KVKK rıza kayıtları — audit / kanıt indirme."
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={ADMIN_ROUTES.consentProcedures}>İzin saklama prosedürleri</Link>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Yenile
          </Button>
        </div>
      }
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <Input
          placeholder="listingId (UUID)"
          value={listingId}
          onChange={(e) => setListingId(e.target.value)}
          className="font-mono text-xs"
        />
        <Input
          placeholder="userId (UUID)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="font-mono text-xs"
        />
        <Input
          placeholder="profileId (UUID)"
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
          className="font-mono text-xs"
        />
      </div>
      <div className="mb-4">
        <Button type="button" size="sm" onClick={() => void load()}>
          <Search className="mr-1.5 h-3.5 w-3.5" />
          Filtrele
        </Button>
        {pagination.total != null ? (
          <span className="ml-3 text-sm text-muted-foreground">{pagination.total} kayıt</span>
        ) : null}
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
        </p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : records.length === 0 ? (
        <p className="text-sm text-muted-foreground">Kayıt bulunamadı.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/80 dark:border-white/10">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Kaynak</th>
                <th className="px-3 py-2">Sürüm</th>
                <th className="px-3 py-2">İlan</th>
                <th className="px-3 py-2">Kullanıcı</th>
                <th className="px-3 py-2">Onaylar</th>
                <th className="px-3 py-2">Tarih</th>
                <th className="px-3 py-2">Kanıt</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t border-border/60 dark:border-white/10">
                  <td className="px-3 py-2 font-medium">{r.source}</td>
                  <td className="px-3 py-2 font-mono">{r.consentVersion}</td>
                  <td className="px-3 py-2 font-mono">
                    {r.listingId ? (
                      <Link href={`/ilan/${r.listingId}`} className="text-primary underline">
                        {r.listingId.slice(0, 8)}…
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono">{r.userId.slice(0, 8)}…</td>
                  <td className="max-w-[220px] truncate px-3 py-2">
                    {Object.entries(r.consents ?? {})
                      .filter(([, v]) => v)
                      .map(([k]) => k)
                      .join(', ') || '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {new Date(r.consentedAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === r.id}
                      onClick={() => void downloadEvidence(r.id)}
                    >
                      {busyId === r.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageShell>
  );
}
