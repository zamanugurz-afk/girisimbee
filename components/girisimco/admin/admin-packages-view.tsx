'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import { PERMISSIONS } from '@/features/authorization/permission.constants';
import { useRbac } from '@/features/authorization/hooks/use-rbac';
import type { AdminCouponView, AdminPackageCatalogView } from '@/features/admin/types/admin.types';
import type { MarketplaceSettings } from '@/features/monetization/types/listing-package.types';
import type { MarketplacePayment } from '@/features/monetization/types/payment.types';
import type { ModuleKey } from '@/lib/domain/modules';
import { MODULE_KEYS } from '@/lib/domain/modules';
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

const MODULE_LABELS: Record<ModuleKey, string> = {
  franchise: 'Franchise İlanları',
  employers: 'İşveren',
  candidates: 'Aday',
  entrepreneurs: 'Girişimci',
  investors: 'Yatırımcı',
  founders: 'Kurucu',
};

export function AdminPackagesView() {
  const { hasPermission } = useRbac();
  const canGrantBoost = hasPermission(PERMISSIONS.LISTINGS_GRANT_BOOST);
  const canManageSettings = hasPermission(PERMISSIONS.SETTINGS_MANAGE);
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null);
  const [catalogs, setCatalogs] = useState<AdminPackageCatalogView[]>([]);
  const [coupons, setCoupons] = useState<AdminCouponView[]>([]);
  const [payments, setPayments] = useState<MarketplacePayment[]>([]);
  const [limitInput, setLimitInput] = useState('');
  const [grantUserId, setGrantUserId] = useState('');
  const [grantPackage, setGrantPackage] = useState('');
  const [grantModule, setGrantModule] = useState<ModuleKey>('franchise');
  const [couponModule, setCouponModule] = useState<ModuleKey>('franchise');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsData, packagesData, paymentsData, couponsData] = await Promise.all([
        adminApi.getSettings(),
        adminApi.listPackages(),
        adminApi.listPayments({ status: 'succeeded' }, { page: 1, limit: 50 }),
        adminApi.listCoupons(couponModule),
      ]);
      setSettings(settingsData);
      setLimitInput(String(settingsData.freeListingLimit));
      setCatalogs('catalogs' in packagesData ? packagesData.catalogs : [packagesData.catalog]);
      setPayments(paymentsData.data);
      setCoupons(couponsData);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [couponModule]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveLimit() {
    if (!canManageSettings) {
      toast.error('Bu işlem yalnızca süper yönetici tarafından yapılabilir.');
      return;
    }
    const limit = Number(limitInput);
    if (!Number.isFinite(limit) || limit < 0) {
      toast.error('Geçerli bir limit girin');
      return;
    }
    setBusy(true);
    try {
      const updated = await adminApi.patchSettings({ freeListingLimit: limit });
      setSettings(updated);
      toast.success('Ücretsiz ilan limiti güncellendi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Güncelleme başarısız');
    } finally {
      setBusy(false);
    }
  }

  async function handleGrantPackage() {
    if (!canGrantBoost) {
      toast.error('Bu işlem yalnızca süper yönetici tarafından yapılabilir.');
      return;
    }
    if (!grantUserId.trim() || !grantPackage.trim()) {
      toast.error('Kullanıcı ID ve paket slug girin');
      return;
    }
    setBusy(true);
    try {
      await adminApi.activatePackage({
        moduleKey: grantModule,
        userId: grantUserId.trim(),
        packageSlug: grantPackage.trim(),
      });
      toast.success('Paket atandı');
      setGrantUserId('');
      setGrantPackage('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Paket atanamadı');
    } finally {
      setBusy(false);
    }
  }

  async function loadCouponsForModule(moduleKey: ModuleKey) {
    setCouponModule(moduleKey);
    try {
      setCoupons(await adminApi.listCoupons(moduleKey));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kuponlar yüklenemedi');
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
              <Button
                size="sm"
                className="rounded-lg"
                disabled={busy || !canManageSettings}
                onClick={() => void saveLimit()}
              >
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      </section>

      {canGrantBoost ? (
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
          <div className="space-y-2 sm:w-40">
            <Label>Modül</Label>
            <Select value={grantModule} onValueChange={(v) => setGrantModule(v as ModuleKey)}>
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODULE_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {MODULE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label>Paket Slug</Label>
            <Input
              value={grantPackage}
              onChange={(e) => setGrantPackage(e.target.value)}
              placeholder="premium_monthly"
              className="rounded-lg"
            />
          </div>
          <Button className="rounded-lg" disabled={busy} onClick={() => void handleGrantPackage()}>
            Paket Ver
          </Button>
        </div>
      </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Modül Katalogları</h2>
        {catalogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
            <p className="text-sm text-muted-foreground">Katalog bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {catalogs.map((entry) => (
              <div key={entry.moduleKey} className="rounded-xl border border-border/80 p-4 dark:border-white/10">
                <p className="font-medium text-foreground">{MODULE_LABELS[entry.moduleKey]}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {Array.isArray(entry.catalog) ? entry.catalog.length : 0} paket
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">Kuponlar</h2>
          <Select value={couponModule} onValueChange={(v) => void loadCouponsForModule(v as ModuleKey)}>
            <SelectTrigger className="w-40 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODULE_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {MODULE_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {coupons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
            <p className="text-sm text-muted-foreground">Kupon bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kod</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">İndirim</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bitiş</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.code} className="border-b border-border/80 last:border-0 dark:border-white/10">
                    <td className="px-4 py-3 font-mono text-xs">{coupon.code}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.discountPercent != null
                        ? `%${coupon.discountPercent}`
                        : coupon.discountCents != null
                          ? `${coupon.discountCents / 100} TL`
                          : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={coupon.active ? 'default' : 'secondary'}>
                        {coupon.active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Son Ödemeler</h2>
        {payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
            <p className="text-sm text-muted-foreground">Ödeme bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kullanıcı</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Paket</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tutar</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border/80 last:border-0 dark:border-white/10">
                    <td className="px-4 py-3 font-mono text-xs">{payment.userId}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{payment.packageSlug ?? payment.purpose}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(payment.amountCents / 100).toFixed(2)} {payment.currency}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.createdAt)}
                    </td>
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
