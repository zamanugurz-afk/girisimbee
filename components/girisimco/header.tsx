'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteLogo, NAV_LINKS, MVP_COPY } from '@/features/shared';
import { AuthMenu } from '@/features/authentication/components/auth-menu';
import { MobileAuthLinks } from '@/features/authentication/components/mobile-auth-links';
import { MarketplaceNotificationsBell } from '@/components/girisimco/marketplace-notifications-bell';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { cn } from '@/lib/utils';

const iconBtnClass =
  'flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-white text-[#334155] shadow-sm transition-all duration-200 hover:border-primary/25 hover:bg-primary/5 hover:text-[#0F172A] dark:bg-card dark:text-foreground';

function isNavLinkActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === '/') return false;
  return pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ease-smooth',
        scrolled
          ? 'border-border/70 bg-white/95 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:bg-background/95'
          : 'border-border/40 bg-white/90 shadow-sm backdrop-blur-xl dark:bg-background/90',
      )}
    >
      <div className="mx-auto flex h-[var(--gc-header-height)] max-w-[1280px] items-center gap-4 px-5 lg:px-8">
        <SiteLogo className="mr-1" />

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden xl:flex"
          aria-label="Ana menü"
        >
          {NAV_LINKS.map((link) => {
            const isActive = isNavLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={cn(
                  'relative whitespace-nowrap px-2.5 py-2 text-gc-xs font-medium transition-colors duration-200 lg:px-3 lg:text-gc-sm',
                  isActive
                    ? 'text-primary'
                    : 'text-[#475569] hover:text-[#0F172A] dark:text-slate-300 dark:hover:text-white',
                )}
              >
                {link.label}
                {isActive ? (
                  <span
                    className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-primary lg:inset-x-3"
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Opaque right cluster so clipped nav never peeks under icons */}
        <div className="relative z-20 ml-auto flex shrink-0 items-center gap-1.5 bg-white pl-3 dark:bg-[hsl(var(--background))] sm:gap-2">
          <Link href="/ara" className={iconBtnClass} aria-label="Ara">
            <Search className="h-4 w-4" />
          </Link>
          <MarketplaceNotificationsBell />

          <AuthMenu />

          <ThemeToggle className="hidden h-9 w-9 sm:inline-flex" />

          <Button
            size="sm"
            className="hidden shadow-md transition-all duration-200 hover:shadow-lg sm:inline-flex"
            asChild
          >
            <Link href="/ilan/olustur">
              <Plus className="mr-1 h-3.5 w-3.5" />
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
          <Link
            href="/ara"
            onClick={() => setMobileOpen(false)}
            className="mb-3 flex items-center gap-2 rounded-xl border border-border/60 bg-white px-3 py-2.5 text-sm font-medium text-[#334155] transition-all hover:border-primary/25 hover:bg-primary/5 dark:bg-card dark:text-foreground"
          >
            <Search className="h-4 w-4 shrink-0" />
            İlan ara…
          </Link>
          <nav className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isNavLinkActive(pathname, link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-[#334155] hover:bg-primary/5 hover:text-[#0F172A] dark:text-foreground',
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
