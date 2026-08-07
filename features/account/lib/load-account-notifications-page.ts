import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import {
  mapDomainNotificationToAccountCard,
  mapInboxNotificationToAccountCard,
} from '@/features/account/lib/map-inbox-notification-to-card';
import type { AccountNotificationsPageLoadResult } from '@/features/account/types/account-notifications-page.types';
import type { AccountNotificationCardData } from '@/features/account/types/account-notifications.types';

/** Server loader for /dashboard/bildirimlerim and /hesabim/bildirimlerim */
export async function loadAccountNotificationsPage(
  userId: string,
): Promise<AccountNotificationsPageLoadResult> {
  try {
    const supabase = createClient();
    const container = getServerContainer(supabase);
    const uid = ids.user(userId);

    const [inbox, marketplace] = await Promise.all([
      container.inboxNotificationService.getNotifications(uid),
      container.notificationService
        .list(uid, {}, { page: 1, limit: 100 })
        .catch(() => ({ data: [], total: 0, page: 1, limit: 100, hasMore: false })),
    ]);

    const byId = new Map<string, AccountNotificationCardData>();

    for (const item of marketplace.data.map(mapDomainNotificationToAccountCard)) {
      byId.set(item.id, item);
    }
    for (const item of inbox.map(mapInboxNotificationToAccountCard)) {
      if (!byId.has(item.id)) byId.set(item.id, item);
    }

    const data = [...byId.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );

    return { ok: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Bildirimler yüklenemedi.';
    return { ok: false, error: message };
  }
}
