import {
  Briefcase,
  Handshake,
  Store,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { BrandMarkSlot } from '@/components/girisimco/brand-mark-slot';
import { gcCategoryColors } from '@/lib/design-system';
import { cn } from '@/lib/utils';

/** Orbit node colors aligned with homepage category tag icons. */
const NODES: {
  id: string;
  label: string;
  Icon: LucideIcon;
  className: string;
  color: string;
  lineStroke: string;
}[] = [
  {
    id: 'franchise',
    label: 'Franchise',
    Icon: Store,
    className: 'left-1/2 top-[1%] -translate-x-1/2',
    color: gcCategoryColors.franchise,
    lineStroke: gcCategoryColors.franchise,
  },
  {
    id: 'investor',
    label: 'Yatırımcı',
    Icon: UserRound,
    className: 'right-[1%] top-1/2 -translate-y-1/2',
    color: gcCategoryColors['dijital-ai'],
    lineStroke: gcCategoryColors['dijital-ai'],
  },
  {
    id: 'partner',
    label: 'Ortaklık',
    Icon: Handshake,
    className: 'bottom-[1%] left-1/2 -translate-x-1/2',
    color: gcCategoryColors['ortak-bul'],
    lineStroke: gcCategoryColors['ortak-bul'],
  },
  {
    id: 'job',
    label: 'İş Fırsatı',
    Icon: Briefcase,
    className: 'left-[1%] top-1/2 -translate-y-1/2',
    color: gcCategoryColors['ise-al'],
    lineStroke: gcCategoryColors['ise-al'],
  },
];

function BeeWingFlutter() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible"
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
    >
      <ellipse className="gc-bee-wing gc-bee-wing-a" cx="27" cy="33" rx="17" ry="11.5" fill="#FBBF24" />
      <ellipse className="gc-bee-wing gc-bee-wing-b" cx="25" cy="46" rx="14" ry="9.5" fill="#F59E0B" />
    </svg>
  );
}

/** Network visual — sized by parent; category-aligned node colors. */
export function HeroNetworkVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative mx-auto aspect-square w-full max-w-[380px] lg:max-w-[420px]',
        className,
      )}
      aria-hidden
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.045] blur-2xl" />
      <div className="pointer-events-none absolute right-[6%] top-[6%] h-24 w-24 rounded-full bg-[#FBBF24]/[0.1] blur-xl" />

      <svg
        className="absolute inset-[10%] h-[80%] w-[80%] opacity-[0.05]"
        viewBox="0 0 280 280"
        fill="none"
      >
        <defs>
          <pattern id="hero-hex-light" width="20" height="34" patternUnits="userSpaceOnUse">
            <path d="M10 1 L18 7 V19 L10 25 L2 19 V7 Z" stroke="#64748B" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="280" height="280" fill="url(#hero-hex-light)" />
      </svg>

      <div className="gc-hero-orbit absolute inset-[4%]">
        <svg className="h-full w-full" viewBox="0 0 300 300" fill="none">
          <circle cx="150" cy="150" r="86" stroke="#E8EAF0" strokeWidth="1.35" />
          <circle
            cx="150"
            cy="150"
            r="118"
            stroke="#C7D2FE"
            strokeWidth="1.1"
            strokeDasharray="3 9"
            opacity="0.9"
          />
          <line x1="150" y1="150" x2="150" y2="32" stroke={NODES[0].lineStroke} strokeWidth="1.2" opacity="0.55" />
          <line x1="150" y1="150" x2="268" y2="150" stroke={NODES[1].lineStroke} strokeWidth="1.2" opacity="0.55" />
          <line x1="150" y1="150" x2="150" y2="268" stroke={NODES[2].lineStroke} strokeWidth="1.2" opacity="0.55" />
          <line x1="150" y1="150" x2="32" y2="150" stroke={NODES[3].lineStroke} strokeWidth="1.2" opacity="0.55" />
          <circle cx="150" cy="78" r="3.5" fill={NODES[0].color} />
          <circle cx="222" cy="150" r="3.5" fill={NODES[1].color} />
          <circle cx="150" cy="222" r="3.5" fill={NODES[2].color} />
          <circle cx="78" cy="150" r="3.5" fill={NODES[3].color} />
        </svg>
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 flex h-[6.5rem] w-[6.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.28)] ring-[3px] ring-[#FBBF24]/75 sm:h-[7rem] sm:w-[7rem]">
        <div className="relative h-[72px] w-[72px] sm:h-[80px] sm:w-[80px]">
          <BrandMarkSlot size={80} className="relative z-[1] hidden sm:block" />
          <BrandMarkSlot size={72} className="relative z-[1] sm:hidden" />
          <BeeWingFlutter />
        </div>
      </div>

      {NODES.map((node) => (
        <div
          key={node.id}
          className={cn('absolute z-20 flex flex-col items-center gap-1.5', node.className)}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white shadow-sm sm:h-11 sm:w-11"
            style={{ backgroundColor: `${node.color}1A`, color: node.color }}
          >
            <node.Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
          </span>
          <span className="whitespace-nowrap rounded-full border border-[#E8EAF0] bg-white px-2.5 py-1 text-[11px] font-semibold tracking-tight text-[#0B1220] shadow-sm">
            {node.label}
          </span>
        </div>
      ))}
    </div>
  );
}
