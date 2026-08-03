import type { LucideIcon } from 'lucide-react';
import { Archive, Inbox, Send } from 'lucide-react';

export type DashboardMessagesTab = 'inbox' | 'sent' | 'archive';

export const DASHBOARD_MESSAGES_TABS: {
  id: DashboardMessagesTab;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: 'inbox', label: 'Gelen kutusu', icon: Inbox },
  { id: 'sent', label: 'Okunanlar', icon: Send },
  { id: 'archive', label: 'Arşiv', icon: Archive },
];

export interface DashboardMessageCardData {
  id: string;
  userName: string;
  username: string | null;
  avatarUrl: string | null;
  subject: string;
  lastMessage: string;
  date: string;
  isUnread: boolean;
  unreadCount: number;
  readLabel: string;
  listingTitle: string | null;
  listingHref: string | null;
  otherUserId: string;
  status: 'open' | 'archived' | 'blocked' | 'deleted';
}
