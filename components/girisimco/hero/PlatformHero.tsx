'use client';

import Link from 'next/link';
import {
  Briefcase,
  BrainCircuit,
  Handshake,
  Megaphone,
  Rocket,
  Search,
  Store,
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
    label: 'Ortaklık',
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
    key: 'opportunities',
    label: 'Fırsatlar',
    href: '/market',
    Icon: Megaphone,
    iconClass: 'text-[#0EA5E9]',
    boxClass: 'bg-[#F0F9FF]',
    hoverBorderClass: 'hover:border-[#0EA5E9]/50',
  },
  {
    key: 'solutions',
    label: 'Çözümler',
    href: '/dijital-ai',
    Icon: BrainCircuit,
    iconClass: 'text-[#7C3AED]',
    boxClass: 'bg-[#F5F3FF]',
    hoverBorderClass: 'hover:border-[#7C3AED]/50',
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
            'block font-display text-[12.5px] font-bold tabular-nums leading-none text-[#0B1220] transition-colors dark:text-foreground',
            isLoading && 'animate-pulse text-muted-foreground',
          )}
        >
          {isLoading ? '—' : formatHeroStatCount(counts[stat.key])}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-[#64748B] transition-colors group-hover:text-foreground">
          {stat.label}
        </span>
      </span>
    </Link>
  );
}

/** Editorial how-it-works copy — expands the hero explanation without step chips. */
function HeroHowItWorks() {
  return (
    <div className="mt-3.5 max-w-[32rem] border-l-2 border-[#F59E0B]/70 pl-3.5 sm:pl-4">
      <p className="text-[13px] leading-[1.55] text-[#475569] sm:text-[13.5px]">
        Kariyer, ortaklık, fırsatlar ve çözümler tek yerde.
        Yolunuzu seçin, ilanları inceleyin veya kendi ilanınızı yayınlayın.
      </p>
      <p className="mt-1.5 text-[13px] leading-[1.55] text-[#475569] sm:text-[13.5px]">
        Bağlantı iletişim talebiyle kurulur. İletişim bilgileriniz gizli kalır.
        Sadece fırsatlar, insanlar ve doğru eşleşmeler.
      </p>
    </div>
  );
}

/** Prominent above-the-fold Hero layout: bold copy | large network circle | right stats. */
export function PlatformHero({ className }: { className?: string }) {
  const { counts, isLoading } = useHeroStats();

  return (
    <section
      className={cn(
        'relative flex min-h-0 flex-col justify-center overflow-hidden bg-transparent',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_20%,rgba(251,191,36,0.07),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_80%,rgba(15,23,42,0.03),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex h-full w-full max-w-[1280px] items-center px-5 lg:px-8">
        <div className="grid w-full items-center gap-4 py-2 sm:py-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.2fr)_auto] lg:gap-8 lg:py-2.5">
          <div className="flex max-w-[36rem] flex-col justify-center">
            <h1 className="font-display text-[2rem] font-extrabold leading-[1.08] tracking-tight text-[#0B1220] dark:text-foreground sm:text-[2.4rem] lg:text-[2.75rem]">
              Fikirler <span className="text-[#F59E0B]">Uçuşur,</span>
              <br />
              Fırsatlar Doğar.
            </h1>

            <HeroHowItWorks />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button asChild className="h-10 gap-2 rounded-xl px-5 text-sm font-semibold shadow-none">
                <Link href="/kesfet">
                  <Search className="h-4 w-4" aria-hidden />
                  Fırsatları Keşfet
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-xl border-[#D5D8E0] bg-white px-5 text-sm font-semibold shadow-none hover:bg-[#F7F8FA] dark:bg-card"
              >
                <Link href="/ilan/olustur">İlan Ver</Link>
              </Button>
            </div>
          </div>

          <div className="hidden min-w-0 items-center justify-center sm:flex">
            <HeroNetworkVisual className="w-[min(370px,40dvh)] max-w-none" />
          </div>

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
