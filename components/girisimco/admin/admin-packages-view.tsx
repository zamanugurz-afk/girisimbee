'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getAdminService } from '@/lib/persistence/container';
import type { MarketplaceSettings, UserListingPackage, ListingPackageSlug } from '@/features/monetization/types/listing-package.types';
import { PACKAGE_LABELS } from '@/features/monetization/types/listing-package.types';
import type { UserId } from '@/lib/domain/ids';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const GRANTABLE: ListingPackageSlug[] = ['single_listing', 'monthly_unlimited', 'company_package'];

export function AdminPackagesView() {
  const service = useMemo(() => getAdminService(), []);
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null);
  const [packages, setPackages] = useState<UserListingPackage[]>([]);
  const [limitInput, setLimitInput] = useState('');
  const [grantUserId, setGrantUserId] = useState('');
  const [grantPackage, setGrantPackage] = useState<ListingPackageSlug>('single_listing');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        service.getMarketplaceSettings(),
        service.listActivePackages(),
      ]);
      setSettings(s);
      setLimitInput(String(s.freeListingLimit));
      setPackages(p);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveLimit() {
    const limit = Number(limitInput);
    if (!Number.isFinite(limit) || limit < 0) {
      toast.error('Geçerli bir limit girin');
      return;
    }
    setBusy(true);
    try {
      const updated = await service.updateFreeListingLimit(limit);
      setSettings(updated);
      toast.success('Ücretsiz ilan limiti güncellendi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Güncelleme başarısız');
    } finally {
      setBusy(false);
    }
  }

  async function handleGrantPackage() {
    if (!grantUserId.trim()) {
      toast.error('Kullanıcı ID girin');
      return;
    }
    setBusy(true);
    try {
      await service.grantUserPackage({
        userId: grantUserId.trim() as UserId,
        packageSlug: grantPackage,
        grantedBy: 'admin',
      });
      toast.success('Paket atandı');
      setGrantUserId('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Paket atanamadı');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;
  }

  const remainingFree = settings
    ? Math.max(0, settings.freeListingLimit - settings.currentPublishedCount)
    : 0;

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border/80 p-5 dark:border-white/10">
        <h2 className="text-sm font-semibold text-foreground">Global Ayarlar</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Yayınlanan ilan sayısı</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {settings?.currentPublishedCount ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Kalan ücretsiz hak</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{remainingFree}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="free-limit">Ücretsiz ilan limiti</Label>
            <div className="flex gap-2">
              <Input
                id="free-limit"
                type="number"
                min={0}
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                className="rounded-lg"
              />
              <Button size="sm" className="rounded-lg" disabled={busy} onClick={() => void saveLimit()}>
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border/80 p-5 dark:border-white/10">
        <h2 className="text-sm font-semibold text-foreground">Paket Ata</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label>Kullanıcı ID</Label>
            <Input
              value={grantUserId}
              onChange={(e) => setGrantUserId(e.target.value)}
              placeholder="00000000-0000-4000-8000-000000000000"
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2 sm:w-56">
            <Label>Paket</Label>
            <Select value={grantPackage} onValueChange={(v) => setGrantPackage(v as ListingPackageSlug)}>
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRANTABLE.map((slug) => (
                  <SelectItem key={slug} value={slug}>
                    {PACKAGE_LABELS[slug]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="rounded-lg" disabled={busy} onClick={() => void handleGrantPackage()}>
            Paket Ver
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Aktif Paketler</h2>
        {packages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
            <p className="text-sm text-muted-foreground">Aktif paket bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kullanıcı</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Paket</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kredi</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bitiş</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kaynak</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-border/80 last:border-0 dark:border-white/10">
                    <td className="px-4 py-3 font-mono text-xs">{pkg.userId}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{PACKAGE_LABELS[pkg.packageSlug]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {pkg.creditsRemaining ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {pkg.expiresAt ? formatDate(pkg.expiresAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{pkg.grantedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
