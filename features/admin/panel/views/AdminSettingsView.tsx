'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import { PERMISSIONS } from '@/features/authorization/permission.constants';
import { useRbac } from '@/features/authorization/hooks/use-rbac';
import type { AdminSettingsView as SettingsView } from '@/features/admin/types/admin.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DIGITAL_AI_PUBLISH_CONFIG,
  FRANCHISE_PUBLISH_CONFIG,
  JOB_PUBLISH_CONFIG,
  PLACEMENT_PACKAGE_CONFIG,
  formatPlacementPriceTry,
} from '@/features/monetization/types/listing-placement.types';

const PRICING_ROWS = [
  {
    name: 'Standart yayın (1. ücretsiz)',
    price: 'Ücretsiz',
    note: 'Kategori başına 1 ilan · 30 gün',
  },
  {
    name: 'Ek ilan / yenileme',
    price: '99 TL',
    note: 'Aynı kategoride ek ilan veya süre dolunca · 30 gün',
  },
  {
    name: 'Vitrin dopingi',
    price: formatPlacementPriceTry(PLACEMENT_PACKAGE_CONFIG.vitrin.priceCents),
    note: '30 gün — tüm kategoriler',
  },
  {
    name: 'Acil Vitrin dopingi',
    price: formatPlacementPriceTry(PLACEMENT_PACKAGE_CONFIG.hizli_erisim.priceCents),
    note: '30 gün — tüm kategoriler',
  },
  {
    name: FRANCHISE_PUBLISH_CONFIG.name,
    price: formatPlacementPriceTry(FRANCHISE_PUBLISH_CONFIG.priceCents),
    note: '30 gün — süre sonunda yenileme',
  },
  {
    name: DIGITAL_AI_PUBLISH_CONFIG.name,
    price: formatPlacementPriceTry(DIGITAL_AI_PUBLISH_CONFIG.priceCents),
    note: '30 gün — süre sonunda yenileme',
  },
  {
    name: JOB_PUBLISH_CONFIG.name,
    price: formatPlacementPriceTry(JOB_PUBLISH_CONFIG.priceCents),
    note: 'İlan başına (işe alım)',
  },
] as const;

export function AdminSettingsView() {
  const { hasPermission } = useRbac();
  const canManageSettings = hasPermission(PERMISSIONS.SETTINGS_MANAGE);
  const [settings, setSettings] = useState<SettingsView | null>(null);
  const [freeListingLimit, setFreeListingLimit] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const next = await adminApi.getSettings();
        if (cancelled) return;
        setSettings(next);
        setFreeListingLimit(String(next.freeListingLimit ?? 0));
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'Ayarlar yüklenemedi');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    if (!canManageSettings) {
      toast.error('Bu işlem yalnızca süper yönetici tarafından yapılabilir.');
      return;
    }
    setSaving(true);
    try {
      const next = await adminApi.patchSettings({
        freeListingLimit: Number(freeListingLimit) || 0,
      });
      setSettings(next);
      toast.success('Ayarlar kaydedildi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPageShell
      title="Ayarlar"
      description="Platform kotası ve yayın ücretleri — site ihtiyaçlarına göre yapılandırılmış referans."
    >
      {loading ? (
        <AdminLoadingState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 dark:border-white/10">
            <h2 className="font-display text-lg font-semibold">Yayın kotası</h2>
            <div className="space-y-1.5">
              <Label htmlFor="free-listing-limit">Ücretsiz ilan limiti (kullanıcı başına)</Label>
              <Input
                id="free-listing-limit"
                type="number"
                min={0}
                value={freeListingLimit}
                onChange={(e) => setFreeListingLimit(e.target.value)}
                disabled={!canManageSettings}
              />
              <p className="text-xs text-muted-foreground">
                Yatırım / Ortak kategorilerinde kullanıcı başına 1 ücretsiz ilan (30 gün); ek ilan ve
                yenileme 99 TL. Franchise, Dijital & AI ve iş ilanları kendi paket ücretine tabidir.
                {!canManageSettings
                  ? ' Değiştirmek için süper yönetici yetkisi gerekir.'
                  : ''}
              </p>
            </div>
            {settings ? (
              <p className="text-xs text-muted-foreground">
                Son güncelleme: {settings.updatedAt ?? '—'}
              </p>
            ) : null}
            {canManageSettings ? (
              <Button type="button" disabled={saving} onClick={() => void handleSave()}>
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </Button>
            ) : null}
          </div>

          <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 dark:border-white/10">
            <h2 className="font-display text-lg font-semibold">Paket ücretleri</h2>
            <p className="text-xs text-muted-foreground">
              Canlı site formlarındaki fiyatlar. Gerçek iyzico tahsilatı sonraki aşamada bağlanacak;
              şu an ödeme simülasyonu çalışır.
            </p>
            <ul className="divide-y divide-border/60">
              {PRICING_ROWS.map((row) => (
                <li key={row.name} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.note}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums">{row.price}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
