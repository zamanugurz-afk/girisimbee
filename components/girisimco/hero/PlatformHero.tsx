'use client';

import Link from 'next/link';
import { Briefcase, Handshake, Rocket, Search, Store, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  formatHeroStatCount,
  useHeroStats,
  type HeroStatKey,
} from '@/features/home/hooks/use-hero-stats';
import { HERO_ORBIT_THEME } from '@/components/girisimco/hero/hero-orbit-theme';
import { HeroOrbitVisualGalaxy } from '@/components/girisimco/hero/hero-orbit-galaxy';
import { HeroOrbitVisualBee } from '@/components/girisimco/hero/hero-orbit-bee';
import { cn } from '@/lib/utils';

const HERO_STATS: {
  key: HeroStatKey;
  label: string;
  Icon: LucideIcon;
  tint: string;
  iconColor: string;
}[] = [
  {
    key: 'total',
    label: 'Toplam İlan',
    Icon: Rocket,
    tint: 'bg-[#EFF6FF]',
    iconColor: 'text-[#3B82F6]',
  },
  {
    key: 'entrepreneurs',
    label: 'Girişimci',
    Icon: UserRound,
    tint: 'bg-[#ECFDF5]',
    iconColor: 'text-[#10B981]',
  },
  {
    key: 'investors',
    label: 'Yatırımcı',
    Icon: UserRound,
    tint: 'bg-[#F5F3FF]',
    iconColor: 'text-[#8B5CF6]',
  },
  {
    key: 'jobs',
    label: 'İş Fırsatı',
    Icon: Briefcase,
    tint: 'bg-[#FFF7ED]',
    iconColor: 'text-[#F97316]',
  },
  {
    key: 'partners',
    label: 'Ortaklık',
    Icon: Handshake,
    tint: 'bg-[#FDF2F8]',
    iconColor: 'text-[#EC4899]',
  },
  {
    key: 'franchise',
    label: 'Franchise',
    Icon: Store,
    tint: 'bg-[#FDF2F8]',
    iconColor: 'text-[#DB2777]',
  },
];

function HeroStatsColumn() {
  const { counts, isLoading } = useHeroStats();

  return (
    <ul className="flex w-[176px] flex-col gap-1.5" aria-label="Platform istatistikleri">
      {HERO_STATS.map((stat, index) => (
        <motion.li
          key={stat.key}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.08 + index * 0.04, ease: 'easeOut' }}
          className="flex items-center gap-2 rounded-xl border border-border/70 bg-white/95 px-2.5 py-1.5 shadow-[0_4px_14px_-8px_rgba(15,23,42,0.12)] backdrop-blur-sm"
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${stat.tint}`}
          >
            <stat.Icon className={`h-3.5 w-3.5 ${stat.iconColor}`} strokeWidth={2} aria-hidden />
          </span>
          <span className="min-w-0 leading-tight">
            <span
              className={`block text-sm font-bold tracking-tight text-foreground tabular-nums ${
                isLoading ? 'animate-pulse text-muted-foreground' : ''
              }`}
            >
              {isLoading ? '—' : formatHeroStatCount(counts[stat.key])}
            </span>
            <span className="block truncate text-[10px] text-muted-foreground">{stat.label}</span>
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

function HeroOrbitVisual() {
  if (HERO_ORBIT_THEME === 'galaxy') {
    return <HeroOrbitVisualGalaxy />;
  }
  return <HeroOrbitVisualBee />;
}

export function PlatformHero({ className }: { className?: string }) {
  return (
    <section className={cn('relative flex min-h-0 flex-1 flex-col', className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-br from-[#6366f1]/[0.07] via-transparent to-[#818cf8]/[0.04]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden gc-dot-grid opacity-20" />

      <div className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-5 lg:px-8">
        <aside
          className="absolute top-1/2 right-5 z-40 hidden -translate-y-1/2 lg:block lg:right-8"
          aria-label="Platform istatistikleri"
        >
          <HeroStatsColumn />
        </aside>

        <div className="grid min-h-0 flex-1 items-center gap-4 py-3 lg:grid-cols-[40fr_60fr] lg:gap-6 lg:py-4">
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-[1.65rem] font-bold leading-[1.12] tracking-tight text-foreground sm:text-[1.95rem] lg:text-[2.15rem]">
              Doğru kişilerle,
              <br />
              doğru fırsatta
              <br />
              buluşun.
            </h1>
            <p className="mt-3 max-w-md text-gc-sm leading-relaxed text-muted-foreground sm:text-gc-base">
              GirisimBee; girişimciler, yatırımcılar, iş arayanlar ve işverenlerin ilan paylaştığı,
              birbirini keşfettiği bir platformdur.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Button asChild size="default" className="shadow-md sm:h-11 sm:px-6">
                <Link href="/kesfet">
                  <Search className="mr-2 h-4 w-4" aria-hidden />
                  Fırsatları Keşfet
                </Link>
              </Button>
              <Button asChild variant="outline" size="default" className="sm:h-11 sm:px-6">
                <Link href="/ilan/olustur">İlan Ver</Link>
              </Button>
            </div>
          </div>

          <div className="hidden h-full min-h-0 items-center justify-center sm:flex lg:justify-start lg:pl-2 lg:pr-[200px]">
            <div className="flex h-full max-h-[min(380px,46vh)] w-full items-center justify-center">
              <HeroOrbitVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
