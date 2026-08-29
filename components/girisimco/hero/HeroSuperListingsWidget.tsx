'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Coins,
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
  imageUrl?: string;
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
    location: 'İstanbul, TR',
    timeAgo: 'Yeni',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
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
    location: 'Uzaktan, TR',
    timeAgo: '1s önce',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
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
    location: 'İzmir, TR',
    timeAgo: '3s önce',
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80',
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
    location: 'Ankara, TR',
    timeAgo: 'Bugün',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80',
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
    <article
      className={cn(
        'group relative flex w-full flex-col justify-between overflow-hidden rounded-[1.75rem]',
        'border border-slate-200/90 bg-white shadow-sm transition-all duration-300',
        'hover:border-amber-400/80 hover:shadow-xl',
        'dark:border-zinc-800 dark:bg-zinc-900',
        className,
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Üst Görsel Alanı (16:10 Oran, Işıltılı Süper İlan Rozeti & İlerleme Noktaları) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
        <Image
          key={activeItem.id}
          src={activeItem.imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80'}
          alt={activeItem.title}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105 animate-fade-in"
          sizes="300px"
          unoptimized
        />

        {/* Görsel Karartma */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

        {/* Sol Üstte Işıltılı Süper İlan Rozeti (Görsel İçi) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-black/65 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/15 shadow-md">
            <Sparkles className="h-3 w-3 fill-amber-400 text-amber-400 animate-pulse" />
            <span>Süper İlan</span>
          </span>
        </div>

        {/* Sağ Üstte 5 Saniyelik Nokta İndikatörü */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-2 py-1 border border-white/10">
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
                i === activeIndex ? 'w-3.5 bg-amber-400' : 'w-1.5 bg-white/50 hover:bg-white',
              )}
              aria-label={`İlan ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Kart Gövdesi */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* Görsel Altı Rozet Satırı (Kategori & Doğrulanmış Rozeti) */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold"
            style={{
              backgroundColor: `${activeItem.accentColor}18`,
              color: activeItem.accentColor,
            }}
          >
            <CategoryIcon className="h-3 w-3" />
            <span>{activeItem.category}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 dark:bg-zinc-800 text-white text-[10.5px] font-bold shadow-2xs">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            Doğrulanmış
          </span>
        </div>

        {/* İlan Başlığı */}
        <Link href={activeItem.href} className="group/title block mt-2">
          <h4 className="line-clamp-2 font-display text-[13.5px] font-bold leading-snug text-slate-900 dark:text-white transition-colors group-hover/title:text-amber-600 dark:group-hover/title:text-amber-400">
            {activeItem.title}
          </h4>
        </Link>

        {/* Şirket / Yayıncı Satırı */}
        {activeItem.companyName ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600">
              <Building2 className="h-3 w-3 text-slate-500" />
            </div>
            <span className="truncate">{activeItem.companyName}</span>
          </div>
        ) : null}

        {/* 3. Alt Metadata Yığını & Kontroller */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-end justify-between gap-2">
          {/* Sol: Değerleme/Fiyat ve Lokasyon */}
          <div className="flex flex-col gap-0.5 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            {activeItem.priceOrBudget ? (
              <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-zinc-100">
                <Coins className="h-3 w-3 text-amber-500 shrink-0" />
                <span className="truncate">{activeItem.priceOrBudget}</span>
              </span>
            ) : null}
            {activeItem.location && (
              <span className="inline-flex items-center gap-0.5 text-[10.5px]">
                <MapPin className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[90px]">{activeItem.location}</span>
              </span>
            )}
          </div>

          {/* Sağ: Ok Kontrolleri & Siyah İncele Butonu */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrev}
                className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Önceki"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Sonraki"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <Link
              href={activeItem.href}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-[11px] font-black shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <span>İncele</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
