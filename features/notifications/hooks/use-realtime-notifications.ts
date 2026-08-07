'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { resolvePersistenceDriver } from '@/lib/persistence/types';
import type { AccountNotificationCardData } from '@/features/account/types/account-notifications.types';
import {
  mapDomainNotificationToAccountCard,
  mapInboxNotificationToAccountCard,
} from '@/features/account/lib/map-inbox-notification-to-card';
import type { InboxNotification } from '@/features/notifications/types/inbox-notification.types';
import type { Notification } from '@/features/notifications/types/notification.types';
import type { NotificationId, UserId } from '@/lib/domain/ids';
import { toast } from 'sonner';

/**
 * Client-only realtime subscription for notification tables.
 * Presentation layer — does not change notification APIs.
 */
export function useRealtimeNotifications(input: {
  userId: string | undefined;
  enabled?: boolean;
  onNotification: (item: AccountNotificationCardData) => void;
}) {
  const { userId, enabled = true, onNotification } = input;

  useEffect(() => {
    if (!enabled || !userId || resolvePersistenceDriver() !== 'supabase') return;

    const supabase = createClient();
    const channel = supabase
      .channel(`account-notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const inbox: InboxNotification = {
            id: row.id as NotificationId,
            userId: row.user_id as UserId,
            title: String(row.title ?? 'Yeni bildirim'),
            description: String(row.description ?? row.body ?? ''),
            type: String(row.type ?? 'system'),
            isRead: Boolean(row.is_read),
            createdAt: String(row.created_at ?? new Date().toISOString()),
          };
          const card = mapInboxNotificationToAccountCard(inbox);
          onNotification(card);
          toast.message(card.title, {
            description: card.description,
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketplace_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const notification = {
            id: row.id as NotificationId,
            userId: row.user_id as UserId,
            type: row.type as Notification['type'],
            status: (row.status as Notification['status']) ?? 'delivered',
            title: String(row.title ?? 'Yeni bildirim'),
            body: String(row.body ?? ''),
            actionUrl: (row.action_url as string | null) ?? null,
            entityType: (row.entity_type as Notification['entityType']) ?? null,
            entityId: (row.entity_id as string | null) ?? null,
            readAt: (row.read_at as string | null) ?? null,
            deliveredAt: (row.delivered_at as string | null) ?? null,
            metadata: (row.metadata as Record<string, unknown>) ?? {},
            createdAt: String(row.created_at ?? new Date().toISOString()),
            updatedAt: String(row.updated_at ?? new Date().toISOString()),
            deletedAt: (row.deleted_at as string | null) ?? null,
          } satisfies Notification;
          const card = mapDomainNotificationToAccountCard(notification);
          onNotification(card);
          toast.message(card.title, {
            description: card.description,
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, enabled, onNotification]);
}
