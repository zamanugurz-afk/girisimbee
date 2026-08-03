import type {
  AccountNotificationCardData,
  AccountNotificationIconKey,
  AccountNotificationType,
} from '@/features/account/types/account-notifications.types';
import {
  ACCOUNT_NOTIFICATION_DEFAULT_HREF,
  ACCOUNT_NOTIFICATION_EVENT_CATALOG,
} from '@/features/account/types/account-notifications.constants';
import type { InboxNotification } from '@/features/notifications/types/inbox-notification.types';
import type { Notification } from '@/features/notifications/types/notification.types';

function includesAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

export function resolveNotificationCategory(
  rawType: string,
  title = '',
  body = '',
): {
  type: AccountNotificationType;
  iconKey: AccountNotificationIconKey;
  eventKey: string | null;
  actionHref: string;
} {
  const haystack = `${rawType} ${title} ${body}`.toLowerCase();

  for (const event of ACCOUNT_NOTIFICATION_EVENT_CATALOG) {
    if (
      haystack.includes(event.key.replace(/_/g, ' ')) ||
      haystack.includes(event.key) ||
      haystack.includes(event.title.toLowerCase().replace(/\.$/, ''))
    ) {
      return {
        type: event.type,
        iconKey: event.iconKey,
        eventKey: event.key,
        actionHref: event.href,
      };
    }
  }

  if (
    includesAny(haystack, [
      'favorite',
      'favori',
      'match_suggested',
      'listing_favorited',
    ])
  ) {
    return {
      type: 'favorites',
      iconKey: 'heart',
      eventKey: 'listing_favorited',
      actionHref: ACCOUNT_NOTIFICATION_DEFAULT_HREF.favorites,
    };
  }

  if (includesAny(haystack, ['message', 'mesaj', 'conversation', 'sohbet'])) {
    return {
      type: 'messages',
      iconKey: 'message',
      eventKey: 'new_message',
      actionHref: ACCOUNT_NOTIFICATION_DEFAULT_HREF.messages,
    };
  }

  if (includesAny(haystack, ['follow', 'takip', 'profile_view', 'görüntüledi'])) {
    return {
      type: 'follows',
      iconKey: 'users',
      eventKey: 'user_followed',
      actionHref: ACCOUNT_NOTIFICATION_DEFAULT_HREF.follows,
    };
  }

  if (
    includesAny(haystack, [
      'payment',
      'ödeme',
      'package',
      'paket',
      'invoice',
      'fatura',
    ])
  ) {
    return {
      type: 'payments',
      iconKey: 'credit-card',
      eventKey: 'payment_approved',
      actionHref: ACCOUNT_NOTIFICATION_DEFAULT_HREF.payments,
    };
  }

  if (includesAny(haystack, ['verification', 'doğrulama', 'verified'])) {
    return {
      type: 'verifications',
      iconKey: 'badge-check',
      eventKey: 'verification_approved',
      actionHref: ACCOUNT_NOTIFICATION_DEFAULT_HREF.verifications,
    };
  }

  if (
    includesAny(haystack, [
      'listing',
      'ilan',
      'application',
      'başvuru',
      'published',
      'expired',
    ])
  ) {
    return {
      type: 'listings',
      iconKey: 'megaphone',
      eventKey: 'listing_published',
      actionHref: ACCOUNT_NOTIFICATION_DEFAULT_HREF.listings,
    };
  }

  return {
    type: 'system',
    iconKey: 'settings',
    eventKey: null,
    actionHref: ACCOUNT_NOTIFICATION_DEFAULT_HREF.system,
  };
}

export function mapInboxNotificationToAccountCard(
  notification: InboxNotification,
): AccountNotificationCardData {
  const resolved = resolveNotificationCategory(
    notification.type,
    notification.title,
    notification.description,
  );

  return {
    id: notification.id,
    title: notification.title,
    description: notification.description,
    createdAt: notification.createdAt,
    status: notification.isRead ? 'read' : 'unread',
    type: resolved.type,
    iconKey: resolved.iconKey,
    actionHref: resolved.actionHref,
    actionLabel: 'İlgili sayfaya git',
    source: 'inbox',
    eventKey: resolved.eventKey,
  };
}

export function mapDomainNotificationToAccountCard(
  notification: Notification,
): AccountNotificationCardData {
  const resolved = resolveNotificationCategory(
    notification.type,
    notification.title,
    notification.body,
  );

  return {
    id: notification.id,
    title: notification.title,
    description: notification.body,
    createdAt: notification.createdAt,
    status: notification.status === 'read' || Boolean(notification.readAt) ? 'read' : 'unread',
    type: resolved.type,
    iconKey: resolved.iconKey,
    actionHref: notification.actionUrl || resolved.actionHref,
    actionLabel: 'İlgili sayfaya git',
    source: 'marketplace',
    eventKey: resolved.eventKey ?? notification.type,
  };
}

/** Ensure local UX cards carry icon/href for new tab model. */
export function normalizeLocalNotificationCard(
  item: AccountNotificationCardData,
): AccountNotificationCardData {
  const type =
    item.id.startsWith('local-msg-')
      ? 'messages'
      : item.id.startsWith('local-fav-')
        ? 'favorites'
        : item.type;

  const resolved = resolveNotificationCategory(type, item.title, item.description);

  return {
    ...item,
    type,
    iconKey: item.iconKey ?? resolved.iconKey,
    actionHref: item.actionHref ?? ACCOUNT_NOTIFICATION_DEFAULT_HREF[type] ?? resolved.actionHref,
    actionLabel: item.actionLabel ?? 'İlgili sayfaya git',
    source: 'local',
    eventKey: item.eventKey ?? resolved.eventKey,
  };
}
