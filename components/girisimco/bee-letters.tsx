import type { SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

type BeeLettersProps = SVGAttributes<SVGSVGElement>;

/**
 * Inline “bee” letter art for the Girisimbee wordmark.
 * Yellow bubble type + striped “b”, side wings (not heart-shaped), flight trail.
 */
export function BeeLetters({ className, ...props }: BeeLettersProps) {
  return (
    <svg
      viewBox="0 0 208 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('max-w-none select-none', className)}
      aria-hidden
      {...props}
    >
      <defs>
        <linearGradient id="gcBeeFill" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE566" />
          <stop offset="0.45" stopColor="#F6BC00" />
          <stop offset="1" stopColor="#E08A00" />
        </linearGradient>
        <filter id="gcBeeSoft" x="-12%" y="-12%" width="124%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.7" floodColor="#B45309" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Side wings — two separate ovals, not a heart stack */}
      <g opacity="0.95">
        <ellipse
          cx="40"
          cy="15"
          rx="12"
          ry="6.5"
          fill="#FFF9E6"
          stroke="#E8D48A"
          strokeWidth="0.9"
          transform="rotate(-22 40 15)"
        />
        <ellipse
          cx="51"
          cy="13.5"
          rx="11"
          ry="5.8"
          fill="#FFFEF5"
          stroke="#E8D48A"
          strokeWidth="0.9"
          transform="rotate(16 51 13.5)"
        />
      </g>

      {/* Letter b — stem + bowl */}
      <g filter="url(#gcBeeSoft)">
        <rect x="12" y="6" width="11.5" height="46" rx="5.5" fill="url(#gcBeeFill)" />
        <circle cx="32.5" cy="37" r="15.5" fill="url(#gcBeeFill)" />
        {/* stem highlight */}
        <path d="M15.2 10.5h5.2" stroke="#FFF6D0" strokeWidth="2.1" strokeLinecap="round" opacity="0.8" />
        {/* bee stripes on bowl */}
        <path d="M21.5 31.5h20.5" stroke="#1E293B" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M20.2 37.5h23" stroke="#1E293B" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M22 43.5h19" stroke="#1E293B" strokeWidth="3.4" strokeLinecap="round" />
      </g>

      {/* Slim antennae */}
      <path d="M16.5 6.5C14.2 3.6 11.8 2.5 10 2.9" stroke="#1E293B" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M20.8 6C19.9 3 18.2 1.7 16.5 1.6" stroke="#1E293B" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="9.8" cy="2.85" r="1.25" fill="#F6BC00" />
      <circle cx="16.35" cy="1.55" r="1.25" fill="#F6BC00" />

      {/* First e */}
      <g filter="url(#gcBeeSoft)">
        <circle cx="68" cy="36.5" r="16.2" fill="url(#gcBeeFill)" />
        <circle cx="71.5" cy="36.5" r="7.4" fill="#FFFCF5" />
        <rect x="54.5" y="33.4" width="26" height="6.2" rx="3.1" fill="url(#gcBeeFill)" />
        <path d="M58 24.5h12" stroke="#FFF6D0" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      </g>

      {/* Second e */}
      <g filter="url(#gcBeeSoft)">
        <circle cx="104" cy="36.5" r="16.2" fill="url(#gcBeeFill)" />
        <circle cx="107.5" cy="36.5" r="7.4" fill="#FFFCF5" />
        <rect x="90.5" y="33.4" width="26" height="6.2" rx="3.1" fill="url(#gcBeeFill)" />
        <path d="M94 24.5h12" stroke="#FFF6D0" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      </g>

      {/* Flight trail */}
      <path
        d="M120 35.5c7 0 11-3 12.8-7.2 2.4 5.2 7 7.8 13.2 6.5"
        stroke="#1E293B"
        strokeWidth="1.45"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M146.5 34.2c5.8-1 9.6 0 13.4 3.4 4.4 4 10 4.6 15.2 1.8"
        stroke="#1E293B"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeDasharray="2.1 3"
        fill="none"
      />

      {/* Mini bee */}
      <g className="gc-bee-glyph" transform="translate(178 20)">
        <ellipse cx="5.5" cy="2" rx="5" ry="2.8" fill="#FFF9E6" transform="rotate(-30 5.5 2)" />
        <ellipse cx="9.5" cy="8.5" rx="6" ry="4.2" fill="#F6BC00" />
        <path d="M5 6.8h9M4.8 8.9h9.4M5.8 11h7.4" stroke="#1E293B" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="4.8" cy="4.8" r="2.5" fill="#1E293B" />
        <path d="M3.2 2.9C2.1 1.4 1 0.9 0.2 1.1" stroke="#1E293B" strokeWidth="1" strokeLinecap="round" />
        <path d="M6 2.8C6.9 1.3 8.1 0.8 9 1" stroke="#1E293B" strokeWidth="1" strokeLinecap="round" />
        <circle cx="0.15" cy="1.05" r="0.8" fill="#F6BC00" />
        <circle cx="9.15" cy="0.95" r="0.8" fill="#F6BC00" />
      </g>
    </svg>
  );
}
