/** Account panel — notifications UI types. */

export type AccountNotificationType =
  | 'favorites'
  | 'messages'
  | 'follows'
  | 'listings'
  | 'payments'
  | 'verifications'
  | 'system';

export type AccountNotificationsTab = 'all' | AccountNotificationType;

export type AccountNotificationsSort = 'newest' | 'oldest' | 'unread_first';

export type AccountNotificationsDateRange = 'all' | '7d' | '30d' | '90d';

export type AccountNotificationStatus = 'unread' | 'read';

export type AccountNotificationSource = 'inbox' | 'marketplace' | 'local';

export type AccountNotificationIconKey =
  | 'bell'
  | 'star'
  | 'message'
  | 'users'
  | 'megaphone'
  | 'credit-card'
  | 'badge-check'
  | 'settings'
  | 'eye'
  | 'heart'
  | 'clock'
  | 'check'
  | 'x'
  | 'alert';

export interface AccountNotificationCardData {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: AccountNotificationStatus;
  type: AccountNotificationType;
  iconKey: AccountNotificationIconKey;
  actionHref: string | null;
  actionLabel: string | null;
  source: AccountNotificationSource;
  eventKey: string | null;
}

export interface AccountNotificationsFilterState {
  query: string;
  dateRange: AccountNotificationsDateRange;
  sort: AccountNotificationsSort;
}
