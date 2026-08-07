'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandWordmark } from '@/components/girisimco/brand-wordmark';
import { cn } from '@/lib/utils';
import {
  ADMIN_NAV_ITEMS,
  ADMIN_PANEL_BASE,
} from '@/features/admin/panel/constants/admin-nav.constants';

export function AdminSidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col border-r border-border/80 bg-background dark:border-white/10',
        className,
      )}
    >
      <div className="border-b border-border/80 px-5 py-5 dark:border-white/10">
        <Link
          href={ADMIN_PANEL_BASE}
          onClick={onNavigate}
          className="block"
        >
          <p className="font-display text-lg font-semibold tracking-tight text-foreground">
            <BrandWordmark />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Yönetim paneli</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin menüsü">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/80 p-4 dark:border-white/10">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Admin ve super_admin erişimi. Modüller aşamalı olarak geliştirilecek.
        </p>
      </div>
    </aside>
  );
}
