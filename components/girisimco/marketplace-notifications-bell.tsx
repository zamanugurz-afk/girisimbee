'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { getClientContainer } from '@/lib/persistence/container';
import { ids, type NotificationId, type UserId } from '@/lib/domain/ids';
import type { Notification } from '@/features/notifications/types/notification.types';
import {
  formatPendingPaymentLabel,
  listOpenPendingPackagePayments,
  type PendingPackagePayment,
} from '@/features/monetization/lib/pending-package-payments';
import { formatPlacementPriceTry } from '@/features/monetization/types/listing-placement.types';
import { cn } from '@/lib/utils';

const iconBtnClass =
  'flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-white/80 text-[#334155] shadow-sm transition-all duration-300 ease-smooth hover:scale-[1.04] hover:border-primary/20 hover:bg-white hover:text-[#0F172A] hover:shadow-md';

function timeLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function statusLabel(status: PendingPackagePayment['status']): string {
  switch (status) {
    case 'pending':
      return 'Bekliyor';
    case 'processing':
      return 'İşleniyor';
    case 'succeeded':
      return 'Tamamlandı';
    case 'failed':
      return 'Başarısız';
    default:
      return status;
  }
}

export function MarketplaceNotificationsBell({ className }: { className?: string }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openPayments, setOpenPayments] = useState<PendingPackagePayment[]>([]);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setOpenPayments([]);
      return;
    }

    setOpenPayments(listOpenPendingPackagePayments(user.id));

    setLoading(true);
    try {
      const { notificationService } = getClientContainer();
      const result = await notificationService.list(ids.user(user.id) as UserId, undefined, {
        page: 1,
        limit: 20,
      });
      setNotifications(result.data.filter((n) => n.status !== 'deleted'));
    } catch (err) {
      console.warn('[MarketplaceNotificationsBell] list failed', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Defer network work until the popover opens — keeps nav clicks snappy.
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setOpenPayments([]);
      return;
    }
    setOpenPayments(listOpenPendingPackagePayments(user.id));
  }, [user?.id]);

  useEffect(() => {
    const onPaymentsChanged = () => {
      if (!user?.id) return;
      setOpenPayments(listOpenPendingPackagePayments(user.id));
    };
    window.addEventListener('girisimco:pending-payments-changed', onPaymentsChanged);
    return () => window.removeEventListener('girisimco:pending-payments-changed', onPaymentsChanged);
  }, [user?.id]);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const recent = notifications.slice(0, 8);
  const unreadCount =
    notifications.filter((n) => n.status !== 'read').length + openPayments.length;

  async function markAllRead() {
    if (!user?.id) return;
    try {
      const { notificationService } = getClientContainer();
      await notificationService.markAllAsRead(ids.user(user.id) as UserId);
      await refresh();
    } catch (err) {
      console.warn('[MarketplaceNotificationsBell] markAllRead failed', err);
    }
  }

  async function markOneRead(id: string) {
    if (!user?.id) return;
    try {
      const { notificationService } = getClientContainer();
      await notificationService.markAsRead(id as NotificationId, ids.user(user.id) as UserId);
      await refresh();
    } catch (err) {
      console.warn('[MarketplaceNotificationsBell] markAsRead failed', err);
    }
  }

  if (authLoading) {
    return (
      <button type="button" className={cn(iconBtnClass, className)} aria-label="Bildirimler" disabled>
        <Bell className="h-4 w-4" />
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={`${AUTH_ROUTES.login}?redirect=/dashboard/bildirimlerim`}
        className={cn(iconBtnClass, className)}
        aria-label="Bildirimler — giriş yapın"
      >
        <Bell className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(iconBtnClass, 'relative', className)} aria-label="Bildirimler">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] rounded-xl border-border p-0 shadow-lg sm:w-96">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Bildirimler</p>
          {notifications.some((n) => n.status !== 'read') && (
            <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => void markAllRead()}>
              <CheckCheck className="h-3.5 w-3.5" />
              Tümünü oku
            </Button>
          )}
        </div>

        <div className="max-h-[24rem] overflow-y-auto">
          {openPayments.length > 0 ? (
            <section className="border-b border-border/60 px-4 py-3">
              <div className="mb-2 flex items-center gap-1.5 text-primary">
                <CreditCard className="h-3.5 w-3.5" />
                <p className="text-gc-xs font-semibold uppercase tracking-wide">Bekleyen ödemeler</p>
              </div>
              <ul className="space-y-2">
                {openPayments.map((payment) => (
                  <li key={payment.id}>
                    <Link
                      href={`/ilan/${payment.listingId}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg border border-primary/20 bg-primary/[0.05] px-3 py-2 transition-colors hover:bg-primary/[0.09]"
                    >
                      <p className="text-gc-sm font-medium text-foreground">
                        {formatPendingPaymentLabel(payment)}
                      </p>
                      <p className="mt-0.5 text-gc-xs text-muted-foreground">
                        {formatPlacementPriceTry(payment.amountCents)} · {statusLabel(payment.status)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="px-4 py-3">
            <p className="mb-2 text-gc-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Son bildirimler
            </p>
            {loading ? (
              <div className="flex items-center gap-2 py-2 text-gc-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Yükleniyor…
              </div>
            ) : recent.length === 0 ? (
              <p className="text-gc-xs text-muted-foreground">Henüz bildiriminiz yok.</p>
            ) : (
              <ul className="space-y-1.5">
                {recent.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/50',
                        n.status !== 'read' && 'bg-primary/[0.04]',
                      )}
                      onClick={() => {
                        void markOneRead(n.id);
                        setOpen(false);
                        if (n.actionUrl) {
                          router.push(n.actionUrl);
                        } else {
                          router.push('/dashboard/bildirimlerim');
                        }
                      }}
                    >
                      <p className="text-gc-sm font-medium text-foreground">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-gc-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{timeLabel(n.createdAt)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="border-t border-border/70 px-4 py-2.5">
          <Link
            href="/dashboard/bildirimlerim"
            onClick={() => setOpen(false)}
            className="block text-center text-xs font-medium text-primary hover:underline"
          >
            Tüm bildirimleri gör
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
