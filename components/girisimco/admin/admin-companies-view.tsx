'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getAdminService } from '@/lib/persistence/container';
import type { Company } from '@/features/companies/types/company.types';
import type { CompanyId } from '@/lib/domain/ids';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export function AdminCompaniesView() {
  const service = useMemo(() => getAdminService(), []);
  const [items, setItems] = useState<Company[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await service.searchCompanies({ query: query.trim() || undefined });
      setItems(result.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Şirketler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [service, query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(id: CompanyId, action: 'verify' | 'unverify' | 'suspend' | 'delete') {
    setBusyId(id);
    try {
      if (action === 'verify') await service.verifyCompany(id);
      else if (action === 'unverify') await service.unverifyCompany(id);
      else if (action === 'suspend') await service.suspendCompany(id);
      else if (action === 'delete') {
        if (!window.confirm('Şirketi silmek istediğinize emin misiniz?')) return;
        await service.deleteCompany(id);
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
          placeholder="Şirket adı veya slug ara…"
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
          <p className="text-sm text-muted-foreground">Şirket bulunamadı.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Şirket</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Doğrulama</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kayıt</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((company) => (
                <tr key={company.id} className="border-b border-border/80 last:border-0 dark:border-white/10">
                  <td className="px-4 py-3">
                    <Link href={`/company/${company.slug}`} className="font-medium text-foreground hover:underline dark:text-white">
                      {company.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">@{company.slug}</p>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline">{company.status}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant={company.isVerified ? 'default' : 'secondary'}>
                      {company.isVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(company.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      {!company.isVerified ? (
                        <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" disabled={busyId === company.id} onClick={() => void runAction(company.id, 'verify')}>
                          Doğrula
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" disabled={busyId === company.id} onClick={() => void runAction(company.id, 'unverify')}>
                          Doğrulamayı Kaldır
                        </Button>
                      )}
                      {company.status !== 'suspended' && (
                        <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" disabled={busyId === company.id} onClick={() => void runAction(company.id, 'suspend')}>
                          Askıya Al
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" className="h-8 rounded-lg text-xs" disabled={busyId === company.id} onClick={() => void runAction(company.id, 'delete')}>
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
