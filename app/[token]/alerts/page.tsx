'use client';

import { useState, useMemo } from 'react';
import { Bell, CheckCheck, Trash2, Sparkles, TrendingDown, ShieldAlert, RefreshCw, Zap, Plus, Pencil, BellRing } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { SectionCard } from '@/components/data-display/section-card';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { StaggerGroup, StaggerItem } from '@/components/feedback/motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useNotificationsQuery } from '@/lib/queries';
import { OWNER_ROUTE, PRODUCT_MODELS } from '@/config/site';
import { cn, timeAgo, formatTry } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { NotificationItem, AlarmDTO } from '@/types';

const KIND_META: Record<string, { icon: typeof Bell; tone: string; bg: string }> = {
  deal: { icon: Sparkles, tone: 'text-success', bg: 'bg-success-soft' },
  'price-drop': { icon: TrendingDown, tone: 'text-primary', bg: 'bg-primary-soft' },
  risk: { icon: ShieldAlert, tone: 'text-danger', bg: 'bg-danger-soft' },
  sync: { icon: Zap, tone: 'text-accent-foreground', bg: 'bg-accent' },
  system: { icon: Bell, tone: 'text-muted-foreground', bg: 'bg-secondary' },
};

export default function AlertsPage() {
  const { data, isLoading, isError, refetch } = useNotificationsQuery();
  const [items, setItems] = useState<NotificationItem[] | undefined>(undefined);
  const [alarms, setAlarms] = useState<AlarmDTO[]>([]);
  const [alarmDialogOpen, setAlarmDialogOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<AlarmDTO | null>(null);
  const [formProduct, setFormProduct] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);

  const notifications = items ?? data;
  const unread = notifications?.filter((n: NotificationItem) => !n.read).length ?? 0;

  const markAllRead = () => {
    setItems(notifications?.map((n: NotificationItem) => ({ ...n, read: true })));
    toast('Tüm bildirimler okundu olarak işaretlendi');
  };

  const dismiss = (id: string) => {
    setItems(notifications?.filter((n: NotificationItem) => n.id !== id));
    toast('Bildirim kaldırıldı');
  };

  const openCreateAlarm = () => {
    setEditingAlarm(null);
    setFormProduct(PRODUCT_MODELS[0]?.id ?? '');
    setFormPrice('');
    setFormEnabled(true);
    setAlarmDialogOpen(true);
  };

  const openEditAlarm = (alarm: AlarmDTO) => {
    setEditingAlarm(alarm);
    setFormProduct(alarm.product_id);
    setFormPrice(String(alarm.target_price));
    setFormEnabled(alarm.is_enabled);
    setAlarmDialogOpen(true);
  };

  const saveAlarm = () => {
    const price = parseInt(formPrice, 10);
    if (!formProduct || !price || price <= 0) {
      toast('Lütfen ürün ve hedef fiyat girin');
      return;
    }
    if (editingAlarm) {
      setAlarms((prev) => prev.map((a) => a.id === editingAlarm.id ? { ...a, product_id: formProduct, target_price: price, is_enabled: formEnabled, updated_at: new Date().toISOString() } : a));
      toast('Alarm güncellendi');
    } else {
      const newAlarm: AlarmDTO = {
        id: `alarm-${Date.now()}`,
        product_id: formProduct,
        target_price: price,
        is_enabled: formEnabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAlarms((prev) => [...prev, newAlarm]);
      toast('Alarm oluşturuldu');
    }
    setAlarmDialogOpen(false);
  };

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
    toast('Alarm silindi');
  };

  const toggleAlarm = (id: string) => {
    setAlarms((prev) => prev.map((a) => a.id === id ? { ...a, is_enabled: !a.is_enabled, updated_at: new Date().toISOString() } : a));
  };

  const productName = (productId: string) => PRODUCT_MODELS.find((p) => p.id === productId)?.name ?? 'Bilinmeyen';

  const enabledAlarms = alarms.filter((a) => a.is_enabled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        title="Alarmlar"
        description="Fiyat düşüşleri, yeni fırsatlar, risk işaretleri ve senkron olayları — hepsi tek bir gelen kutusunda."
        crumbs={[{ label: 'Panel', href: OWNER_ROUTE }, { label: 'Alarmlar' }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Yenile
            </Button>
            <Button size="sm" onClick={openCreateAlarm}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Alarm Oluştur
            </Button>
            {unread > 0 && (
              <Button size="sm" onClick={markAllRead}>
                <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                Tümünü okundu işaretle
              </Button>
            )}
          </>
        }
      />

      {/* Price Alarms Section */}
      <SectionCard
        title="Fiyat Alarmları"
        description={`${enabledAlarms} aktif · ${alarms.length} toplam`}
        icon={BellRing}
        noPadding
        bodyClassName="p-0"
      >
        {alarms.length === 0 ? (
          <EmptyState
            icon={BellRing}
            title="Fiyat alarmı yok"
            description="Bir ürünün fiyatı hedefinize düştüğünde anında haberdar olun."
            action={{ label: 'Alarm oluştur', onClick: openCreateAlarm }}
            className="border-0"
          />
        ) : (
          <div className="divide-y divide-border">
            {alarms.map((alarm) => (
              <div key={alarm.id} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/30">
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  alarm.is_enabled ? 'bg-warning-soft text-warning' : 'bg-secondary text-muted-foreground',
                )}>
                  <BellRing className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{productName(alarm.product_id)}</p>
                  <p className="text-xs text-muted-foreground">Hedef: {formatTry(alarm.target_price)}</p>
                </div>
                <Switch checked={alarm.is_enabled} onCheckedChange={() => toggleAlarm(alarm.id)} />
                <button
                  onClick={() => openEditAlarm(alarm)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Düzenle"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteAlarm(alarm.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-danger-soft hover:border-danger/30 hover:text-danger"
                  aria-label="Sil"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Notifications Section */}
      <SectionCard title="Bildirimler" description="Son olaylar ve güncellemeler" icon={Bell} noPadding bodyClassName="p-0">
        {isError ? (
          <div className="p-5">
            <ErrorState onRetry={refetch} />
          </div>
        ) : isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-muted/60" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted/60" />
                  <div className="h-3 w-72 animate-pulse rounded bg-muted/60" />
                </div>
              </div>
            ))}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Henüz alarm yok"
            description="Fiyatlar düştüğünde, fırsat çıktığında veya riskli ilanlar tespit edildiğinde burada bilgilendirileceksiniz."
            className="border-0"
          />
        ) : (
          <div className="divide-y divide-border">
            <StaggerGroup>
              <AnimatePresence>
                {notifications.map((n: NotificationItem) => {
                  const meta = KIND_META[n.kind] ?? KIND_META.system;
                  const Icon = meta.icon;
                  return (
                    <StaggerItem key={n.id}>
                      <motion.div
                        layout
                        className={cn(
                          'group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30',
                          !n.read && 'bg-primary-soft/20',
                        )}
                      >
                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', meta.bg)}>
                          <Icon className={cn('h-5 w-5', meta.tone)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{n.title}</p>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                          <p className="mt-1 text-xs text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => dismiss(n.id)}
                          className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-secondary hover:text-foreground group-hover:opacity-100"
                          aria-label="Kaldır"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </AnimatePresence>
            </StaggerGroup>
          </div>
        )}
      </SectionCard>

      {/* Alarm Dialog */}
      <Dialog open={alarmDialogOpen} onOpenChange={setAlarmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAlarm ? 'Alarmı Düzenle' : 'Yeni Fiyat Alarmı'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Ürün</Label>
              <Select value={formProduct} onValueChange={setFormProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Ürün seçin" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_MODELS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hedef Fiyat (TL)</Label>
              <Input
                type="number"
                placeholder="örn. 20000"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Aktif</Label>
              <Switch checked={formEnabled} onCheckedChange={setFormEnabled} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlarmDialogOpen(false)}>İptal</Button>
            <Button onClick={saveAlarm}>{editingAlarm ? 'Güncelle' : 'Oluştur'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {notifications && notifications.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {notifications.length} bildirim · {unread} okunmamış
        </p>
      )}
    </div>
  );
}
