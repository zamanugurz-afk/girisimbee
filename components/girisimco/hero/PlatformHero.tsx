'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HERO_HEIGHT = 720;

const CANVAS = 580;
const centerX = CANVAS / 2;
const centerY = CANVAS / 2;

const centerDiameter = 140;
const centerRadius = centerDiameter / 2;

const outerRingRadius = 248;
const innerRingRadius = 178;
const stepCardRadius = innerRingRadius + 32;

const STEPS = [
  { step: 1, angle: -90, title: 'Yolunuzu seçin' },
  { step: 2, angle: 30, title: 'İletişime geçin' },
  { step: 3, angle: 150, title: 'Eşleşin ve ilerleyin' },
] as const;

const OUTER_LABELS = [
  { label: 'Girişimciler', angle: -90 },
  { label: 'Yatırımcılar', angle: 0 },
  { label: 'İş Arayanlar', angle: 45 },
  { label: 'İş Verenler', angle: 135 },
  { label: 'Ortak Arayanlar', angle: 180 },
] as const;

const STEP_W = 156;
const STEP_H = 48;
const LABEL_W = 108;
const LABEL_H = 30;

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(rad),
    y: centerY + radius * Math.sin(rad),
  };
}

function ringArc(r: number, fromAngle: number, toAngle: number) {
  const from = polar(fromAngle, r);
  const to = polar(toAngle, r);
  return `M ${from.x} ${from.y} A ${r} ${r} 0 0 1 ${to.x} ${to.y}`;
}

function processPath() {
  return [
    ringArc(innerRingRadius, STEPS[0].angle, STEPS[1].angle),
    ringArc(innerRingRadius, STEPS[1].angle, STEPS[2].angle),
    ringArc(innerRingRadius, STEPS[2].angle, STEPS[0].angle),
  ].join(' ');
}

function HeroOrbitVisual() {
  return (
    <svg
      viewBox={`0 0 ${CANVAS} ${CANVAS}`}
      className="mx-auto h-full max-h-[min(580px,100%)] w-full max-w-[580px] overflow-visible"
      aria-hidden
    >
      <defs>
        <radialGradient id="platform-hero-hub" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="55%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </radialGradient>
        <filter id="platform-hero-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#6366f1" floodOpacity="0.35" />
        </filter>
        <marker id="platform-hero-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 Z" fill="#6366f1" />
        </marker>
      </defs>

      <g
        className="origin-center animate-[spin_100s_linear_infinite]"
        style={{ transformOrigin: `${centerX}px ${centerY}px` }}
      >
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRingRadius}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="12 14"
          opacity={0.35}
        />
      </g>

      <circle
        cx={centerX}
        cy={centerY}
        r={innerRingRadius}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2.5"
        opacity={0.4}
      />

      <path
        d={processPath()}
        fill="none"
        stroke="#6366f1"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="18 12"
        className="animate-dash"
        markerMid="url(#platform-hero-arrow)"
        markerEnd="url(#platform-hero-arrow)"
      />

      {OUTER_LABELS.map((item) => {
        const { x, y } = polar(item.angle, outerRingRadius);
        return (
          <foreignObject
            key={item.label}
            x={x - LABEL_W / 2}
            y={y - LABEL_H / 2}
            width={LABEL_W}
            height={LABEL_H}
            className="overflow-visible"
          >
      <div
        className={cn(
                'flex h-full items-center justify-center whitespace-nowrap rounded-full',
                'border border-white/90 bg-white/95 px-3 text-[10px] font-semibold text-foreground',
                'shadow-[0_4px_18px_-6px_rgba(15,23,42,0.12)] backdrop-blur-sm',
                'transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_24px_-8px_rgba(99,102,241,0.35)]',
              )}
            >
              {item.label}
            </div>
          </foreignObject>
        );
      })}

      {STEPS.map((item) => {
        const { x, y } = polar(item.angle, stepCardRadius);
        return (
          <foreignObject
            key={item.step}
            x={x - STEP_W / 2}
            y={y - STEP_H / 2}
            width={STEP_W}
            height={STEP_H}
            className="overflow-visible"
          >
      <div
        className={cn(
                'group flex h-full items-center gap-2.5 rounded-2xl border border-white/90 bg-white/95 px-3',
                'shadow-[0_4px_20px_-6px_rgba(15,23,42,0.12)] backdrop-blur-sm',
                'transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_10px_28px_-8px_rgba(99,102,241,0.38)]',
              )}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6366f1] text-[11px] font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                {item.step}
              </span>
              <span className="text-[11px] font-semibold leading-tight text-foreground">{item.title}</span>
            </div>
          </foreignObject>
        );
      })}

      <circle
        cx={centerX}
        cy={centerY}
        r={centerRadius}
        fill="url(#platform-hero-hub)"
        filter="url(#platform-hero-glow)"
        className="animate-glow-pulse"
      />
      <text
        x={centerX}
        y={centerY - 2}
        textAnchor="middle"
        fill="white"
        fontSize={14}
        fontWeight={700}
      >
        <tspan x={centerX} dy="0">
          Eşleşme
        </tspan>
        <tspan x={centerX} dy="17">
          Noktası
        </tspan>
      </text>
    </svg>
  );
}

export function PlatformHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6366f1]/[0.07] via-transparent to-[#818cf8]/[0.04]" />
      <div className="pointer-events-none absolute inset-0 gc-dot-grid opacity-20" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div
          className="grid h-[720px] items-center gap-8 lg:grid-cols-[45fr_55fr] lg:gap-10"
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

          <div className="flex h-full min-h-[420px] items-center justify-center lg:min-h-0">
            <HeroOrbitVisual />
          </div>
        </div>
      </div>

    </section>
  );
}
