'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Handshake,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeroSuperListingItem {
  id: string;
  title: string;
  category: string;
  categoryIcon: LucideIcon;
  companyName?: string;
  priceOrBudget?: string;
  location?: string;
  timeAgo?: string;
  href: string;
  accentColor: string;
}

const DEFAULT_SUPER_LISTINGS: HeroSuperListingItem[] = [
  {
    id: 'super-1',
    title: 'Seed Turu Arayan Yapay Zeka SaaS Girişimi',
    category: 'Girişim & Yatırım',
    categoryIcon: Rocket,
    companyName: 'ScaleUp AI Labs',
    priceOrBudget: '₺1.5M Yatırım',
    location: 'İstanbul',
    timeAgo: 'Yeni',
    href: '/kesfet',
    accentColor: '#F59E0B',
  },
  {
    id: 'super-2',
    title: 'Senior Full-Stack & AI Engineer Ortaklığı',
    category: 'Kariyer & CTO',
    categoryIcon: Briefcase,
    companyName: 'FinTech Solutions',
    priceOrBudget: 'Hisse + Maaş',
    location: 'Uzaktan',
    timeAgo: '1 saat önce',
    href: '/is',
    accentColor: '#3B82F6',
  },
  {
    id: 'super-3',
    title: 'B2B Lojistik & Dağıtım Stratejik İş Ortaklığı',
    category: 'Ortaklık & Devir',
    categoryIcon: Handshake,
    companyName: 'LogiConnect TR',
    priceOrBudget: '%25 Ortaklık',
    location: 'İzmir',
    timeAgo: '3 saat önce',
    href: '/girisim-ortaklik',
    accentColor: '#10B981',
  },
  {
    id: 'super-4',
    title: 'Kurumsal Dijital Pazarlama ve Büyüme Çözümü',
    category: 'Çözümler & Reklam',
    categoryIcon: Sparkles,
    companyName: 'GrowthBee Studio',
    priceOrBudget: 'Özel Fiyat',
    location: 'Ankara',
    timeAgo: 'Bugün',
    href: '/market',
    accentColor: '#8B5CF6',
  },
];

export function HeroSuperListingsWidget({
  items = DEFAULT_SUPER_LISTINGS,
  className,
}: {
  items?: HeroSuperListingItem[];
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [items.length, isPaused]);

  const activeItem = items[activeIndex] || items[0];
  const CategoryIcon = activeItem.categoryIcon || Sparkles;

  const handlePrev = () => {
    setIsPaused(true);
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    setTimeout(() => setIsPaused(false), 8000);
  };

  const handleNext = () => {
    setIsPaused(true);
    setActiveIndex((prev) => (prev + 1) % items.length);
    setTimeout(() => setIsPaused(false), 8000);
  };

  return (
    <div
      className={cn(
        'group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl',
        'border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-md transition-all duration-300',
        'hover:border-amber-400/80 hover:shadow-lg hover:shadow-amber-500/10',
        'dark:border-zinc-800 dark:bg-zinc-900/95',
        className,
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient Top Glow */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-amber-500/15 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <div>
        {/* Top Header: Glowing Super Badge + Pagination Dots */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] uppercase tracking-wider">
              <Sparkles className="h-3 w-3 fill-amber-500 text-amber-500" />
              Süper İlan
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setActiveIndex(i);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 8000);
                }}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === activeIndex
                    ? 'w-4 bg-amber-500'
                    : 'w-1.5 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300',
                )}
                aria-label={`İlan ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Active Item Content (Smooth Fade) */}
        <div key={activeItem.id} className="pt-3 animate-fade-in">
          {/* Category Pill + Verified Tag */}
          <div className="flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
              style={{
                backgroundColor: `${activeItem.accentColor}15`,
                color: activeItem.accentColor,
              }}
            >
              <CategoryIcon className="h-3 w-3" />
              <span>{activeItem.category}</span>
            </span>

            <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              Doğrulanmış
            </span>
          </div>

          {/* Title */}
          <Link href={activeItem.href} className="group/title block mt-2">
            <h4 className="line-clamp-2 font-display text-[13.5px] font-bold leading-snug text-slate-900 dark:text-white transition-colors group-hover/title:text-amber-600 dark:group-hover/title:text-amber-400">
              {activeItem.title}
            </h4>
          </Link>

          {/* Company Name */}
          {activeItem.companyName ? (
            <div className="mt-1 flex items-center gap-1 text-[11.5px] font-semibold text-slate-600 dark:text-zinc-400">
              <Building2 className="h-3 w-3 text-slate-400" />
              <span className="truncate">{activeItem.companyName}</span>
            </div>
          ) : null}

          {/* Budget & Meta Tag Row */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            {activeItem.priceOrBudget ? (
              <span className="inline-flex items-center rounded-md px-2 py-0.5 font-display text-[11.5px] font-black border border-amber-300/80 bg-amber-50 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
                {activeItem.priceOrBudget}
              </span>
            ) : <span />}

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
              {activeItem.location && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" />
                  <span>{activeItem.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls Strip: Arrow Controls + Prominent Action Button */}
      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/80 pt-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Önceki İlan"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Sonraki İlan"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <Link
          href={activeItem.href}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-black shadow-2xs hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-400 transition-all hover:scale-105 active:scale-95"
        >
          <span>İncele</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
