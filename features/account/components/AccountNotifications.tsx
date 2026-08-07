'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountNotificationCard } from '@/features/account/components/AccountNotificationCard';
import { AccountNotificationsEmpty } from '@/features/account/components/AccountNotificationsEmpty';
import { AccountNotificationsFilter } from '@/features/account/components/AccountNotificationsFilter';
import {
  countNotificationsByTab,
  filterAccountNotifications,
} from '@/features/account/lib/filter-account-notifications';
import { ACCOUNT_NOTIFICATIONS_TABS } from '@/features/account/types/account-notifications.constants';
import type { AccountNotificationsPageLoadResult } from '@/features/account/types/account-notifications-page.types';
import type {
  AccountNotificationCardData,
  AccountNotificationsFilterState,
  AccountNotificationsTab,
} from '@/features/account/types/account-notifications.types';
import { markLocalFavoriteNotificationRead, readLocalFavoriteNotifications } from '@/features/favorites/lib/favorite-ux-feedback';
import {
  markLocalMessageNotificationRead,
  readLocalMessageNotifications,
} from '@/features/messaging/lib/messaging-ux-feedback';
import { useRealtimeNotifications } from '@/features/notifications/hooks/use-realtime-notifications';
import {
  getInboxNotificationService,
  getNotificationService,
} from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import { cn } from '@/lib/utils';

const DEFAULT_FILTERS: AccountNotificationsFilterState = {
  query: '',
  dateRange: 'all',
  sort: 'unread_first',
};

const LOCAL_FAV_KEY = 'GirisimBee.favorite-ux-notifications';
const LOCAL_MSG_KEY = 'GirisimBee.message-ux-notifications';

function isLocalNotification(id: string) {
  return id.startsWith('local-fav-') || id.startsWith('local-msg-');
}

function readAllLocalNotifications(): AccountNotificationCardData[] {
  return [...readLocalFavoriteNotifications(), ...readLocalMessageNotifications()].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt),
  );
}

