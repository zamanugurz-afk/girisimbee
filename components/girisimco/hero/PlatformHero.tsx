'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Handshake,
  Megaphone,
  Rocket,
  Search,
  Store,
  Wrench,
  Sparkles,
  Compass,
  Calculator,
  Landmark,
  MapPin,
  Bot,
  Scale,
  Flame,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { HeroNetworkVisual } from '@/components/girisimco/hero/hero-network';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface HeroSlide {
  id: string;
  badge: string;
  badgeColor: string; // Tailwind bg/text classes
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  description: string;
  primaryBtn: { label: string; href: string; icon: string; style: string };
  secondaryBtn: { label: string; href: string; icon?: string };
  targetScrollId?: string; // Tıklandığında sayfadaki ilgili bloğa pürüzsüz kaydırma
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'career',
    badge: '💼 Yetenek & Kariyer',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    titlePrefix: 'Doğru Yetenekle Buluş, ',
    titleHighlight: 'Kariyerini',
    titleSuffix: ' Güvenle Büyüt.',
    description: 'İster uzman ekibini kur, ister hayalindeki pozisyona başvur. İletişim bilgilerin tamamen gizli kalır; sadece doğrulanmış ve nitelikli eşleşmeler sağlanır.',
    primaryBtn: { label: 'Fırsatları Keşfet', href: '/is', icon: 'Search', style: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs' },
    secondaryBtn: { label: 'Kariyer İlanı Ver', href: '/ilan/olustur?type=job' },
  },
  {
    id: 'market-partnership',
    badge: '🤝 Ortaklık & Franchising',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    titlePrefix: 'Fikirler Uçuşur, ',
    titleHighlight: 'Stratejik Ortaklıklar',
    titleSuffix: ' Doğar.',
    description: 'Girişim ekosisteminde doğrulanmış en güncel melek yatırımcılar, bayilik modelleri ve devren işletmeler tek vitrinde toplanıyor.',
    primaryBtn: { label: 'Girişimbee Market', href: '#market-section', icon: 'Sparkles', style: 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs' },
    secondaryBtn: { label: 'Ortak / Yatırımcı Ara', href: '/ilan/olustur?type=partner' },
    targetScrollId: '#market-section',
  },
  {
    id: 'location-radar',
    badge: '📍 Canlı Pazar İstihbaratı',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    titlePrefix: 'Lokasyon Radarı ile ',
    titleHighlight: 'Pazar Açıklarını',
    titleSuffix: ' Keşfet.',
    description: 'Türkiye genelinde dükkan açacağın çevreyi seç; anlık rakip yoğunluğunu, TÜİK demografisini ve bölgedeki eksik ticari konseptleri harita üzerinde gör.',
    primaryBtn: { label: 'Radarı Başlat', href: '#radar-section', icon: 'Compass', style: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' },
    secondaryBtn: { label: 'Pazar Raporu Al', href: '#radar-section' },
    targetScrollId: '#radar-section',
  },
  {
    id: 'setup-assistant',
    badge: '🤖 Akıllı Kurulum Robotu',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
    titlePrefix: 'İşini Sıfır Riskle Kur: ',
    titleHighlight: 'Bütçeni & Şartları',
    titleSuffix: ' Hesapla.',
    description: '32 sektörde m², kira peşinatı, kilitli yasal zorunluluklar, demirbaşlar, açılış emtiası ve ERP lisans maliyetlerini saniyeler içinde simüle et.',
    primaryBtn: { label: 'İş Kurma Asistanı', href: '#assistant-section', icon: 'Calculator', style: 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs' },
    secondaryBtn: { label: 'Örnek Fizibilite Gör', href: '#assistant-section' },
    targetScrollId: '#assistant-section',
  },
  {
    id: 'grants-radar',
    badge: '🏛️ Hibe & Teşvik Radarı',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60',
    titlePrefix: 'Hibe & Teşvik ile ',
    titleHighlight: 'Devlet Desteklerini',
    titleSuffix: ' Keşfet.',
    description: '32 sektörde NACE kodunuza özel KOSGEB hibe paketleri, Genç Girişimci vergi muafiyeti ve bölgesel SGK teşviklerini anlık hesaplayın.',
    primaryBtn: { label: 'Teşvik Radarını Başlat', href: '#grants-section', icon: 'Landmark', style: 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs' },
    secondaryBtn: { label: '2026 Desteklerini Gör', href: '#grants-section' },
    targetScrollId: '#grants-section',
  },
];

const HERO_SIDEBAR_MODULES: {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  href: string;
  targetScrollId?: string;
  Icon: LucideIcon;
  iconClass: string;
  boxClass: string;
  hoverBorderClass: string;
}[] = [
  {
    id: 'location-radar',
    title: 'Lokasyon Radarı',
    subtitle: 'Canlı Pazar & Harita',
    badge: 'Canlı Pazar',
    href: '#radar-section',
    targetScrollId: '#radar-section',
    Icon: MapPin,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    boxClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600',
    hoverBorderClass: 'hover:border-emerald-500/60 dark:hover:border-emerald-500/60',
  },
  {
    id: 'setup-assistant',
    title: 'İş Kurma Asistanı',
    subtitle: 'Kira & Bütçe Robotu',
    badge: 'Canlı Bütçe',
    href: '#assistant-section',
    targetScrollId: '#assistant-section',
    Icon: Bot,
    iconClass: 'text-sky-600 dark:text-sky-400',
    boxClass: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600',
    hoverBorderClass: 'hover:border-sky-500/60 dark:hover:border-sky-500/60',
  },
  {
    id: 'legal-assistant',
    title: 'Resmi Başvuru & Hukuk',
    subtitle: 'Mevzuat & Evrak Rehberi',
    badge: '2026 Mevzuat',
    href: '#legal-section',
    targetScrollId: '#legal-section',
    Icon: Scale,
    iconClass: 'text-purple-600 dark:text-purple-400',
    boxClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600',
    hoverBorderClass: 'hover:border-purple-500/60 dark:hover:border-purple-500/60',
  },
  {
    id: 'grants-radar',
    title: 'Hibe & Teşvik Radarı',
    subtitle: 'KOSGEB & SGK Destekleri',
    badge: '₺3.1M Hibe',
    href: '#grants-section',
    targetScrollId: '#grants-section',
    Icon: Landmark,
    iconClass: 'text-teal-600 dark:text-teal-400',
    boxClass: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600',
    hoverBorderClass: 'hover:border-teal-500/60 dark:hover:border-teal-500/60',
  },
  {
    id: 'trend-ideas',
    title: 'Trend İş Fikirleri',
    subtitle: '8 Yeni Niş Model',
    badge: 'Eylül 2026',
    href: '#trend-ideas-section',
    targetScrollId: '#trend-ideas-section',
    Icon: Flame,
    iconClass: 'text-amber-600 dark:text-amber-400',
    boxClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600',
    hoverBorderClass: 'hover:border-amber-500/60 dark:hover:border-amber-500/60',
  },
  {
    id: 'market-solutions',
    title: 'Girişimbee Market',
    subtitle: 'Seçili Çözümler & Fırsatlar',
    badge: 'Doğrulanmış',
    href: '/market',
    targetScrollId: '#market-section',
    Icon: Sparkles,
    iconClass: 'text-indigo-600 dark:text-indigo-400',
    boxClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600',
    hoverBorderClass: 'hover:border-indigo-500/60 dark:hover:border-indigo-500/60',
  },
];

function ModulePill({
  item,
  onNavigate,
}: {
  item: (typeof HERO_SIDEBAR_MODULES)[number];
  onNavigate: (e: React.MouseEvent, href: string, targetScrollId?: string) => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={(e) => onNavigate(e, item.href, item.targetScrollId)}
      className={cn(
        'group flex items-center justify-between gap-2.5 rounded-xl border border-[#E6E8EE] bg-white/95 px-3 py-1.5',
        'shadow-[0_1px_3px_rgba(15,23,42,0.04)] backdrop-blur-sm',
        'cursor-pointer transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:-translate-y-0.5',
        'dark:border-border dark:bg-card',
        item.hoverBorderClass,
      )}
      aria-label={`${item.title}: ${item.subtitle}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105',
            item.boxClass,
          )}
          aria-hidden
        >
          <item.Icon className={cn('h-3.5 w-3.5', item.iconClass)} strokeWidth={2} />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-[12.5px] font-bold leading-tight text-[#0B1220] transition-colors dark:text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
            {item.title}
          </span>
          <span className="mt-0.5 block truncate text-[10.5px] font-medium text-[#64748B] transition-colors group-hover:text-foreground">
            {item.subtitle}
          </span>
        </span>
      </div>

      {item.badge && (
        <span className="shrink-0 text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/70 dark:border-zinc-700">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function PlatformHero({ className }: { className?: string }) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION_MS = 5000;
  const TICK_INTERVAL_MS = 50;

  // Otomatik Geçiş ve İlerleme Çubuğu Timer'ı
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + (TICK_INTERVAL_MS / SLIDE_DURATION_MS) * 100;
        if (nextProgress >= 100) {
          setActiveSlideIndex((current) => (current + 1) % HERO_SLIDES.length);
          return 0;
        }
        return nextProgress;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleSelectSlide = (index: number) => {
    setActiveSlideIndex(index);
    setProgress(0);
  };

  const handleSmoothScroll = (
    e: React.MouseEvent,
    href: string,
    targetScrollId?: string,
  ) => {
    const target = targetScrollId || (href.startsWith('#') ? href : undefined);
    if (target && target.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const activeSlide = HERO_SLIDES[activeSlideIndex];

  // Renk Sınıfları Eşleşmesi
  const getHighlightColor = (id: string) => {
    switch (id) {
      case 'career':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'market-partnership':
        return 'text-[#F59E0B]';
      case 'location-radar':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'setup-assistant':
        return 'text-sky-600 dark:text-sky-400';
      case 'grants-radar':
        return 'text-teal-600 dark:text-teal-400';
      default:
        return 'text-[#F59E0B]';
    }
  };

  const getBorderColor = (id: string) => {
    switch (id) {
      case 'career':
        return 'border-indigo-500/70';
      case 'market-partnership':
        return 'border-[#F59E0B]/70';
      case 'location-radar':
        return 'border-emerald-500/70';
      case 'setup-assistant':
        return 'border-sky-500/70';
      case 'grants-radar':
        return 'border-teal-500/70';
      default:
        return 'border-[#F59E0B]/70';
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search':
        return <Search className="h-4 w-4" aria-hidden />;
      case 'Sparkles':
        return <Sparkles className="h-4 w-4" aria-hidden />;
      case 'Compass':
        return <Compass className="h-4 w-4" aria-hidden />;
      case 'Calculator':
        return <Calculator className="h-4 w-4" aria-hidden />;
      case 'Landmark':
        return <Landmark className="h-4 w-4" aria-hidden />;
      default:
        return <Rocket className="h-4 w-4" aria-hidden />;
    }
  };

  return (
    <section
      className={cn(
        'relative flex min-h-0 flex-col justify-center overflow-hidden bg-transparent',
        className,
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_20%,rgba(251,191,36,0.07),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_80%,rgba(15,23,42,0.03),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex h-full w-full max-w-[1280px] items-center px-5 lg:px-8">
        <div className="grid w-full items-center gap-4 py-2 sm:py-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.2fr)_auto] lg:gap-8 lg:py-2.5">
          {/* SOL SÜTUN: 4 ADIMLI DİNAMİK HERO SLIDER ALANI */}
          <div className="flex max-w-[36rem] flex-col justify-center">
            {/* Dinamik Başlık, Açıklama ve Butonlar (Animasyonlu Geçiş) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Başlık */}
                <h1 className="font-display text-[2rem] font-extrabold leading-[1.1] tracking-tight text-[#0B1220] dark:text-foreground sm:text-[2.4rem] lg:text-[2.75rem] min-h-[5.5rem] sm:min-h-[6rem] lg:min-h-[6.5rem]">
                  {activeSlide.titlePrefix}
                  <span className={getHighlightColor(activeSlide.id)}>
                    {activeSlide.titleHighlight}
                  </span>
                  <br />
                  {activeSlide.titleSuffix}
                </h1>

                {/* Açıklama Kutusu */}
                <div
                  className={cn(
                    'max-w-[34rem] border-l-2 pl-4 sm:pl-4.5 min-h-[4.5rem] flex items-center',
                    getBorderColor(activeSlide.id),
                  )}
                >
                  <p className="text-[14.5px] leading-[1.6] text-[#475569] dark:text-zinc-300 sm:text-[15.5px]">
                    {activeSlide.description}
                  </p>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button
                    asChild
                    className={cn(
                      'h-10 gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-200',
                      activeSlide.primaryBtn.style,
                    )}
                  >
                    <Link
                      href={activeSlide.primaryBtn.href}
                      onClick={(e) =>
                        handleSmoothScroll(
                          e,
                          activeSlide.primaryBtn.href,
                          activeSlide.targetScrollId,
                        )
                      }
                    >
                      {renderIcon(activeSlide.primaryBtn.icon)}
                      {activeSlide.primaryBtn.label}
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-xl border-[#D5D8E0] bg-white px-5 text-sm font-semibold shadow-none hover:bg-[#F7F8FA] dark:bg-card dark:border-zinc-700"
                  >
                    <Link
                      href={activeSlide.secondaryBtn.href}
                      onClick={(e) =>
                        handleSmoothScroll(e, activeSlide.secondaryBtn.href)
                      }
                    >
                      {activeSlide.secondaryBtn.label}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* 3. Alt İlerleme Çubuğu & Slayt Göstergeleri (Progress Dots) */}
            <div className="flex items-center gap-2 pt-5">
              {HERO_SLIDES.map((slide, index) => {
                const isActive = index === activeSlideIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => handleSelectSlide(index)}
                    className="relative h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-800 transition-all duration-300 cursor-pointer"
                    style={{ width: isActive ? '2.75rem' : '1rem' }}
                    aria-label={`Slayt ${index + 1}: ${slide.badge}`}
                  >
                    {isActive && (
                      <div
                        className="absolute inset-0 bg-slate-900 dark:bg-white rounded-full transition-all ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                  </button>
                );
              })}
              <span className="text-[11px] font-bold text-muted-foreground ml-1.5 tabular-nums">
                0{activeSlideIndex + 1} / 0{HERO_SLIDES.length}
              </span>
            </div>
          </div>

          {/* ORTA SÜTUN: ETKİLEŞİMLİ AĞ VE YÖRÜNGE ÇEMBERİ */}
          <div className="hidden min-w-0 items-center justify-center sm:flex">
            <HeroNetworkVisual className="w-[min(370px,40dvh)] max-w-none" />
          </div>

          {/* SAĞ SÜTUN: PLATFORM MODÜLLERİ VE ASİSTANLAR */}
          <div className="hidden justify-end xl:flex">
            <ul
              className="flex w-[13.5rem] flex-col gap-1.5"
              aria-label="Platform modülleri ve asistanlar"
            >
              {HERO_SIDEBAR_MODULES.map((item) => (
                <li key={item.id}>
                  <ModulePill item={item} onNavigate={handleSmoothScroll} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* MOBİL VE TABLET İÇİN ALT MODÜL KARTLARI */}
      <div className="relative border-t border-[#EEF0F4] px-5 pb-2 pt-2 xl:hidden lg:px-8">
        <ul
          className="mx-auto grid max-w-[1280px] grid-cols-2 gap-1.5 sm:grid-cols-3"
          aria-label="Platform modülleri ve asistanlar"
        >
          {HERO_SIDEBAR_MODULES.map((item) => (
            <li key={item.id}>
              <ModulePill item={item} onNavigate={handleSmoothScroll} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default PlatformHero;
