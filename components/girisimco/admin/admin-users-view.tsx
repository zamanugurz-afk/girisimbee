'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getAdminService } from '@/lib/persistence/container';
import type { AdminUserView } from '@/features/admin/services/admin.service.interface';
import type { UserStatus } from '@/features/authentication/types/user.types';
import type { UserId } from '@/lib/domain/ids';
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
  { value: 'active', label: 'Aktif' },
  { value: 'suspended', label: 'Askıda' },
  { value: 'pending', label: 'Beklemede' },
  { value: 'deactivated', label: 'Devre Dışı' },
];

export function AdminUsersView() {
  const service = useMemo(() => getAdminService(), []);
  const [items, setItems] = useState<AdminUserView[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await service.searchUsers({
        query: query.trim() || undefined,
        status: status === 'all' ? undefined : (status as UserStatus),
      });
      setItems(result.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [service, query, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(id: UserId, action: 'suspend' | 'activate' | 'delete') {
    setBusyId(id);
    try {
      if (action === 'suspend') await service.suspendUser(id);
      else if (action === 'activate') await service.activateUser(id);
      else if (action === 'delete') {
        if (!window.confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) return;
        await service.deleteUser(id);
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
          placeholder="E-posta veya ad ara…"
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
          <p className="text-sm text-muted-foreground">Kullanıcı bulunamadı.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kullanıcı</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">E-posta</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kayıt</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ user, displayName, profile }) => (
                <tr key={user.id} className="border-b border-border/80 last:border-0 dark:border-white/10">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{displayName}</p>
                    {profile?.username && <p className="text-xs text-muted-foreground">@{profile.username}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{user.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {user.status !== 'suspended' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg text-xs"
                          disabled={busyId === user.id}
                          onClick={() => void runAction(user.id, 'suspend')}
                        >
                          Askıya Al
                        </Button>
                      )}
                      {user.status === 'suspended' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg text-xs"
                          disabled={busyId === user.id}
                          onClick={() => void runAction(user.id, 'activate')}
                        >
                          Aktifleştir
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 rounded-lg text-xs"
                        disabled={busyId === user.id}
                        onClick={() => void runAction(user.id, 'delete')}
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
