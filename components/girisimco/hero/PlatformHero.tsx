'use client';

import Link from 'next/link';
import {
  Briefcase,
  Handshake,
  Rocket,
  Search,
  Store,
  UserRound,
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

const HERO_SIDEBAR_STATS: {
  key: HeroStatKey;
  label: string;
  Icon: LucideIcon;
  iconClass: string;
  boxClass: string;
}[] = [
  {
    key: 'total',
    label: 'Toplam İlan',
    Icon: Rocket,
    iconClass: 'text-[#3B82F6]',
    boxClass: 'bg-[#EFF6FF]',
  },
  {
    key: 'entrepreneurs',
    label: 'Girişimci',
    Icon: UserRound,
    iconClass: 'text-[#16A34A]',
    boxClass: 'bg-[#F0FDF4]',
  },
  {
    key: 'investors',
    label: 'Yatırımcı',
    Icon: UserRound,
    iconClass: 'text-[#7C3AED]',
    boxClass: 'bg-[#F5F3FF]',
  },
  {
    key: 'jobs',
    label: 'İş Fırsatı',
    Icon: Briefcase,
    iconClass: 'text-[#EA580C]',
    boxClass: 'bg-[#FFF7ED]',
  },
  {
    key: 'partners',
    label: 'Ortaklık',
    Icon: Handshake,
    iconClass: 'text-[#DB2777]',
    boxClass: 'bg-[#FDF2F8]',
  },
  {
    key: 'franchise',
    label: 'Franchise İlanları',
    Icon: Store,
    iconClass: 'text-[#C026D3]',
    boxClass: 'bg-[#FDF4FF]',
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
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border border-[#E6E8EE] bg-white/90 px-2.5 py-1.5',
        'shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur-sm',
        'dark:border-border dark:bg-card',
      )}
    >
      <span
        className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', stat.boxClass)}
        aria-hidden
      >
        <stat.Icon className={cn('h-3.5 w-3.5', stat.iconClass)} strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            'block font-display text-[13px] font-bold tabular-nums leading-none text-[#0B1220] dark:text-foreground',
            isLoading && 'animate-pulse text-muted-foreground',
          )}
        >
          {isLoading ? '—' : formatHeroStatCount(counts[stat.key])}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-[#64748B]">{stat.label}</span>
      </span>
    </div>
  );
}

/** Editorial how-it-works copy — expands the hero explanation without step chips. */
function HeroHowItWorks() {
  return (
    <div className="mt-4 max-w-[30rem] border-l-2 border-[#F59E0B]/70 pl-3.5 sm:pl-4">
      <p className="text-[13px] leading-[1.65] text-[#475569] sm:text-[14px]">
        Yatırım, ortaklık, iş, franchise ve dijital çözümler için doğru fırsatı tek yerde bul.
        İlanları keşfet, detaylarını incele ve doğrudan ilan sahibiyle iletişime geç.
      </p>
      <p className="mt-2.5 text-[13px] leading-[1.65] text-[#475569] sm:text-[14px]">
        Aracı yok. Gereksiz bekleme yok.
        <br />
        Sadece fırsatlar, insanlar ve doğru bağlantılar.
      </p>
    </div>
  );
}

/** Locked layout: copy | network circle | right stats. Only chrome/copy polish. */
export function PlatformHero({ className }: { className?: string }) {
  const { counts, isLoading } = useHeroStats();

  return (
    <section
      className={cn(
        'relative flex min-h-0 flex-col justify-center overflow-hidden bg-[#FAFBFC] dark:bg-background',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_20%,rgba(251,191,36,0.07),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_80%,rgba(15,23,42,0.03),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex h-full w-full max-w-[1280px] items-center px-5 lg:px-8">
        <div className="grid w-full items-center gap-4 py-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)_auto] lg:gap-5 lg:py-4">
          <div className="flex max-w-[34rem] flex-col justify-center">
            <h1 className="font-display text-[1.85rem] font-extrabold leading-[1.05] tracking-tight text-[#0B1220] dark:text-foreground sm:text-[2.4rem] lg:text-[2.7rem]">
              Fikirler <span className="text-[#F59E0B]">Uçuşur,</span>
              <br />
              Fırsatlar Doğar.
            </h1>

            <HeroHowItWorks />

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Button asChild className="h-10 gap-1.5 rounded-xl px-5 shadow-none">
                <Link href="/kesfet">
                  <Search className="h-4 w-4" aria-hidden />
                  Fırsatları Keşfet
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-xl border-[#D5D8E0] bg-white px-5 shadow-none hover:bg-[#F7F8FA] dark:bg-card"
              >
                <Link href="/ilan/olustur">İlan Ver</Link>
              </Button>
            </div>
          </div>

          <div className="hidden min-w-0 items-center justify-center sm:flex">
            <HeroNetworkVisual className="w-[min(400px,46dvh)] max-w-none" />
          </div>

          <div className="hidden justify-end xl:flex">
            <ul
              className="flex w-[12.25rem] flex-col gap-1.5"
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

      <div className="relative border-t border-[#EEF0F4] px-5 pb-3 pt-2 xl:hidden lg:px-8">
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
