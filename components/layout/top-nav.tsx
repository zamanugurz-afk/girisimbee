'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Command as CommandIcon,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useUI } from '@/lib/stores';
import { useSearch } from '@/hooks/use-search';
import { useNotificationsQuery } from '@/lib/queries';
import { SITE } from '@/config/site';
import { timeAgo, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '@/components/feedback/spinner';

const KIND_TONE: Record<string, string> = {
  deal: 'bg-success-soft text-success',
  'price-drop': 'bg-primary-soft text-primary',
  risk: 'bg-danger-soft text-danger',
  sync: 'bg-accent text-accent-foreground',
  system: 'bg-secondary text-secondary-foreground',
};

const KIND_LABEL: Record<string, string> = {
  deal: 'Fırsat',
  'price-drop': 'Düşüş',
  risk: 'Risk',
  sync: 'Senkron',
  system: 'Sistem',
};

export function TopNav() {
  const router = useRouter();
  const { setCommandOpen, setMobileNavOpen } = useUI();
  const { reset: resetSearch } = useSearch();
  const { data: notifications, isLoading } = useNotificationsQuery();
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        resetSearch();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandOpen, resetSearch]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Kenar çubuğunu aç"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <button
        onClick={() => {
          resetSearch();
          setCommandOpen(true);
        }}
        className="group flex h-9 flex-1 items-center gap-2.5 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft/40 sm:max-w-md"
      >
        <Search className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
        <span className="flex-1 text-left">İlan, ürün ara…</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          <CommandIcon className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="hidden items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success md:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          Canlı · {SITE.city}
        </span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Bildirimler">
              <Bell className="h-4.5 w-4.5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground ring-2 ring-background">
                  {unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 rounded-xl border-border p-0 shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Bildirimler</p>
              {unread > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {unread} yeni
                </Badge>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner size={20} />
                </div>
              ) : (
                <AnimatePresence>
                  {notifications?.map((n, i) => (
                    <motion.button
                      key={n.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => n.link && router.push(n.link)}
                      className={cn(
                        'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                        !n.read && 'bg-primary-soft/30',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase',
                          KIND_TONE[n.kind] ?? KIND_TONE.system,
                        )}
                      >
                        {(KIND_LABEL[n.kind] ?? n.kind)[0]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {n.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {n.body}
                        </span>
                        <span className="mt-1 block text-[10px] text-muted-foreground/70">
                          {timeAgo(n.createdAt)}
                        </span>
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <ThemeToggle />
      </div>
    </header>
  );
}
