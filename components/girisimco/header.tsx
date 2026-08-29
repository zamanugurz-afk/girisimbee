'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteLogo, NAV_LINKS, MVP_COPY } from '@/features/shared';
import { AuthMenu } from '@/features/authentication/components/auth-menu';
import { MobileAuthLinks } from '@/features/authentication/components/mobile-auth-links';
import { MarketplaceNotificationsBell } from '@/components/girisimco/marketplace-notifications-bell';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { cn } from '@/lib/utils';

const iconBtnClass =
  'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white';

function isNavLinkActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === '/') return false;
  return pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (queryStr: string) => {
    const trimmed = queryStr.trim();
    if (!trimmed) {
      if (pathname !== '/ara') {
        router.push('/ara');
      }
      return;
    }
    router.push(`/ara?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ease-smooth',
        scrolled
          ? 'border-slate-200/80 bg-white/90 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-background/90'
          : 'border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-background/80',
      )}
    >
      <div className="mx-auto flex h-[var(--gc-header-height)] max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <SiteLogo className="mr-1 shrink-0" />

        <nav
          className="pointer-events-none hidden min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden xl:flex [&_a]:pointer-events-auto"
          aria-label="Ana menü"
        >
          {NAV_LINKS.map((link) => {
            const isActive = isNavLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={cn(
                  'relative whitespace-nowrap px-3 py-1.5 text-xs font-semibold tracking-tight transition-all duration-200 rounded-xl border',
                  isActive
                    ? 'border-primary/50 bg-primary/10 text-primary font-bold dark:border-primary/50 dark:bg-primary/20 dark:text-primary shadow-2xs'
                    : 'border-slate-200 bg-white/90 text-slate-800 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/90 dark:hover:text-white shadow-2xs',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Search, Notifications, Auth, CTA cluster */}
        <div className="relative z-20 ml-auto flex shrink-0 items-center gap-1.5 pl-1 sm:gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit(searchQuery);
            }}
            className="hidden h-9 items-center rounded-full border border-slate-200/80 bg-slate-100/70 pl-3 pr-2 text-xs font-medium text-slate-500 transition-all duration-200 focus-within:border-primary/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-400 dark:focus-within:border-primary/50 dark:focus-within:bg-zinc-900 2xl:inline-flex"
            role="search"
          >
            <button
              type="submit"
              className="mr-1.5 flex shrink-0 items-center justify-center text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              aria-label="Ara"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İlan veya girişim ara..."
              className="w-28 xl:w-36 bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
              aria-label="İlan veya girişim ara"
            />
            <kbd
              onClick={() => searchInputRef.current?.focus()}
              className="ml-1 inline-flex h-4 items-center rounded border border-slate-200 bg-white px-1 font-mono text-[9px] font-semibold text-slate-400 shadow-2xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500 cursor-pointer select-none"
            >
              ⌘K
            </kbd>
          </form>

          <Link href="/ara" className={cn(iconBtnClass, '2xl:hidden')} aria-label="Ara">
            <Search className="h-4 w-4" />
          </Link>

          <MarketplaceNotificationsBell />

          <AuthMenu />

          <ThemeToggle className="hidden h-9 w-9 sm:inline-flex" />

          <Button
            size="sm"
            className="hidden h-9 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 text-xs font-bold text-slate-950 shadow-sm shadow-amber-500/20 transition-all duration-200 hover:from-amber-400 hover:to-amber-500 hover:shadow-md hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] sm:inline-flex"
            asChild
          >
            <Link href="/ilan/olustur">
              <Plus className="mr-1 h-3.5 w-3.5 stroke-[2.5]" />
              {MVP_COPY.postCta}
            </Link>
          </Button>

          <button
            type="button"
            className={cn(iconBtnClass, 'xl:hidden')}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-white/95 px-5 py-4 shadow-lg backdrop-blur-xl xl:hidden animate-fade-in-down dark:bg-background/95">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMobileOpen(false);
              handleSearchSubmit(mobileSearchQuery);
            }}
            className="mb-3 flex items-center gap-2 rounded-xl border border-border/60 bg-white px-3 py-2 text-sm font-medium text-[#334155] dark:bg-card dark:text-foreground"
            role="search"
          >
            <button
              type="submit"
              className="flex shrink-0 items-center text-slate-400 hover:text-slate-600 dark:text-zinc-500"
              aria-label="Ara"
            >
              <Search className="h-4 w-4" />
            </button>
            <input
              type="search"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              placeholder="İlan veya girişim ara..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
              aria-label="İlan veya girişim ara"
            />
          </form>
          <nav className="flex flex-col gap-1.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-all duration-200 shadow-2xs',
                  isNavLinkActive(pathname, link.href)
                    ? 'border-primary/50 bg-primary/10 text-primary font-bold dark:border-primary/50 dark:bg-primary/20 dark:text-primary'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <MobileAuthLinks onNavigate={() => setMobileOpen(false)} />
            <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2">
              <span className="text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
            <Button size="sm" className="w-full shadow-md" asChild>
              <Link href="/ilan/olustur" onClick={() => setMobileOpen(false)}>
                {MVP_COPY.postCta}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
