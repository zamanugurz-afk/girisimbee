'use client';

import Link from 'next/link';
import {
  BadgeCheck,
  Bell,
  Briefcase,
  CreditCard,
  Handshake,
  LayoutDashboard,
  Lock,
  Megaphone,
  MessageSquare,
  Package,
  Settings,
  Shield,
  Sparkles,
  Star,
  User,
  Users,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GirisimbeeLogo } from '@/components/girisimco/logo';
import {
  DASHBOARD_NAV_SECTIONS,
  type DashboardNavIcon,
  type DashboardNavItem,
} from '@/features/dashboard/panel/dashboard-nav.constants';
import { useDashboardPanelPath } from '@/features/dashboard/panel/use-dashboard-panel-path';
import { useUnreadMessageCount } from '@/features/messaging/hooks/use-unread-message-count';
import { usePendingContactRequestCount } from '@/features/contact-requests/hooks/use-pending-contact-request-count';

const ICONS: Record<DashboardNavIcon, LucideIcon> = {
  LayoutDashboard,
  User,
  Shield,
  Lock,
  BadgeCheck,
  Briefcase,
  Megaphone,
  Sparkles,
  Handshake,
  Star,
  MessageSquare,
  Users,
  Bell,
  CreditCard,
  Package,
  Settings,
};

/**
 * User dashboard sidebar — sleek, modern, step-card aligned design language.
 */
export function DashboardSidebar() {
  const { isActive } = useDashboardPanelPath();
  const { count: unreadMessages } = useUnreadMessageCount();
  const pendingContactCount = usePendingContactRequestCount();

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
      {/* Top Branding Card */}
      <div className="border-b border-slate-100 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <GirisimbeeLogo className="font-display text-lg font-bold tracking-tight" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
            Kullanıcı Paneli
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Platforma dön
          </Link>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-3" aria-label="Kullanıcı paneli menüsü">
        {DASHBOARD_NAV_SECTIONS.map((section, idx) => (
          <div key={section.title || idx} className="space-y-1">
            {section.title ? (
              <h2 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                {section.title}
              </h2>
            ) : null}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                let badge = 0;
                if (item.id === 'mesajlarim') badge = unreadMessages;
                if (item.id === 'iletisimTalepleri') badge = pendingContactCount;

                return (
                  <NavBlock
                    key={item.id}
                    item={item}
                    isActive={isActive}
                    badge={badge}
                  />
                );
              })}
            </div>
          </div>
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
  const active = isActive(item.href);
  const showBadge = badge > 0;

  return (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200',
        active
          ? 'bg-amber-500/15 text-amber-950 dark:text-amber-300 font-bold border-l-3 border-amber-500 shadow-2xs'
          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-white',
      )}
    >
      <span className="relative shrink-0">
        <Icon
          className={cn(
            'h-4 w-4 transition-transform duration-200 group-hover:scale-105',
            active ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-zinc-500',
          )}
          aria-hidden
        />
        {showBadge ? (
          <span
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse"
            aria-hidden
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {showBadge ? (
        <span
          className="inline-flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-none text-white shadow-2xs"
          aria-label={`${badge} bildirim`}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  );
}
