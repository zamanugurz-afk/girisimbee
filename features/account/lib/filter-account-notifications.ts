import type {
  AccountNotificationCardData,
  AccountNotificationsFilterState,
  AccountNotificationsTab,
} from '@/features/account/types/account-notifications.types';

export function filterAccountNotifications(
  items: AccountNotificationCardData[],
  tab: AccountNotificationsTab,
  filters: AccountNotificationsFilterState,
): AccountNotificationCardData[] {
  const query = filters.query.trim().toLowerCase();
  const now = Date.now();

  let result = items.filter((item) => {
    if (tab !== 'all' && item.type !== tab) return false;

    if (query) {
      const haystack = `${item.title} ${item.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.dateRange !== 'all') {
      const created = new Date(item.createdAt).getTime();
      const days =
        filters.dateRange === '7d' ? 7 : filters.dateRange === '30d' ? 30 : 90;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      if (Number.isNaN(created) || created < cutoff) return false;
    }

    return true;
  });

  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case 'oldest':
        return a.createdAt.localeCompare(b.createdAt);
      case 'unread_first': {
        if (a.status !== b.status) {
          return a.status === 'unread' ? -1 : 1;
        }
        return b.createdAt.localeCompare(a.createdAt);
      }
      case 'newest':
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });

  return result;
}

export function countNotificationsByTab(
  items: AccountNotificationCardData[],
): Record<AccountNotificationsTab, number> {
  return {
    all: items.length,
    favorites: items.filter((item) => item.type === 'favorites').length,
    messages: items.filter((item) => item.type === 'messages').length,
    follows: items.filter((item) => item.type === 'follows').length,
    listings: items.filter((item) => item.type === 'listings').length,
    payments: items.filter((item) => item.type === 'payments').length,
    verifications: items.filter((item) => item.type === 'verifications').length,
    system: items.filter((item) => item.type === 'system').length,
  };
}
