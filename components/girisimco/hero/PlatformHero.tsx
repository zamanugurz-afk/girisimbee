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
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import {
  formatHeroStatCount,
  useHeroStats,
  type HeroStatKey,
  type HeroStatsCounts,
} from '@/features/home/hooks/use-hero-stats';
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
    targetScrollId: '#market-section',
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
    description: '25 sektörde m², kira peşinatı, kilitli yasal zorunluluklar, demirbaşlar, açılış emtiası ve ERP lisans maliyetlerini saniyeler içinde simüle et.',
    primaryBtn: { label: 'İş Kurma Asistanı', href: '#assistant-section', icon: 'Calculator', style: 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs' },
    secondaryBtn: { label: 'Örnek Fizibilite Gör', href: '#assistant-section' },
    targetScrollId: '#assistant-section',
  },
];

const HERO_SIDEBAR_STATS: {
  key: HeroStatKey;
  label: string;
  href: string;
  Icon: LucideIcon;
  iconClass: string;
  boxClass: string;
  hoverBorderClass: string;
}[] = [
  {
    key: 'total',
    label: 'Toplam İlan',
    href: '/kesfet',
    Icon: Rocket,
    iconClass: 'text-[#3B82F6]',
    boxClass: 'bg-[#EFF6FF]',
    hoverBorderClass: 'hover:border-[#3B82F6]/50',
  },
  {
    key: 'jobs',
    label: 'Kariyer',
    href: '/is',
    Icon: Briefcase,
    iconClass: 'text-[#EA580C]',
    boxClass: 'bg-[#FFF7ED]',
    hoverBorderClass: 'hover:border-[#EA580C]/50',
  },
  {
    key: 'partners',
    label: 'Ortaklık ve Devir',
    href: '/girisim-ortaklik',
    Icon: Handshake,
    iconClass: 'text-[#DB2777]',
    boxClass: 'bg-[#FDF2F8]',
    hoverBorderClass: 'hover:border-[#DB2777]/50',
  },
  {
    key: 'franchise',
    label: 'Franchise',
    href: '/franchise/buy',
    Icon: Store,
    iconClass: 'text-[#C026D3]',
    boxClass: 'bg-[#FDF4FF]',
    hoverBorderClass: 'hover:border-[#C026D3]/50',
  },
  {
    key: 'services',
    label: 'Ustalar ve Hizmetler',
    href: '/kategori/hizmetler',
    Icon: Wrench,
    iconClass: 'text-[#6366F1]',
    boxClass: 'bg-[#EEF2FF]',
    hoverBorderClass: 'hover:border-[#6366F1]/50',
  },
  {
    key: 'opportunities',
    label: 'Market ve Fırsatlar',
    href: '/market',
    Icon: Megaphone,
    iconClass: 'text-[#0EA5E9]',
    boxClass: 'bg-[#F0F9FF]',
    hoverBorderClass: 'hover:border-[#0EA5E9]/50',
  },
];

function StatPill({
  stat,
  counts,
  isLoading,
}: {
  stat: (typeof HERO_SIDEBAR_STATS)[number];
  counts: HeroStatsCounts;
  isLoading: boolean;
}) {
  return (
    <Link
      href={stat.href}
      className={cn(
        'group flex items-center gap-2.5 rounded-xl border border-[#E6E8EE] bg-white/95 px-3 py-1.5',
        'shadow-[0_1px_3px_rgba(15,23,42,0.04)] backdrop-blur-sm',
        'cursor-pointer transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:-translate-y-0.5',
        'dark:border-border dark:bg-card',
        stat.hoverBorderClass,
      )}
      aria-label={`${stat.label}: ${isLoading ? 'Yükleniyor' : formatHeroStatCount(counts[stat.key])}`}
    >
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-105',
          stat.boxClass,
        )}
        aria-hidden
      >
        <stat.Icon className={cn('h-3.5 w-3.5', stat.iconClass)} strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            'block font-display text-[13.5px] font-bold tabular-nums leading-none text-[#0B1220] transition-colors dark:text-foreground',
            isLoading && 'animate-pulse text-muted-foreground',
          )}
        >
          {isLoading ? '—' : formatHeroStatCount(counts[stat.key])}
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] font-medium text-[#64748B] transition-colors group-hover:text-foreground">
          {stat.label}
        </span>
      </span>
    </Link>
  );
}

export function PlatformHero({ className }: { className?: string }) {
  const { counts, isLoading } = useHeroStats();
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
                {/* Aktif Slayt Rozeti */}
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs w-fit transition-colors',
                    activeSlide.badgeColor,
                  )}
                >
                  {activeSlide.badge}
                </div>

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

          {/* SAĞ SÜTUN: CANLI İSTATİSTİK SAYAÇLARI */}
          <div className="hidden justify-end xl:flex">
            <ul
              className="flex w-[12rem] flex-col gap-1.5"
              aria-label="Platform istatistikleri"
            >
              {HERO_SIDEBAR_STATS.map((stat) => (
                <li key={stat.key}>
                  <StatPill stat={stat} counts={counts} isLoading={isLoading} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* MOBİL VE TABLET İÇİN ALT İSTATİSTİK KARTLARI */}
      <div className="relative border-t border-[#EEF0F4] px-5 pb-1.5 pt-1.5 xl:hidden lg:px-8">
        <ul
          className="mx-auto grid max-w-[1280px] grid-cols-2 gap-1.5 sm:grid-cols-3"
          aria-label="Platform istatistikleri"
        >
          {HERO_SIDEBAR_STATS.map((stat) => (
            <li key={stat.key}>
              <StatPill stat={stat} counts={counts} isLoading={isLoading} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default PlatformHero;
