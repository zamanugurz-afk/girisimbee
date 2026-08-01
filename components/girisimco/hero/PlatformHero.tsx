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

const HERO_HEIGHT = 720;

const ORBIT_VISUAL_CLASS =
  'relative mx-auto aspect-square h-full max-h-[min(500px,100%)] w-full max-w-[500px] overflow-visible';

const CANVAS = 580;
const CX = CANVAS / 2;
const CY = CANVAS / 2;

const centerLeftPct = (CX / CANVAS) * 100;
const centerTopPct = (CY / CANVAS) * 100;
const ROCKET_HALF_H = 80;

const ORBIT_RINGS = [
  { radius: 228, stroke: 'rgba(99, 102, 241, 0.22)', dash: '6 10', duration: 90 },
  { radius: 188, stroke: 'rgba(129, 140, 248, 0.18)', dash: '4 8', duration: 70 },
  { radius: 148, stroke: 'rgba(99, 102, 241, 0.14)', dash: '3 7', duration: 55 },
] as const;

const ORBIT_LABELS = [
  { label: 'Girişimciler', angle: -90 },
  { label: 'Yatırımcılar', angle: 0 },
  { label: 'İş Fırsatları', angle: 90 },
  { label: 'Franchising', angle: 180 },
] as const;

const ORBIT_PARTICLES = [
  { ring: 0, angle: 20, size: 10, color: '#6366f1' },
  { ring: 0, angle: 140, size: 8, color: '#60a5fa' },
  { ring: 1, angle: 60, size: 9, color: '#8b5cf6' },
  { ring: 1, angle: 200, size: 7, color: '#3b82f6' },
  { ring: 1, angle: 310, size: 8, color: '#818cf8' },
  { ring: 2, angle: 100, size: 6, color: '#6366f1' },
  { ring: 2, angle: 250, size: 7, color: '#38bdf8' },
] as const;

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function RocketSvg() {
  return (
    <svg
      width="120"
      height="160"
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_12px_32px_rgba(99,102,241,0.45)]"
    >
      <defs>
        <linearGradient id="hero-rocket-body" x1="60" y1="8" x2="60" y2="132" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a5b4fc" />
          <stop offset="0.45" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="hero-rocket-fin" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <path d="M28 108 L8 138 L32 124 Z" fill="url(#hero-rocket-fin)" />
      <path d="M92 108 L112 138 L88 124 Z" fill="url(#hero-rocket-fin)" />
      <path
        d="M60 12 C44 12 36 28 36 52 L36 108 C36 118 46 124 60 124 C74 124 84 118 84 108 L84 52 C84 28 76 12 60 12 Z"
        fill="url(#hero-rocket-body)"
      />
      <circle cx="60" cy="58" r="14" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="2" />
      <circle cx="60" cy="58" r="9" fill="#818cf8" opacity="0.35" />
      <path d="M60 12 C52 12 46 20 44 32 L76 32 C74 20 68 12 60 12 Z" fill="#818cf8" />
    </svg>
  );
}

