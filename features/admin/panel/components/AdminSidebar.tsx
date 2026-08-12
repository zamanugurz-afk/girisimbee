'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMarkSlot } from '@/components/girisimco/brand-mark-slot';
import { BrandWordmark } from '@/components/girisimco/brand-wordmark';
import { cn } from '@/lib/utils';
import {
  ADMIN_NAV_ITEMS,
  ADMIN_PANEL_BASE,
  type AdminNavId,
} from '@/features/admin/panel/constants/admin-nav.constants';

type NavAlertCounts = Partial<Record<AdminNavId, number>>;

const ALERT_NAV_IDS = new Set<AdminNavId>([
  'moderation',
  'support_inquiries',
  'ad_inquiries',
]);

const POLL_MS = 30_000;

function formatAlertCount(n: number): string {
  return n > 99 ? '99+' : String(n);
}

export function AdminSidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const [alerts, setAlerts] = useState<NavAlertCounts>({});

  const loadAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/nav-alerts', { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as {
        data?: {
          moderation?: number;
          support_inquiries?: number;
          ad_inquiries?: number;
        };
      };
      const d = json.data;
      if (!d) return;
      setAlerts({
        moderation: d.moderation ?? 0,
        support_inquiries: d.support_inquiries ?? 0,
        ad_inquiries: d.ad_inquiries ?? 0,
      });
    } catch {
      /* ignore transient poll errors */
    }
  }, []);

  useEffect(() => {
    void loadAlerts();
    const id = window.setInterval(() => {
      void loadAlerts();
    }, POLL_MS);
    const onFocus = () => {
      void loadAlerts();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadAlerts, pathname]);

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
          aria-label="Girisimbee Yönetim paneli"
        >
          <span className="inline-flex items-center gap-0 font-display text-lg font-semibold tracking-tight text-foreground">
            <BrandMarkSlot size={34} className="-mr-1" priority />
            <BrandWordmark />
          </span>
          <p className="mt-1 text-xs text-muted-foreground">Yönetim paneli</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin menüsü">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const count = ALERT_NAV_IDS.has(item.id) ? (alerts[item.id] ?? 0) : 0;
          const showAlert = count > 0;

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
                showAlert && !active && 'bg-rose-500/5',
              )}
            >
              <span className="relative shrink-0">
                <Icon className="h-4 w-4" aria-hidden />
                {showAlert ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500 motion-safe:animate-alert-blink"
                    aria-hidden
                  />
                ) : null}
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {showAlert ? (
                <span
                  className={cn(
                    'inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-none text-white motion-safe:animate-alert-blink',
                    active && 'ring-2 ring-primary/20',
                  )}
                  aria-label={`${count} yeni`}
                >
                  {formatAlertCount(count)}
                </span>
              ) : null}
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