function mergeNotifications(
  serverItems: AccountNotificationCardData[],
  localItems: AccountNotificationCardData[],
): AccountNotificationCardData[] {
  const seen = new Set(serverItems.map((item) => item.id));
  const merged = [...serverItems];
  for (const item of localItems) {
    if (!seen.has(item.id)) merged.push(item);
  }
  return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function AccountNotifications({
  userId,
  initial,
}: {
  userId: string;
  initial: AccountNotificationsPageLoadResult;
}) {
  const [loadError] = useState<string | null>(initial.ok ? null : initial.error);
  const [serverItems, setServerItems] = useState<AccountNotificationCardData[]>(
    initial.ok ? initial.data : [],
  );
  const [localItems, setLocalItems] = useState<AccountNotificationCardData[]>([]);
  const [tab, setTab] = useState<AccountNotificationsTab>('all');
  const [filters, setFilters] = useState<AccountNotificationsFilterState>(DEFAULT_FILTERS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const syncLocal = () => setLocalItems(readAllLocalNotifications());
    syncLocal();
    window.addEventListener('storage', syncLocal);
    window.addEventListener('GirisimBee:favorite-notification', syncLocal);
    window.addEventListener('GirisimBee:message-notification', syncLocal);
    return () => {
      window.removeEventListener('storage', syncLocal);
      window.removeEventListener('GirisimBee:favorite-notification', syncLocal);
      window.removeEventListener('GirisimBee:message-notification', syncLocal);
    };
  }, []);

  const handleRealtime = useCallback((item: AccountNotificationCardData) => {
    setServerItems((prev) => {
      if (prev.some((existing) => existing.id === item.id)) return prev;
      return [item, ...prev];
    });
  }, []);

  useRealtimeNotifications({
    userId,
    onNotification: handleRealtime,
  });

  const items = useMemo(
    () => mergeNotifications(serverItems, localItems),
    [serverItems, localItems],
  );

  const counts = useMemo(() => countNotificationsByTab(items), [items]);

  const visible = useMemo(
    () => filterAccountNotifications(items, tab, filters),
    [items, tab, filters],
  );

  const tabItems = useMemo(
    () => (tab === 'all' ? items : items.filter((item) => item.type === tab)),
    [items, tab],
  );

  const unreadCount = items.filter((item) => item.status === 'unread').length;

  async function markRead(item: AccountNotificationCardData) {
    if (busy) return;
    if (isLocalNotification(item.id)) {
      if (item.id.startsWith('local-fav-')) markLocalFavoriteNotificationRead(item.id);
      else markLocalMessageNotificationRead(item.id);
      setLocalItems(readAllLocalNotifications());
      return;
    }

    setBusy(true);
    try {
      if (item.source === 'marketplace') {
        await getNotificationService().markAsRead(
          ids.notification(item.id),
          ids.user(userId),
        );
      } else {
        try {
          await getInboxNotificationService().markAsRead(
            ids.notification(item.id),
            ids.user(userId),
          );
        } catch {
          await getNotificationService().markAsRead(
            ids.notification(item.id),
            ids.user(userId),
          );
        }
      }
      setServerItems((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, status: 'read' } : row)),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bildirim güncellenemedi.');
    } finally {
      setBusy(false);
    }
  }

  async function markAllRead() {
    if (busy || unreadCount === 0) return;
    setBusy(true);
    try {
      await Promise.allSettled([
        getInboxNotificationService().markAllAsRead(ids.user(userId)),
        getNotificationService().markAllAsRead(ids.user(userId)),
      ]);
      setServerItems((prev) => prev.map((item) => ({ ...item, status: 'read' })));
      for (const item of localItems) {
        if (item.status !== 'unread') continue;
        if (item.id.startsWith('local-fav-')) markLocalFavoriteNotificationRead(item.id);
        else if (item.id.startsWith('local-msg-')) markLocalMessageNotificationRead(item.id);
      }
      setLocalItems(readAllLocalNotifications());
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bildirimler güncellenemedi.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteOne(item: AccountNotificationCardData) {
    if (busy) return;
    if (isLocalNotification(item.id)) {
      setLocalItems((prev) => {
        const next = prev.filter((row) => row.id !== item.id);
        try {
          window.localStorage.setItem(
            LOCAL_FAV_KEY,
            JSON.stringify(next.filter((row) => row.id.startsWith('local-fav-'))),
          );
          window.localStorage.setItem(
            LOCAL_MSG_KEY,
            JSON.stringify(next.filter((row) => row.id.startsWith('local-msg-'))),
          );
        } catch {
          // ignore
        }
        return next;
      });
      toast.success('Bildirim silindi');
      return;
    }

    setBusy(true);
    try {
      if (item.source === 'marketplace') {
        await getNotificationService().delete(
          ids.notification(item.id),
          ids.user(userId),
        );
      } else {
        try {
          await getInboxNotificationService().deleteNotification(
            ids.notification(item.id),
            ids.user(userId),
          );
        } catch {
          await getNotificationService().delete(
            ids.notification(item.id),
            ids.user(userId),
          );
        }
      }
      setServerItems((prev) => prev.filter((row) => row.id !== item.id));
      toast.success('Bildirim silindi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bildirim silinemedi.');
    } finally {
      setBusy(false);
    }
  }

  async function clearAll() {
    if (busy || items.length === 0) return;
    setBusy(true);
    try {
      await getInboxNotificationService().clearNotifications(ids.user(userId));
      const marketplaceUnread = serverItems.filter((item) => item.source === 'marketplace');
      await Promise.allSettled(
        marketplaceUnread.map((item) =>
          getNotificationService().delete(ids.notification(item.id), ids.user(userId)),
        ),
      );
      setServerItems([]);
      setLocalItems([]);
      try {
        window.localStorage.removeItem(LOCAL_FAV_KEY);
        window.localStorage.removeItem(LOCAL_MSG_KEY);
      } catch {
        // ignore
      }
      toast.success('Tüm bildirimler temizlendi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bildirimler temizlenemedi.');
    } finally {
      setBusy(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-10 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Bildirimler yüklenemedi
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-5 rounded-2xl"
          onClick={() => window.location.reload()}
        >
          Yeniden dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0
            ? `${unreadCount} okunmamış bildirim`
            : `${visible.length} bildirim gösteriliyor`}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-2xl"
            disabled={unreadCount === 0 || busy}
            onClick={() => void markAllRead()}
          >
            Tümünü okundu olarak işaretle
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-2xl text-destructive hover:text-destructive"
            disabled={items.length === 0 || busy}
            onClick={() => void clearAll()}
          >
            Tümünü temizle
          </Button>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as AccountNotificationsTab);
          setFilters(DEFAULT_FILTERS);
        }}
      >
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted/40 p-1.5 dark:bg-white/[0.04]">
          {ACCOUNT_NOTIFICATIONS_TABS.map((item) => {
            const Icon = item.icon;
            const count = counts[item.id];
            return (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="gap-1.5 rounded-xl px-2.5 py-2 text-xs sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm data-[state=active]:shadow-sm"
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
                <span>{item.label}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums sm:text-[11px]',
                    count > 0
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {ACCOUNT_NOTIFICATIONS_TABS.map((item) => (
          <TabsContent key={item.id} value={item.id} className="mt-6 space-y-5">
            {tabItems.length > 0 ? (
              <AccountNotificationsFilter value={filters} onChange={setFilters} />
            ) : null}

            {tabItems.length === 0 ? (
              <AccountNotificationsEmpty />
            ) : visible.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 px-6 py-12 text-center text-sm text-muted-foreground dark:border-white/10">
                Bu filtrelerle eşleşen bildirim bulunamadı.
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {visible.map((notification) => (
                  <AccountNotificationCard
                    key={notification.id}
                    item={notification}
                    busy={busy}
                    onMarkRead={() => void markRead(notification)}
                    onDelete={() => void deleteOne(notification)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
