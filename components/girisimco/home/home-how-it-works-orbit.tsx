'use client';

import {
  Briefcase,
  Compass,
  Handshake,
  MessageCircle,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ORBIT_STEPS = [
  {
    step: '1',
    label: 'Yolunuzu seçin',
    icon: Compass,
    angle: -90,
    delay: '0s',
  },
  {
    step: '2',
    label: 'İletişime geçin',
    icon: MessageCircle,
    angle: 30,
    delay: '0.35s',
  },
  {
    step: '3',
    label: 'Eşleşin ve ilerleyin',
    icon: Rocket,
    angle: 150,
    delay: '0.7s',
  },
] as const;

const FIXED_STEP_LABELS = [
  {
    step: '1',
    label: 'Yolunuzu seçin',
    className: 'left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-full',
  },
  {
    step: '2',
    label: 'İletişime geçin',
    className: 'right-0 top-1/2 z-20 -translate-y-1/2 translate-x-full pl-2.5',
  },
  {
    step: '3',
    label: 'Eşleşin ve ilerleyin',
    className: 'bottom-0 left-[14%] z-20 translate-y-full',
  },
] as const;

const FIXED_AUDIENCE_LABELS = [
  {
    label: 'İş Arayanlar',
    icon: Briefcase,
    color: '#5B5CF6',
    delay: '0.6s',
    className: 'bottom-0 left-1/2 z-20 -translate-x-1/2 translate-y-full pt-1.5',
  },
  {
    label: 'İş Verenler',
    icon: Users,
    color: '#22C55E',
    delay: '0.85s',
    className: 'left-0 top-1/2 z-20 -translate-x-full -translate-y-1/2 pr-2.5',
  },
  {
    label: 'Ortak Arayanlar',
    icon: Handshake,
    color: '#F59E0B',
    delay: '1.1s',
    className: 'left-[10%] top-0 z-20 -translate-x-1/2 -translate-y-full',
  },
  {
    label: 'Girişimciler',
    icon: Rocket,
    color: '#6C63FF',
    delay: '0.1s',
    className: 'right-[10%] top-0 z-20 translate-x-1/2 -translate-y-full',
  },
  {
    label: 'Yatırımcılar',
    icon: TrendingUp,
    color: '#60A5FA',
    delay: '0.35s',
    className: 'bottom-[14%] right-0 z-20 translate-x-full pl-2.5',
  },
] as const;

const NODE_RADIUS = 22;

function polarToPercent(angleDeg: number, radiusPercent: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + radiusPercent * Math.cos(rad)}%`,
    top: `${50 + radiusPercent * Math.sin(rad)}%`,
  };
}

const stepLabelClass =
  'max-w-[7.5rem] whitespace-nowrap rounded-md bg-white/95 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-snug text-foreground shadow-sm backdrop-blur-sm sm:max-w-[8.5rem] sm:text-gc-xs';

const audiencePillClass =
  'animate-float inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-white/90 bg-white/95 px-2 py-0.5 text-[9px] font-semibold shadow-sm backdrop-blur-sm sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10px]';

export function HomeHowItWorksOrbit() {
  return (
    <div className="relative flex flex-col overflow-visible">
      <div className="pointer-events-none absolute -right-6 top-[38%] hidden h-48 w-48 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#5B5CF6]/10 via-[#6C63FF]/5 to-transparent blur-3xl lg:block" />

      <div className="relative mb-5 text-center lg:mb-6 lg:text-left">
        <h2 className="font-display text-gc-lg font-semibold tracking-tight text-foreground sm:text-gc-xl lg:text-gc-2xl">
          Girişim, yatırım ve kariyerin ortak noktası.
        </h2>
        <p className="mt-2 text-gc-sm leading-relaxed text-muted-foreground sm:text-gc-base">
          Üç adımda eşleşin — girişimden kariyere, ortaklıktan yatırıma.
        </p>
      </div>

      <div className="relative mx-auto h-[345px] w-[345px] shrink-0 sm:h-[368px] sm:w-[368px] lg:mx-0">
        <div className="absolute left-1/2 top-1/2 h-[279px] w-[279px] -translate-x-1/2 -translate-y-1/2 sm:h-[294px] sm:w-[294px]">
          <div className="relative h-full w-full overflow-visible">
            <svg
              className="pointer-events-none absolute inset-0 z-0 h-full w-full"
              viewBox="0 0 100 100"
              aria-hidden
            >
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="url(#orbit-gradient-outer)"
                strokeWidth="0.35"
                strokeDasharray="2 4"
                opacity="0.3"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="url(#orbit-gradient-outer)"
                strokeWidth="0.4"
                strokeDasharray="3 5"
                opacity="0.45"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="url(#orbit-gradient)"
                strokeWidth="0.65"
                strokeDasharray="4 5"
                opacity="0.6"
              />
              <defs>
                <linearGradient id="orbit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="50%" stopColor="#5B5CF6" />
                  <stop offset="100%" stopColor="#6C63FF" />
                </linearGradient>
                <linearGradient id="orbit-gradient-outer" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="33%" stopColor="#60A5FA" />
                  <stop offset="66%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center glow */}
            <div className="absolute left-1/2 top-1/2 z-[8] flex h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-20 sm:w-20">
              <span className="absolute inset-0 animate-glow-pulse rounded-full bg-gradient-to-br from-[#60A5FA]/25 via-[#5B5CF6]/15 to-[#6C63FF]/20 blur-lg" />
              <span className="absolute inset-2 rounded-full bg-gradient-to-br from-[#5B5CF6]/10 to-[#6C63FF]/10 blur-sm" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#60A5FA] via-[#5B5CF6] to-[#6C63FF] shadow-md ring-4 ring-white/90 sm:h-[3.25rem] sm:w-[3.25rem]">
                <Sparkles className="h-[1.125rem] w-[1.125rem] text-white/95 sm:h-5 sm:w-5" strokeWidth={1.75} />
              </span>
            </div>

            {/* Step nodes */}
            {ORBIT_STEPS.map((item) => {
              const nodePos = polarToPercent(item.angle, NODE_RADIUS);
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: nodePos.left, top: nodePos.top }}
                >
                  <div className="animate-float" style={{ animationDelay: item.delay }}>
                    <div
                      className={cn(
                        'relative flex h-[3.75rem] w-[3.75rem] flex-col items-center justify-center rounded-full sm:h-16 sm:w-16',
                        'border border-border/80 bg-white shadow-md ring-1 ring-black/[0.03]',
                        'transition-all duration-300 ease-smooth hover:scale-105 hover:shadow-lg hover:ring-primary/25',
                      )}
                    >
                      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#5B5CF6]/5 to-[#6C63FF]/5" />
                      <Icon className="relative h-5 w-5 text-primary sm:h-[1.375rem] sm:w-[1.375rem]" strokeWidth={1.75} />
                      <span className="relative mt-0.5 font-display text-[9px] font-semibold text-primary/70 sm:text-[10px]">
                        {item.step}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed step labels */}
        {FIXED_STEP_LABELS.map((item) => (
          <p key={item.step} className={cn('absolute', stepLabelClass, item.className)}>
            {item.label}
          </p>
        ))}

        {/* Fixed audience labels */}
        {FIXED_AUDIENCE_LABELS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={cn('absolute', item.className)}>
              <span
                className={audiencePillClass}
                style={{
                  animationDelay: item.delay,
                  color: item.color,
                  boxShadow: `0 4px 14px -4px ${item.color}44`,
                }}
              >
                <Icon className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" strokeWidth={2} aria-hidden />
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
