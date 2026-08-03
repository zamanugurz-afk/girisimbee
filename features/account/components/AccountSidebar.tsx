'use client';

import Link from 'next/link';
import {
  Archive,
  BadgeCheck,
  Bell,
  Building2,
  CreditCard,
  FileText,
  Heart,
  LayoutDashboard,
  Lock,
  LogOut,
  Megaphone,
  MessageSquare,
  Package,
  Search,
  Settings,
  Shield,
  Star,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccountPanelPath } from '@/features/account/hooks/use-account-panel-path';
import { useRbac } from '@/features/authorization/hooks/use-rbac';
import { getVisibleAccountNavItems } from '@/features/authorization/lib/account-nav-visibility';
import type { AccountNavItem } from '@/features/account/types/account-panel.types';

const ICONS: Record<AccountNavItem['icon'], LucideIcon> = {
  LayoutDashboard,
  User,
  Shield,
  Lock,
  BadgeCheck,
  Megaphone,
  FileText,
  Archive,
  Package,
  Star,
  Heart,
  Users,
  Building2,
  Search,
  MessageSquare,
  Bell,
  CreditCard,
  Settings,
  LogOut,
};

export function AccountSidebar() {
  const { isActive } = useAccountPanelPath();
  const { role } = useRbac();
  const items = getVisibleAccountNavItems(role);

  return (
    <aside className="flex h-full w-full flex-col border-r border-border/80 bg-background/95 backdrop-blur-sm dark:border-white/10">
      <div className="border-b border-border/80 px-5 py-6 dark:border-white/10">
        <p className="font-display text-lg font-semibold tracking-tight text-foreground">
          Hesap Merkezi
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Hesabınızı tek yerden yönetin
        </p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3" aria-label="Hesap menüsü">
        {items.map((item) => (
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
  item: AccountNavItem;
  isActive: (href: string) => boolean;
}) {
  const Icon = ICONS[item.icon];
  const active = !item.isAction && isActive(item.href);
  const hasChildren = Boolean(item.children?.length);

  return (
    <div className="space-y-1">
      <Link
        href={item.href}
        className={cn(
          'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          item.isAction
            ? 'text-destructive hover:bg-destructive/5'
            : active && !hasChildren
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
