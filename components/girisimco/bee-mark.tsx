import type { SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

type BeeMarkProps = SVGAttributes<SVGSVGElement> & {
  /** `brand` = amber stripes for light UI; `onDark` = light bee on indigo marks */
  tone?: 'brand' | 'onDark';
};

/**
 * Compact bee glyph — readable at ~16–32px (striped body + wings).
 */
export function BeeMark({ className, tone = 'brand', ...props }: BeeMarkProps) {
  const wing = tone === 'onDark' ? 'rgba(255,255,255,0.55)' : '#FDE68A';
  const body = tone === 'onDark' ? '#FBBF24' : '#F59E0B';
  const stripe = tone === 'onDark' ? '#0F172A' : '#1E293B';
  const head = tone === 'onDark' ? '#F8FAFC' : '#0F172A';

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
      {...props}
    >
      {/* Wings */}
      <ellipse
        className="gc-bee-wing gc-bee-wing-left"
        cx="9"
        cy="11"
        rx="7"
        ry="4.2"
        fill={wing}
        transform="rotate(-28 9 11)"
      />
      <ellipse
        className="gc-bee-wing gc-bee-wing-right"
        cx="23"
        cy="11"
        rx="7"
        ry="4.2"
        fill={wing}
        transform="rotate(28 23 11)"
      />
      {/* Body */}
      <ellipse cx="16" cy="18" rx="7.2" ry="9" fill={body} />
      <path d="M9.2 14.2h13.6" stroke={stripe} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M9.2 18.4h13.6" stroke={stripe} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10.2 22.6h11.6" stroke={stripe} strokeWidth="2.2" strokeLinecap="round" />
      {/* Head */}
      <circle cx="16" cy="8.2" r="4" fill={head} />
      {/* Antennae */}
      <path
        d="M13.6 5.2C12.2 3.4 10.4 2.8 9.2 3.2"
        stroke={head}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M18.4 5.2C19.8 3.4 21.6 2.8 22.8 3.2"
        stroke={head}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="9.1" cy="3.1" r="1.1" fill={body} />
      <circle cx="22.9" cy="3.1" r="1.1" fill={body} />
    </svg>
  );
}
