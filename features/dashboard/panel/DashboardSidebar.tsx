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
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_NAV_ITEMS,
  type DashboardNavIcon,
  type DashboardNavItem,
} from '@/features/dashboard/panel/dashboard-nav.constants';
import { useDashboardPanelPath } from '@/features/dashboard/panel/use-dashboard-panel-path';

const ICONS: Record<DashboardNavIcon, LucideIcon> = {
  LayoutDashboard,
  User,
  Shield,
  Lock,
  BadgeCheck,
  Megaphone,
  Star,
  MessageSquare,
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

  return (
    <aside className="flex h-full w-full flex-col border-r border-border/80 bg-background/95 backdrop-blur-sm dark:border-white/10">
      <div className="border-b border-border/80 px-5 py-6 dark:border-white/10">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          Girişimco
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">Kullanıcı paneli · Hesabınızı yönetin</p>
        <Link
          href="/kesfet"
          className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
        >
          Marketplace’e dön
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3" aria-label="Kullanıcı paneli menüsü">
        {DASHBOARD_NAV_ITEMS.map((item) => (
          <NavBlock key={item.id} item={item} isActive={isActive} />
        ))}
      </nav>
    </aside>
  );
}

function NavBlock({
  item,
  isActive,
}: {
  item: DashboardNavItem;
  isActive: (href: string) => boolean;
}) {
  const Icon = ICONS[item.icon];
  const hasChildren = Boolean(item.children?.length);
  const active = isActive(item.href);

  return (
    <div className="space-y-1">
      <Link
        href={item.href}
        className={cn(
          'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          active && !hasChildren
            ? 'bg-primary/10 text-primary shadow-sm'
            : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
            active && !hasChildren ? 'text-primary' : 'text-muted-foreground',
          )}
          aria-hidden
        />
        <span>{item.label}</span>
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
