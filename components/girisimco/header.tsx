'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Briefcase,
  ChevronDown,
  Coffee,
  Compass,
  Flame,
  Handshake,
  Landmark,
  Menu,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Store,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteLogo, MVP_COPY } from '@/features/shared';
import { AuthMenu } from '@/features/authentication/components/auth-menu';
import { MobileAuthLinks } from '@/features/authentication/components/mobile-auth-links';
import { MarketplaceNotificationsBell } from '@/components/girisimco/marketplace-notifications-bell';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Close mobile menu on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setActiveDropdown(null);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        router.push('/ara');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleMouseEnter = (name: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

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
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b bg-white dark:bg-zinc-950',
        scrolled
          ? 'border-slate-200/90 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] dark:border-zinc-800'
          : 'border-slate-200/80 dark:border-zinc-800/80'
      )}
    >
      <div className="relative mx-auto flex h-[var(--gc-header-height)] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Sol: Logo */}
        <div className="flex items-center">
          <SiteLogo className="shrink-0 relative z-20" />
        </div>

        {/* ========================================================================= */}
        {/* ORTA MENÜ ELEMANLARI (TAM ORTALANMIŞ DESKTOP NAV)                         */}
        {/* ========================================================================= */}
        <nav
          className="hidden lg:flex items-center gap-1.5 text-[13px] font-bold text-slate-700 dark:text-zinc-200 absolute left-1/2 -translate-x-1/2 z-20"
          onMouseLeave={handleMouseLeave}
        >
          {/* 1. PAZAR YERİ */}
          <div
            onMouseEnter={() => handleMouseEnter('marketplace')}
            className="relative"
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'marketplace' ? null : 'marketplace')}
              className={cn(
                'px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1 cursor-pointer select-none',
                activeDropdown === 'marketplace'
                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-950 dark:text-white'
                  : 'hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:text-slate-950 dark:hover:text-white'
              )}
            >
              <span>Pazar Yeri</span>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
                  activeDropdown === 'marketplace' && 'rotate-180 text-slate-700 dark:text-zinc-200'
                )}
              />
            </button>
          </div>

          {/* 2. İŞ FİKİRLERİ */}
          <div
            onMouseEnter={() => handleMouseEnter('ideas')}
            className="relative"
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'ideas' ? null : 'ideas')}
              className={cn(
                'px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1 cursor-pointer select-none',
                activeDropdown === 'ideas'
                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-950 dark:text-white'
                  : 'hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:text-slate-950 dark:hover:text-white'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>İş Fikirleri</span>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
                  activeDropdown === 'ideas' && 'rotate-180 text-slate-700 dark:text-zinc-200'
                )}
              />
            </button>
          </div>

          {/* 3. AI İSTİHBARAT */}
          <div
            onMouseEnter={() => handleMouseEnter('ai-tools')}
            className="relative"
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'ai-tools' ? null : 'ai-tools')}
              className={cn(
                'px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1 cursor-pointer select-none',
                activeDropdown === 'ai-tools'
                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-950 dark:text-white'
                  : 'hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:text-slate-950 dark:hover:text-white'
              )}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
              <span>AI İstihbarat</span>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
                  activeDropdown === 'ai-tools' && 'rotate-180 text-slate-700 dark:text-zinc-200'
                )}
              />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* ORTAK ORTALANMIŞ AÇILIR POPOVER PENCERE (3 ALANIN TAM ORTASINA DENK GELİR) */}
          {/* ========================================================================= */}
          {activeDropdown && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
              onMouseEnter={() => {
                if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
              }}
              onMouseLeave={handleMouseLeave}
            >
              {activeDropdown === 'marketplace' && (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-2xl p-3 grid grid-cols-2 gap-2 backdrop-blur-2xl w-[460px]">
                  <Link
                    href="/girisim-ortaklik"
                    className="p-2.5 rounded-2xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all flex items-start gap-2.5 group"
                  >
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 group-hover:scale-105 transition-transform">
                      <Handshake className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 leading-tight">
                        Girişim Ortaklığı
                      </span>
                      <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                        Sermaye & yetenek ortakları
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/isletme-devri"
                    className="p-2.5 rounded-2xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all flex items-start gap-2.5 group"
                  >
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
                      <Store className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 leading-tight">
                        Devren İşletmeler
                      </span>
                      <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                        Hazır kârlı devir ilanları
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/franchise/buy"
                    className="p-2.5 rounded-2xl hover:bg-sky-500/10 border border-transparent hover:border-sky-500/20 transition-all flex items-start gap-2.5 group"
                  >
                    <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0 group-hover:scale-105 transition-transform">
                      <Coffee className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 leading-tight">
                        Franchise & Bayilik
                      </span>
                      <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                        Doğrulanmış marka ağları
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/is"
                    className="p-2.5 rounded-2xl hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all flex items-start gap-2.5 group"
                  >
                    <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0 group-hover:scale-105 transition-transform">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-tight">
                        Kariyer & Yetenek
                      </span>
                      <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                        Startup ekibi & uzmanlar
                      </span>
                    </div>
                  </Link>
                </div>
              )}

              {activeDropdown === 'ideas' && (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-2xl p-3 space-y-2 backdrop-blur-2xl w-[380px]">
                  <Link
                    href="/trend-fikirler"
                    className="p-3 rounded-2xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all flex items-start gap-3 group"
                  >
                    <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0 group-hover:scale-105 transition-transform">
                      <Flame className="w-4 h-4 fill-current" />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        Trend & Yeni İş Fikirleri
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        Amortismanı, sermayesi ve aylık kârı hesaplanmış doğrulanmış modeller
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/fikrim-var"
                    className="p-3 rounded-2xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all flex items-start gap-3 group"
                  >
                    <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0 group-hover:scale-105 transition-transform">
                      <Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        &quot;Fikrim Var, Bütçem Yok&quot;
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        Aracını, mekanını ve fikrini 5 adımda modelle; melek yatırımcı çağrısı aç
                      </span>
                    </div>
                  </Link>
                </div>
              )}

              {activeDropdown === 'ai-tools' && (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-2xl p-3 space-y-1.5 backdrop-blur-2xl w-[360px]">
                  <Link
                    href="/radar"
                    className="p-2.5 rounded-2xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all flex items-center gap-3 group"
                  >
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
                      <Compass className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        Lokasyon Radarı
                      </span>
                      <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        81 İl demografi & rakip haritası
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/is-kurma-asistani"
                    className="p-2.5 rounded-2xl hover:bg-sky-500/10 border border-transparent hover:border-sky-500/20 transition-all flex items-center gap-3 group"
                  >
                    <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0 group-hover:scale-105 transition-transform">
                      <Wrench className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        İş Kurma Asistanı
                      </span>
                      <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        32 sektör maliyet & kurulum simülatörü
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/is-kurma-asistani"
                    className="p-2.5 rounded-2xl hover:bg-teal-500/10 border border-transparent hover:border-teal-500/20 transition-all flex items-center gap-3 group"
                  >
                    <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0 group-hover:scale-105 transition-transform">
                      <Landmark className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        Hibe & Teşvik Radarı
                      </span>
                      <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        2026 KOSGEB & vergi muafiyeti
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>

          {/* ========================================================================= */}
          {/* SAĞ ALAN: BİLDİRİM, PROFİL, TEMA VE İLAN VER BUTONU                       */}
          {/* ========================================================================= */}
          <div className="relative z-20 flex shrink-0 items-center gap-1.5 sm:gap-2">
            <MarketplaceNotificationsBell />

            <AuthMenu />

            <ThemeToggle className="hidden h-9 w-9 sm:inline-flex rounded-full" />

            <Button
              size="sm"
              className="hidden sm:inline-flex h-9 rounded-full bg-gradient-to-r from-emerald-500 to-[#00A86B] hover:from-emerald-600 hover:to-[#00925D] px-4.5 text-xs font-black text-white shadow-sm shadow-emerald-500/25 hover:shadow-md hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
              asChild
            >
              <Link href="/ilan/olustur">
                <Plus className="mr-1 h-3.5 w-3.5 stroke-[2.5]" />
                {MVP_COPY.postCta}
              </Link>
            </Button>

            {/* Mobil Menü Butonu */}
            <button
              type="button"
              className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

      {/* ========================================================================= */}
      {/* MOBİL AÇILIR MENÜ (MOBILE DRAWER)                                         */}
      {/* ========================================================================= */}
      {mobileOpen && (
        <div className="border-t border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 px-5 py-4 shadow-xl backdrop-blur-xl lg:hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Mobil Arama Çubuğu */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMobileOpen(false);
              handleSearchSubmit(mobileSearchQuery);
            }}
            className="mb-3 flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-zinc-200"
            role="search"
          >
            <button type="submit" className="text-slate-400" aria-label="Ara">
              <Search className="h-4 w-4" />
            </button>
            <input
              type="search"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              placeholder="İlan, girişim veya niş fikir ara..."
              className="w-full bg-transparent text-xs placeholder:text-slate-400 focus:outline-none dark:placeholder:text-zinc-500"
              aria-label="İlan veya girişim ara"
            />
          </form>

          {/* Mobil Kategorik Linkler */}
          <div className="space-y-1 text-xs font-bold text-slate-700 dark:text-zinc-200">
            <div className="px-2 py-1 text-[10.5px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Pazar Yeri
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <Link
                href="/girisim-ortaklik"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-amber-500/10 flex items-center gap-2"
              >
                <Handshake className="w-3.5 h-3.5 text-amber-500" />
                <span>Ortaklık</span>
              </Link>
              <Link
                href="/isletme-devri"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-emerald-500/10 flex items-center gap-2"
              >
                <Store className="w-3.5 h-3.5 text-emerald-500" />
                <span>Devren İşletme</span>
              </Link>
              <Link
                href="/franchise/buy"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-sky-500/10 flex items-center gap-2"
              >
                <Coffee className="w-3.5 h-3.5 text-sky-500" />
                <span>Franchise</span>
              </Link>
              <Link
                href="/is"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-indigo-500/10 flex items-center gap-2"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                <span>Kariyer</span>
              </Link>
            </div>

            <div className="px-2 py-1 text-[10.5px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-current" />
              İş Fikirleri & Kuluçka
            </div>
            <div className="grid grid-cols-1 gap-1.5 mb-2">
              <Link
                href="/trend-fikirler"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  <span>Trend & Yeni İş Fikirleri</span>
                </div>
                <span className="text-[10px] font-mono font-black">Fizibilite</span>
              </Link>
              <Link
                href="/fikrim-var"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Rocket className="w-3.5 h-3.5 text-emerald-500" />
                  <span>&quot;Fikrim Var, Bütçem Yok&quot;</span>
                </div>
                <span className="text-[10px] font-bold">5 Adım</span>
              </Link>
            </div>

            <div className="px-2 py-1 text-[10.5px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              AI İstihbarat & Araçlar
            </div>
            <div className="grid grid-cols-3 gap-1 mb-3">
              <Link
                href="/radar"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 text-center"
              >
                <Compass className="w-3.5 h-3.5 mx-auto text-emerald-500 mb-1" />
                <span className="block text-[11px] truncate">Radar</span>
              </Link>
              <Link
                href="/is-kurma-asistani"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 text-center"
              >
                <Wrench className="w-3.5 h-3.5 mx-auto text-sky-500 mb-1" />
                <span className="block text-[11px] truncate">Asistan</span>
              </Link>
              <Link
                href="/is-kurma-asistani"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 text-center"
              >
                <Landmark className="w-3.5 h-3.5 mx-auto text-teal-500 mb-1" />
                <span className="block text-[11px] truncate">Hibe</span>
              </Link>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
            <MobileAuthLinks onNavigate={() => setMobileOpen(false)} />
            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-zinc-800 px-3 py-2">
              <span className="text-xs text-slate-500">Görünüm Teması</span>
              <ThemeToggle />
            </div>
            <Button size="sm" className="w-full rounded-full bg-[#00A86B] hover:bg-[#00925D] font-bold" asChild>
              <Link href="/ilan/olustur" onClick={() => setMobileOpen(false)}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                {MVP_COPY.postCta}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
