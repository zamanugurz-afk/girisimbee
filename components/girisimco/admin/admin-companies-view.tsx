'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Building2, CheckCircle2, ExternalLink, LayoutDashboard, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

interface AdminCompanyItem {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  city: string | null;
  industry: string | null;
  isVerified: boolean;
  status: string;
  createdAt: string;
}

export function AdminCompaniesView() {
  const [items, setItems] = useState<AdminCompanyItem[]>([]);
  const [query, setQuery] = useState('');
  const [isVerifiedFilter, setIsVerifiedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (query.trim()) sp.set('query', query.trim());
      if (isVerifiedFilter !== 'all') sp.set('isVerified', isVerifiedFilter);
      if (statusFilter !== 'all') sp.set('status', statusFilter);

      const res = await fetch(`/api/admin/companies?${sp.toString()}`);
      if (!res.ok) {
        throw new Error('Şirketler listesi alınamadı');
      }
      const json = (await res.json()) as { data?: { items?: AdminCompanyItem[] } };
      setItems(json.data?.items ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Şirketler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [query, isVerifiedFilter, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCompanyAction(
    id: string,
    action: 'verify' | 'unverify' | 'suspend' | 'activate' | 'delete',
  ) {
    setBusyId(id);
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'İşlem gerçekleştirilemedi');

      toast.success(
        action === 'verify'
          ? 'Şirket doğrulandı'
          : action === 'unverify'
            ? 'Şirket doğrulaması kaldırıldı'
            : action === 'suspend'
              ? 'Şirket askıya alındı'
              : action === 'activate'
                ? 'Şirket aktifleştirildi'
                : 'Şirket silindi',
      );
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
          placeholder="Şirket adı, sektör veya şehir ara…"
          className="max-w-xs rounded-lg"
          onKeyDown={(e) => {
            if (e.key === 'Enter') void load();
          }}
        />
        <Select value={isVerifiedFilter} onValueChange={setIsVerifiedFilter}>
          <SelectTrigger className="w-44 rounded-lg">
            <SelectValue placeholder="Doğrulama Durumu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Doğrulamalar</SelectItem>
            <SelectItem value="true">Doğrulanmış</SelectItem>
            <SelectItem value="false">Doğrulanmamış</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 rounded-lg">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="suspended">Askıda</SelectItem>
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
          <Building2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Kayıtlı şirket profili bulunamadı.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[840px] text-sm">
            <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Şirket / Girişim</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sektör & Konum</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Doğrulama</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kayıt Tarihi</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((company) => (
                <tr key={company.id} className="border-b border-border/80 last:border-0 dark:border-white/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-muted/50 font-bold text-foreground">
                        {company.logoUrl ? (
                          <Image
                            src={company.logoUrl}
                            alt={company.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{company.name}</p>
                        <p className="text-xs text-muted-foreground">@{company.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{company.industry || '—'}</p>
                    <p className="text-xs text-muted-foreground">{company.city || 'Belirtilmedi'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                      {company.status === 'active' ? 'Aktif' : company.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {company.isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Doğrulanmış
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Doğrulanmamış
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(company.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {company.isVerified ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-amber-600 hover:text-amber-700"
                          disabled={busyId === company.id}
                          onClick={() => void handleCompanyAction(company.id, 'unverify')}
                        >
                          Onayı Kaldır
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-emerald-600 hover:text-emerald-700"
                          disabled={busyId === company.id}
                          onClick={() => void handleCompanyAction(company.id, 'verify')}
                        >
                          <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Doğrula
                        </Button>
                      )}

                      <Link
                        href={`/company/${company.slug}`}
                        target="_blank"
                        className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" /> Profil
                      </Link>

                      <Link
                        href={`/company/${company.slug}/dashboard`}
                        target="_blank"
                        className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <LayoutDashboard className="mr-1 h-3.5 w-3.5" /> Panel
                      </Link>

                      {company.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-destructive"
                          disabled={busyId === company.id}
                          onClick={() => void handleCompanyAction(company.id, 'suspend')}
                        >
                          Askıya Al
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-emerald-600"
                          disabled={busyId === company.id}
                          onClick={() => void handleCompanyAction(company.id, 'activate')}
                        >
                          Aktifleştir
                        </Button>
                      )}
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