function RocketFlameSvg() {
  return (
    <svg width="40" height="54" viewBox="0 0 52 72" fill="none" aria-hidden className="block">
      <defs>
        <linearGradient id="hero-flame-outer" x1="26" y1="0" x2="26" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c" />
          <stop offset="0.55" stopColor="#f97316" />
          <stop offset="1" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hero-flame-mid" x1="26" y1="4" x2="26" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde047" />
          <stop offset="0.5" stopColor="#fb923c" />
          <stop offset="1" stopColor="#fb923c" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hero-flame-core" x1="26" y1="6" x2="26" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#fef08a" />
          <stop offset="1" stopColor="#fef08a" stopOpacity="0" />
        </linearGradient>
        <filter id="hero-flame-glow" x="-50%" y="-20%" width="200%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Outer exhaust plume */}
      <path
        d="M26 2 C20 10 14 22 12 36 C10 50 14 62 26 68 C38 62 42 50 40 36 C38 22 32 10 26 2 Z"
        fill="url(#hero-flame-outer)"
        opacity="0.85"
        filter="url(#hero-flame-glow)"
      />
      {/* Side thrust wisps */}
      <path
        d="M18 8 C14 18 12 28 13 38 C14 46 16 52 18 54 C16 44 16 32 18 20 Z"
        fill="#f97316"
        opacity="0.35"
      />
      <path
        d="M34 8 C38 18 40 28 39 38 C38 46 36 52 34 54 C36 44 36 32 34 20 Z"
        fill="#f97316"
        opacity="0.35"
      />
      {/* Mid flame */}
      <path
        d="M26 6 C22 14 18 24 17 34 C16 44 19 54 26 58 C33 54 36 44 35 34 C34 24 30 14 26 6 Z"
        fill="url(#hero-flame-mid)"
      />
      {/* Hot core */}
      <path
        d="M26 10 C23 16 21 24 20 30 C19 36 21 42 26 44 C31 42 33 36 32 30 C31 24 29 16 26 10 Z"
        fill="url(#hero-flame-core)"
      />
      {/* Nozzle glow */}
      <ellipse cx="26" cy="6" rx="10" ry="3" fill="#fef08a" opacity="0.9" />
    </svg>
  );
}

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
    <ul className="flex w-[200px] flex-col gap-2.5" aria-label="Platform istatistikleri">
      {HERO_STATS.map((stat, index) => (
        <motion.li
          key={stat.key}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.12 + index * 0.06, ease: 'easeOut' }}
          className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white/95 px-3 py-2.5 shadow-[0_6px_20px_-8px_rgba(15,23,42,0.14)] backdrop-blur-sm"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.tint}`}
          >
            <stat.Icon className={`h-[18px] w-[18px] ${stat.iconColor}`} strokeWidth={2} aria-hidden />
          </span>
          <span className="min-w-0 leading-tight">
            <span
              className={`block text-base font-bold tracking-tight text-foreground tabular-nums ${
                isLoading ? 'animate-pulse text-muted-foreground' : ''
              }`}
            >
              {isLoading ? '—' : formatHeroStatCount(counts[stat.key])}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">{stat.label}</span>
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

function HeroOrbitVisual() {
  const labelOrbitDuration = 80;

  return (
    <div className={ORBIT_VISUAL_CLASS} aria-hidden>
      {/* Soft purple glow — orbit center */}
      <div
        className="pointer-events-none absolute h-[380px] w-[380px] rounded-full bg-[#7c6cff]/25 blur-[90px]"
        style={{
          left: `${centerLeftPct}%`,
          top: `${centerTopPct}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Three orbit lines + moving particles */}
      {ORBIT_RINGS.map((ring, ringIndex) => (
        <motion.div
          key={ring.radius}
          className="pointer-events-none absolute inset-0"
          style={{ transformOrigin: `${(CX / CANVAS) * 100}% ${(CY / CANVAS) * 100}%` }}
          animate={{ rotate: 360 }}
          transition={{ duration: ring.duration, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox={`0 0 ${CANVAS} ${CANVAS}`} className="absolute inset-0 h-full w-full">
            <circle
              cx={CX}
              cy={CY}
              r={ring.radius}
              fill="none"
              stroke={ring.stroke}
              strokeWidth="1"
              strokeDasharray={ring.dash}
            />
          </svg>

          {ORBIT_PARTICLES.filter((p) => p.ring === ringIndex).map((particle) => {
            const { x, y } = polar(particle.angle, ring.radius);
            return (
              <motion.div
                key={`${ringIndex}-${particle.angle}`}
                className="absolute rounded-full"
                style={{
                  left: `${(x / CANVAS) * 100}%`,
                  top: `${(y / CANVAS) * 100}%`,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 12px ${particle.color}88`,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 2 + ringIndex * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: particle.angle / 360,
                }}
              />
            );
          })}
        </motion.div>
      ))}

      {/* Rotating labels on outer orbit */}
      <motion.div
        className="pointer-events-none absolute inset-0 origin-center"
        style={{ transformOrigin: `${(CX / CANVAS) * 100}% ${(CY / CANVAS) * 100}%` }}
        animate={{ rotate: 360 }}
        transition={{ duration: labelOrbitDuration, repeat: Infinity, ease: 'linear' }}
      >
        {ORBIT_LABELS.map((item) => {
          const { x, y } = polar(item.angle, ORBIT_RINGS[0].radius + 36);
          return (
            <div
              key={item.label}
              className="absolute"
              style={{
                left: `${(x / CANVAS) * 100}%`,
                top: `${(y / CANVAS) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: labelOrbitDuration, repeat: Infinity, ease: 'linear' }}
              >
                <span className="whitespace-nowrap rounded-full border border-white/90 bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-foreground shadow-[0_4px_18px_-6px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                  {item.label}
                </span>
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* Center rocket + flame — orbit center */}
      <div
        className="absolute z-30"
        style={{
          left: `${centerLeftPct}%`,
          top: `${centerTopPct}%`,
          transform: 'translate(-50%, 0)',
        }}
      >
        <motion.div
          className="flex w-[120px] flex-col items-center"
          style={{ marginTop: -ROCKET_HALF_H }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <RocketSvg />

          {/* Rocket exhaust flame */}
          <motion.div
            className="pointer-events-none -mt-8 flex w-full justify-center"
            style={{ transformOrigin: '50% 0%' }}
            animate={{
              scaleY: [0.85, 1.1, 0.92, 1.05, 0.85],
              scaleX: [1, 0.94, 1.06, 0.98, 1],
              opacity: [0.75, 1, 0.85, 0.95, 0.75],
            }}
            transition={{
              duration: 0.35,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <RocketFlameSvg />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export function PlatformHero() {
  return (
    <section className="relative border-b border-border/60">
      <div className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-br from-[#6366f1]/[0.07] via-transparent to-[#818cf8]/[0.04]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden gc-dot-grid opacity-20" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* Stats pinned to the far right of the page content (Franchise edge) */}
        <aside
          className="absolute top-1/2 right-5 z-40 hidden w-[200px] -translate-y-1/2 lg:block lg:right-8"
          aria-label="Platform istatistikleri"
        >
          <HeroStatsColumn />
        </aside>

        <div
          className="grid h-[720px] items-center gap-8 lg:grid-cols-[42fr_58fr] lg:gap-8"
          style={{ minHeight: HERO_HEIGHT }}
        >
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-[2rem] font-bold leading-[1.15] tracking-tight text-foreground sm:text-[2.35rem] lg:text-[2.65rem]">
              Doğru kişilerle,
              <br />
              doğru fırsatta
              <br />
              buluşun.
            </h1>
            <p className="mt-5 max-w-md text-gc-md leading-relaxed text-muted-foreground">
              Girişimco; girişimciler, yatırımcılar, iş arayanlar ve işverenlerin ilan paylaştığı,
              birbirini keşfettiği bir platformdur.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="shadow-md">
                <Link href="/kesfet">
                  <Search className="mr-2 h-4 w-4" aria-hidden />
                  Fırsatları Keşfet
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/ilan/olustur">İlan Ver</Link>
              </Button>
            </div>
          </div>

          {/* Orbit stays in the middle-right; right padding clears the stats strip */}
          <div className="flex h-full min-h-[420px] items-center justify-center lg:min-h-0 lg:justify-start lg:pl-4 lg:pr-[232px]">
            <HeroOrbitVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
