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

const INTENT_TABS = [
  {
    label: 'Kariyer',
    href: '/is',
    isActive: (p: string) =>
      p === '/is' ||
      p.startsWith('/is/') ||
      p === '/kategori/ise-al' ||
      p === '/kategori/is-ariyorum',
  },
  {
    label: 'Ortaklık ve Devir',
    href: '/girisim-ortaklik',
    isActive: (p: string) =>
      p === '/girisim-ortaklik' ||
      p === '/isletme-devri' ||
      p === '/partners' ||
      p === '/kategori/ortak-bul',
  },
  {
    label: 'Franchise ve Çözümler',
    href: '/franchise/buy',
    isActive: (p: string) =>
      p.startsWith('/franchise') ||
      p === '/dijital-ai' ||
      p === '/kategori/dijital-ai',
  },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
      <div className="relative mx-auto flex h-[var(--gc-header-height)] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <SiteLogo className="mr-1 shrink-0 relative z-20" />

        {/* Notifications, Auth, CTA cluster */}
        <div className="relative z-20 ml-auto flex shrink-0 items-center gap-1.5 pl-1 sm:gap-2">
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
            className={cn(iconBtnClass, 'md:hidden')}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-white/95 px-5 py-4 shadow-lg backdrop-blur-xl md:hidden animate-fade-in-down dark:bg-background/95">
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
