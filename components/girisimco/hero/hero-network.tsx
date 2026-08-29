import Link from 'next/link';
import {
  Briefcase,
  Handshake,
  Store,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { BrandMarkSlot } from '@/components/girisimco/brand-mark-slot';
import { gcCategoryColors } from '@/lib/design-system';
import { cn } from '@/lib/utils';

/** Orbit 4 core category nodes: Kariyer, Ortaklık, Franchise, Çözümler */
const NODES: {
  id: string;
  label: string;
  href: string;
  Icon: LucideIcon;
  className: string;
  color: string;
  lineStroke: string;
}[] = [
  {
    id: 'job',
    label: 'Kariyer',
    href: '/is',
    Icon: Briefcase,
    className: 'left-1/2 top-[1%] -translate-x-1/2',
    color: gcCategoryColors['ise-al'],
    lineStroke: gcCategoryColors['ise-al'],
  },
  {
    id: 'partner',
    label: 'Ortaklık',
    href: '/girisim-ortaklik',
    Icon: Handshake,
    className: 'right-[1%] top-1/2 -translate-y-1/2',
    color: gcCategoryColors['ortak-bul'],
    lineStroke: gcCategoryColors['ortak-bul'],
  },
  {
    id: 'franchise',
    label: 'Franchise',
    href: '/franchise/buy',
    Icon: Store,
    className: 'bottom-[1%] left-1/2 -translate-x-1/2',
    color: gcCategoryColors.franchise,
    lineStroke: gcCategoryColors.franchise,
  },
  {
    id: 'solutions',
    label: 'Çözümler',
    href: '/dijital-ai',
    Icon: Sparkles,
    className: 'left-[1%] top-1/2 -translate-y-1/2',
    color: gcCategoryColors['dijital-ai'],
    lineStroke: gcCategoryColors['dijital-ai'],
  },
];

/**
 * Visual mode toggle:
 * 'radar-sweep'    -> Single rotating radar bar with 360° conic scan sweep around the center bee.
 * 'classic-4spokes' -> Legacy 4 fixed colored spoke lines.
 */
const HERO_NETWORK_MODE: 'radar-sweep' | 'classic-4spokes' = 'radar-sweep';

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
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.045] blur-2xl" />
      <div className="pointer-events-none absolute right-[6%] top-[6%] h-24 w-24 rounded-full bg-[#FBBF24]/[0.1] blur-xl" />

      <svg
        className="pointer-events-none absolute inset-[10%] h-[80%] w-[80%] opacity-[0.05]"
        viewBox="0 0 280 280"
        fill="none"
        aria-hidden
      >
        <defs>
          <pattern id="hero-hex-light" width="20" height="34" patternUnits="userSpaceOnUse">
            <path d="M10 1 L18 7 V19 L10 25 L2 19 V7 Z" stroke="#64748B" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="280" height="280" fill="url(#hero-hex-light)" />
      </svg>

      {/* Orbit Rings & Structural Guidelines */}
      <div className="pointer-events-none absolute inset-[4%]" aria-hidden>
        <svg className="h-full w-full" viewBox="0 0 300 300" fill="none">
          <defs>
            <clipPath id="radar-sweep-clip">
              <circle cx="118" cy="118" r="118" />
            </clipPath>
          </defs>

          {/* Sabit Kılavuz Çemberler */}
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

          {/* =========================================================================
              [YENİ VERSİYON - KESİN MATEMATİKSEL HİZALAMA]
              Arı logosunun dışındaki çemberde dönen tek radar çubuğu ve radar tarama animasyonu
              Doğrudan SVG koordinat sisteminde (150, 150) merkezli — asla kayma veya yalpalamaz!
             ========================================================================= */}
          {HERO_NETWORK_MODE === 'radar-sweep' && (
            <g
              className="animate-spin"
              style={{
                transformOrigin: '150px 150px',
                animationDuration: '3.5s',
                animationTimingFunction: 'linear',
              }}
            >
              {/* Conic Radar Beam Sweep — Yumuşak ve doğal geçişli (kenar çerçevesi olmayan) ışık taraması */}
              <foreignObject x="32" y="32" width="236" height="236">
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background:
                      'conic-gradient(from 0deg, rgba(245, 158, 11, 0.24) 0deg, rgba(245, 158, 11, 0.08) 25deg, rgba(245, 158, 11, 0.01) 45deg, transparent 55deg, transparent 360deg)',
                    maskImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.75) 80%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.75) 80%, transparent 100%)',
                  }}
                />
              </foreignObject>

              {/* Tek Radar Çubuğu (Zarif ve net) */}
              <line
                x1="150"
                y1="150"
                x2="150"
                y2="32"
                stroke="#F59E0B"
                strokeWidth="1.75"
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.75))',
                }}
              />

              {/* Radar ucu hedef tarama noktası (Zarif blip dot) */}
              <circle
                cx="150"
                cy="32"
                r="3"
                fill="#F59E0B"
                stroke="#FEF3C7"
                strokeWidth="1.2"
                style={{
                  filter: 'drop-shadow(0 0 6px #F59E0B)',
                }}
              />
            </g>
          )}

          {/* =========================================================================
              [ESKİ VERSİYON SAKLANDI - GERİ DÖNÜLEBİLİR]
              Eski 4 renkli sabit çubuk yapısı (HERO_NETWORK_MODE = 'classic-4spokes' olduğunda kullanılır)
             ========================================================================= */}
          {HERO_NETWORK_MODE === 'classic-4spokes' && (
            <>
              <line x1="150" y1="150" x2="150" y2="32" stroke={NODES[0].lineStroke} strokeWidth="1.2" opacity="0.55" />
              <line x1="150" y1="150" x2="268" y2="150" stroke={NODES[1].lineStroke} strokeWidth="1.2" opacity="0.55" />
              <line x1="150" y1="150" x2="150" y2="268" stroke={NODES[2].lineStroke} strokeWidth="1.2" opacity="0.55" />
              <line x1="150" y1="150" x2="32" y2="150" stroke={NODES[3].lineStroke} strokeWidth="1.2" opacity="0.55" />
              <circle cx="150" cy="78" r="3.5" fill={NODES[0].color} />
              <circle cx="222" cy="150" r="3.5" fill={NODES[1].color} />
              <circle cx="150" cy="222" r="3.5" fill={NODES[2].color} />
              <circle cx="78" cy="150" r="3.5" fill={NODES[3].color} />
            </>
          )}
        </svg>
      </div>

      {/* Center Bee Avatar (Z-Index 10: radar sweep flows cleanly behind it) */}
      <div className="absolute left-1/2 top-1/2 z-10 flex h-[6.5rem] w-[6.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.28)] ring-[3px] ring-[#FBBF24]/75 sm:h-[7rem] sm:w-[7rem]">
        <div className="relative h-[72px] w-[72px] sm:h-[80px] sm:w-[80px]">
          <BrandMarkSlot size={80} className="relative z-[1] hidden sm:block" />
          <BrandMarkSlot size={72} className="relative z-[1] sm:hidden" />
          <BeeWingFlutter />
        </div>
      </div>

      {/* Outer 4 Navigation Nodes */}
      {NODES.map((node) => (
        <Link
          key={node.id}
          href={node.href}
          className={cn(
            'group absolute z-20 flex flex-col items-center gap-1.5 cursor-pointer transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-full',
            node.className,
          )}
          aria-label={node.label}
        >
          <div className="relative">
            <span
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white shadow-sm transition-shadow duration-200 group-hover:shadow-md sm:h-11 sm:w-11"
              style={{ backgroundColor: `${node.color}18`, color: node.color }}
            >
              <node.Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.85} />
            </span>
          </div>
          <span className="whitespace-nowrap rounded-full border border-[#E8EAF0] bg-white px-3 py-1.5 text-[12.5px] font-bold tracking-tight text-[#0B1220] shadow-sm transition-colors group-hover:border-slate-300 group-hover:text-primary flex items-center gap-1">
            {node.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
