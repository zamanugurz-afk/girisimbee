'use client';

import Link from 'next/link';
import {
  BadgeCheck,
  Bell,
  CreditCard,
  LayoutDashboard,
  Lock,
  Megaphone,
  MessageSquare,
  Package,
  Settings,
  Shield,
  Star,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GirisimbeeLogo } from '@/components/girisimco/logo';
import { BRAND_PITCH_SHORT } from '@/features/shared/constants/brand';
import {
  DASHBOARD_NAV_ITEMS,
  type DashboardNavIcon,
  type DashboardNavItem,
} from '@/features/dashboard/panel/dashboard-nav.constants';
import { useDashboardPanelPath } from '@/features/dashboard/panel/use-dashboard-panel-path';
import { useUnreadMessageCount } from '@/features/messaging/hooks/use-unread-message-count';

const ICONS: Record<DashboardNavIcon, LucideIcon> = {
  LayoutDashboard,
  User,
  Shield,
  Lock,
  BadgeCheck,
  Megaphone,
  Star,
  MessageSquare,
  Users,
  Bell,
  CreditCard,
  Package,
  Settings,
};

/**
 * User dashboard sidebar — no admin links.
 * Visible to all signed-in app roles (legacy member/verified/company map to user).
 */
export function DashboardSidebar() {
  const { isActive } = useDashboardPanelPath();
  const { count: unreadMessages } = useUnreadMessageCount();

  return (
    <aside className="flex h-full w-full flex-col border-r border-border/80 bg-background/95 backdrop-blur-sm dark:border-white/10">
      <div className="border-b border-border/80 px-5 py-6 dark:border-white/10">
        <GirisimbeeLogo className="font-display text-lg font-semibold tracking-tight" />
        <p className="mt-1 text-gc-xs text-muted-foreground">Kullanıcı paneli · Hesabınızı yönetin</p>
        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground/90">{BRAND_PITCH_SHORT}</p>
        <Link
          href="/kesfet"
          className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
        >
          Marketplace’e dön
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3" aria-label="Kullanıcı paneli menüsü">
        {DASHBOARD_NAV_ITEMS.map((item) => (
          <NavBlock
            key={item.id}
            item={item}
            isActive={isActive}
            badge={item.id === 'mesajlarim' && unreadMessages > 0 ? unreadMessages : 0}
          />
        ))}
      </nav>
    </aside>
  );
}

function NavBlock({
  item,
  isActive,
  badge = 0,
}: {
  item: DashboardNavItem;
  isActive: (href: string) => boolean;
  badge?: number;
}) {
  const Icon = ICONS[item.icon];
  const hasChildren = Boolean(item.children?.length);
  const active = isActive(item.href);
  const showBadge = badge > 0;

  return (
    <div className="space-y-1">
      <Link
        href={item.href}
        className={cn(
          'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          active && !hasChildren
            ? 'bg-primary/10 text-primary shadow-sm'
            : showBadge
              ? 'bg-primary/5 text-foreground'
              : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
        )}
      >
        <span className="relative shrink-0">
          <Icon
            className={cn(
              'h-4 w-4 transition-transform duration-200 group-hover:scale-110',
              active && !hasChildren ? 'text-primary' : 'text-muted-foreground',
            )}
            aria-hidden
          />
          {showBadge ? (
            <span
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500 motion-safe:animate-alert-blink"
              aria-hidden
            />
          ) : null}
        </span>
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {showBadge ? (
          <span
            className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-none text-white motion-safe:animate-alert-blink"
            aria-label={`${badge} okunmamış mesaj`}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </Link>

      {hasChildren ? (
        <ul className="ml-3 space-y-0.5 border-l border-border/70 pl-3 dark:border-white/10">
          {item.children!.map((child) => {
            const ChildIcon = ICONS[child.icon];
            const childActive = isActive(child.href);
            return (
              <li key={child.id}>
                <Link
                  href={child.href}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-all duration-200',
                    childActive
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  <ChildIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
