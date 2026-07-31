'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import type { AdminProfileView } from '@/features/admin/types/admin.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export function AdminCompaniesView() {
  const [items, setItems] = useState<AdminProfileView[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.searchProfiles({ query: query.trim() || undefined });
      setItems(result.data.filter(({ profile }) => profile.companyName || profile.companyId));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Profiller yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Şirket adı veya profil ara…"
          className="max-w-xs rounded-lg"
        />
        <Button variant="outline" size="sm" className="rounded-lg" onClick={() => void load()}>
          Ara
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
          <p className="text-sm text-muted-foreground">Şirket profili bulunamadı.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Şirket</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Profil</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Doğrulama</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kayıt</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ profile, modules }) => (
                <tr key={profile.id} className="border-b border-border/80 last:border-0 dark:border-white/10">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{profile.companyName ?? profile.displayName}</p>
                    {profile.companyId && (
                      <p className="text-xs text-muted-foreground">{profile.companyId}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {profile.username ? (
                      <Link
                        href={`/profil/${profile.username}`}
                        className="text-foreground hover:underline dark:text-white"
                      >
                        @{profile.username}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                    {modules.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {modules.map((m) => m.moduleKey).join(', ')}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline">{profile.status}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant={profile.isVerified ? 'default' : 'secondary'}>
                      {profile.isVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(profile.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
