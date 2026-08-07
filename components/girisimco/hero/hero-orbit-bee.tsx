'use client';

import { motion } from 'framer-motion';
import {
  CANVAS,
  CX,
  CY,
  ORBIT_VISUAL_CLASS,
  centerLeftPct,
  centerTopPct,
} from '@/components/girisimco/hero/hero-orbit-galaxy';

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

/** All orbit motes = warm yellow pollen (reference: golden glow). */
const ORBIT_POLLEN = [
  { ring: 0, angle: 18, size: 10 },
  { ring: 0, angle: 95, size: 8 },
  { ring: 0, angle: 168, size: 9 },
  { ring: 0, angle: 248, size: 7 },
  { ring: 0, angle: 320, size: 8 },
  { ring: 1, angle: 40, size: 8 },
  { ring: 1, angle: 130, size: 7 },
  { ring: 1, angle: 210, size: 9 },
  { ring: 1, angle: 300, size: 7 },
  { ring: 2, angle: 70, size: 6 },
  { ring: 2, angle: 160, size: 7 },
  { ring: 2, angle: 250, size: 6 },
] as const;

const WING_FLAP_DURATION = 0.12;

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

/** Soft golden pollen glow — matches reference yellow-orange. */
function PollenDot({ size, delay }: { size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        background:
          'radial-gradient(circle at 35% 30%, #fef9c3 0%, #fde047 35%, #fbbf24 70%, #f59e0b 100%)',
        boxShadow: '0 0 12px rgba(251, 191, 36, 0.7), 0 0 22px rgba(245, 158, 11, 0.35)',
      }}
      animate={{ opacity: [0.45, 1, 0.45], scale: [0.88, 1.12, 0.88] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

/**
 * Top-down bee — flipped to overhead view.
 * Fore + hind wings use elongated membrane shapes (real bee wing form).
 */
function CenterBeeSvg() {
  return (
    <svg
      width="200"
      height="220"
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_16px_36px_rgba(120,53,15,0.28)]"
      aria-hidden
    >
      <defs>
        <linearGradient id="bee-abd" x1="100" y1="88" x2="100" y2="198" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde047" />
          <stop offset="0.4" stopColor="#facc15" />
          <stop offset="0.75" stopColor="#eab308" />
          <stop offset="1" stopColor="#a16207" />
        </linearGradient>
        <radialGradient id="bee-thor" cx="100" cy="86" r="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef08a" />
          <stop offset="0.45" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#92400e" />
        </radialGradient>
        <radialGradient id="bee-hd" cx="100" cy="48" r="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#44403c" />
          <stop offset="0.6" stopColor="#1c1917" />
          <stop offset="1" stopColor="#0c0a09" />
        </radialGradient>
        <linearGradient id="bee-wing" x1="0" y1="0.2" x2="1" y2="0.8">
          <stop stopColor="#ffffff" stopOpacity="0.72" />
          <stop offset="0.45" stopColor="#f1f5f9" stopOpacity="0.32" />
          <stop offset="1" stopColor="#cbd5e1" stopOpacity="0.18" />
        </linearGradient>
        <filter id="bee-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* LEFT forewing — long lanceolate / teardrop membrane */}
      <motion.g
        style={{ transformOrigin: '88px 92px' }}
        animate={{ scaleX: [1, 0.22, 1], rotate: [0, -5, 0] }}
        transition={{ duration: WING_FLAP_DURATION, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M88 92
             C72 78 48 62 22 58
             C8 56 2 68 8 82
             C16 102 40 112 62 108
             C74 106 84 100 88 92 Z"
          fill="url(#bee-wing)"
          stroke="#a8a29e"
          strokeWidth="1.2"
          filter="url(#bee-soft)"
        />
        <path d="M86 90 C60 76 36 66 16 64" stroke="#d6d3d1" strokeWidth="1.05" fill="none" opacity="0.85" />
        <path d="M84 94 C58 90 34 88 14 92" stroke="#d6d3d1" strokeWidth="0.85" fill="none" opacity="0.65" />
        <path d="M82 98 C60 102 40 106 24 108" stroke="#e7e5e4" strokeWidth="0.7" fill="none" opacity="0.55" />
      </motion.g>

      {/* RIGHT forewing */}
      <motion.g
        style={{ transformOrigin: '112px 92px' }}
        animate={{ scaleX: [1, 0.22, 1], rotate: [0, 5, 0] }}
        transition={{ duration: WING_FLAP_DURATION, repeat: Infinity, ease: 'easeInOut', delay: 0.025 }}
      >
        <path
          d="M112 92
             C128 78 152 62 178 58
             C192 56 198 68 192 82
             C184 102 160 112 138 108
             C126 106 116 100 112 92 Z"
          fill="url(#bee-wing)"
          stroke="#a8a29e"
          strokeWidth="1.2"
          filter="url(#bee-soft)"
        />
        <path d="M114 90 C140 76 164 66 184 64" stroke="#d6d3d1" strokeWidth="1.05" fill="none" opacity="0.85" />
        <path d="M116 94 C142 90 166 88 186 92" stroke="#d6d3d1" strokeWidth="0.85" fill="none" opacity="0.65" />
        <path d="M118 98 C140 102 160 106 176 108" stroke="#e7e5e4" strokeWidth="0.7" fill="none" opacity="0.55" />
      </motion.g>

      {/* LEFT hindwing — smaller, rearward */}
      <motion.g
        style={{ transformOrigin: '90px 112px' }}
        animate={{ scaleX: [0.98, 0.28, 0.98], rotate: [0, -3, 0] }}
        transition={{ duration: WING_FLAP_DURATION, repeat: Infinity, ease: 'easeInOut', delay: 0.05 }}
      >
        <path
          d="M90 112
             C76 108 58 112 42 122
             C34 128 36 140 48 142
             C64 144 80 132 90 118 Z"
          fill="url(#bee-wing)"
          stroke="#a8a29e"
          strokeWidth="1"
          opacity="0.85"
        />
        <path d="M88 114 C70 118 54 126 46 132" stroke="#d6d3d1" strokeWidth="0.7" fill="none" opacity="0.6" />
      </motion.g>

      {/* RIGHT hindwing */}
      <motion.g
        style={{ transformOrigin: '110px 112px' }}
        animate={{ scaleX: [0.98, 0.28, 0.98], rotate: [0, 3, 0] }}
        transition={{ duration: WING_FLAP_DURATION, repeat: Infinity, ease: 'easeInOut', delay: 0.05 }}
      >
        <path
          d="M110 112
             C124 108 142 112 158 122
             C166 128 164 140 152 142
             C136 144 120 132 110 118 Z"
          fill="url(#bee-wing)"
          stroke="#a8a29e"
          strokeWidth="1"
          opacity="0.85"
        />
        <path d="M112 114 C130 118 146 126 154 132" stroke="#d6d3d1" strokeWidth="0.7" fill="none" opacity="0.6" />
      </motion.g>

      {/* Antennae forward */}
      <path
        d="M90 40 C82 26 70 16 58 12"
        stroke="#1c1917"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M110 40 C118 26 130 16 142 12"
        stroke="#1c1917"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="58" cy="12" r="3" fill="#44403c" />
      <circle cx="142" cy="12" r="3" fill="#44403c" />

      {/* Abdomen — top-down oval */}
      <ellipse cx="100" cy="148" rx="32" ry="48" fill="url(#bee-abd)" />
      <ellipse cx="90" cy="136" rx="10" ry="28" fill="#fef9c3" opacity="0.25" />

      {/* Transverse stripes */}
      <path
        d="M72 118 C84 112 116 112 128 118 L126 130 C114 124 86 124 74 130 Z"
        fill="#1c1917"
        opacity="0.95"
      />
      <path
        d="M70 140 C84 134 116 134 130 140 L128 152 C114 146 86 146 72 152 Z"
        fill="#0c0a09"
        opacity="0.95"
      />
      <path
        d="M72 162 C84 157 116 157 128 162 L126 172 C114 167 86 167 74 172 Z"
        fill="#1c1917"
        opacity="0.9"
      />
      <path
        d="M78 180 C88 176 112 176 122 180 L120 188 C110 184 90 184 80 188 Z"
        fill="#0c0a09"
        opacity="0.85"
      />

      {/* Fuzzy thorax */}
      <ellipse cx="100" cy="88" rx="30" ry="26" fill="url(#bee-thor)" />
      <ellipse cx="100" cy="84" rx="22" ry="18" fill="#fde68a" opacity="0.4" />
      {[
        [86, 80],
        [100, 76],
        [114, 80],
        [90, 92],
        [110, 92],
        [100, 96],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 1.5 : 1.15} fill="#78350f" opacity="0.32" />
      ))}

      {/* Head from above — dark, no face */}
      <ellipse cx="100" cy="48" rx="22" ry="20" fill="url(#bee-hd)" />
      <ellipse cx="100" cy="46" rx="12" ry="10" fill="#57534e" opacity="0.3" />

      {/* Stinger */}
      <path d="M100 194 L94 210 L100 204 L106 210 Z" fill="#1c1917" opacity="0.9" />
    </svg>
  );
}

export function HeroOrbitVisualBee() {
  const labelOrbitDuration = 80;

  return (
    <div className={ORBIT_VISUAL_CLASS} aria-hidden>
      <div
        className="pointer-events-none absolute h-[380px] w-[380px] rounded-full bg-[#7c6cff]/25 blur-[90px]"
        style={{
          left: `${centerLeftPct}%`,
          top: `${centerTopPct}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />

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

          {ORBIT_POLLEN.filter((p) => p.ring === ringIndex).map((grain) => {
            const { x, y } = polar(grain.angle, ring.radius);
            return (
              <div
                key={`${ringIndex}-${grain.angle}`}
                className="absolute"
                style={{
                  left: `${(x / CANVAS) * 100}%`,
                  top: `${(y / CANVAS) * 100}%`,
                }}
              >
                <PollenDot size={grain.size} delay={grain.angle / 360} />
              </div>
            );
          })}
        </motion.div>
      ))}

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

      <div
        className="absolute z-30"
        style={{
          left: `${centerLeftPct}%`,
          top: `${centerTopPct}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CenterBeeSvg />
        </motion.div>
      </div>
    </div>
  );
}
