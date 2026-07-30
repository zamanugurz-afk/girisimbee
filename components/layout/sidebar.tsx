'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Radar,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { NAV_SECTIONS, QUICK_ACTIONS } from '@/config/navigation';
import { SITE, OWNER_ROUTE } from '@/config/site';
import { useUI } from '@/lib/stores';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUI();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 76 : 264 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 flex h-screen flex-col border-r border-sidebar-border bg-sidebar"
    >
      <BrandHeader collapsed={sidebarCollapsed} />

      <nav className="ib-scrollbar-none flex-1 overflow-y-auto px-3 py-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.id} className="mb-5">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                        active
                          ? 'bg-primary-soft text-primary'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                        sidebarCollapsed && 'justify-center',
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        />
                      )}
                      <item.icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110',
                          active && 'text-primary',
                        )}
                      />
                      {!sidebarCollapsed && (
                        <AnimatePresence>
                          <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-1 items-center justify-between"
                          >
                            <span>{item.label}</span>
                            {item.badge ? (
                              <span className="flex h-5 items-center gap-1 rounded-full bg-primary/15 px-2 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                <Sparkles className="h-2.5 w-2.5" />
                                {item.badge}
                              </span>
                            ) : null}
                          </motion.span>
                        </AnimatePresence>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {!sidebarCollapsed && (
          <QuickActions />
        )}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={toggleSidebar}
          aria-label="Kenar çubuğunu daralt"
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground',
            sidebarCollapsed && 'justify-center',
          )}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform duration-300',
              sidebarCollapsed && 'rotate-180',
            )}
          />
          {!sidebarCollapsed && <span>Daralt</span>}
        </button>
      </div>
    </motion.aside>
  );
}

function BrandHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Radar className="h-[18px] w-[18px]" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar" />
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            className="overflow-hidden"
          >
            <p className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">
              {SITE.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              Özel · {SITE.city}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="mt-6 rounded-xl border border-sidebar-border bg-card/50 p-3">
      <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        Hızlı işlemler
      </p>
      <ul className="space-y-0.5">
        {QUICK_ACTIONS.map((qa) => (
          <li key={qa.label}>
            <Link
              href={qa.href}
              className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <qa.icon className="h-3.5 w-3.5 text-muted-foreground/70 transition-transform group-hover:scale-110" />
              <span className="truncate">{qa.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === OWNER_ROUTE) return pathname === OWNER_ROUTE;
  return pathname === href || pathname.startsWith(href + '/');
}
