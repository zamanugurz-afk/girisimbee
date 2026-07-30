'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteLogo, NAV_LINKS, MVP_COPY } from '@/features/shared';
import { AuthMenu } from '@/features/authentication/components/auth-menu';
import { MobileAuthLinks } from '@/features/authentication/components/mobile-auth-links';
import { useUnreadMessageCount } from '@/features/messaging/hooks/use-unread-message-count';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count: unreadMessages } = useUnreadMessageCount();

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
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-150 ease-smooth',
        scrolled
          ? 'gc-glass border-b shadow-soft'
          : 'border-b border-transparent bg-background/80 backdrop-blur-sm',
      )}
    >
      <div className="mx-auto flex h-[var(--gc-header-height)] max-w-7xl items-center gap-4 px-5 lg:px-8">
        <SiteLogo />

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href + link.label} href={link.href} className="gc-nav-link">
              {link.label}
              {link.href === '/mesajlar' && unreadMessages > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/ara"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 ease-smooth hover:bg-muted/70 hover:text-foreground sm:flex"
            aria-label="Ara"
          >
            <Search className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 ease-smooth hover:bg-muted/70 hover:text-foreground sm:flex"
            aria-label="Bildirimler"
          >
            <Bell className="h-4 w-4" />
          </button>

          <AuthMenu />

          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/ilan/olustur">
              <Plus className="mr-1 h-3.5 w-3.5" />
              {MVP_COPY.postCta}
            </Link>
          </Button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 text-muted-foreground transition-all duration-200 hover:bg-muted/60 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="gc-glass border-t px-5 py-4 md:hidden animate-fade-in-down">
          <nav className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                {link.label}
                {link.href === '/mesajlar' && unreadMessages > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <MobileAuthLinks onNavigate={() => setMobileOpen(false)} />
            <Button size="sm" className="w-full" asChild>
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
