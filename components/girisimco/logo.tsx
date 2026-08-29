'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMarkSlot } from '@/components/girisimco/brand-mark-slot';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'mark';
}

/**
 * Agreed lockup: [bee+G] + ir(navy) + isim(emerald) + bee(amber)
 * Existing bee mark is completely untouched.
 */
export function GirisimbeeLogo({ className, variant = 'full' }: LogoProps) {
  const pathname = usePathname();
  const isMark = variant === 'mark';

  return (
    <Link
      href="/"
      prefetch
      className={cn(
        'group relative z-30 inline-flex shrink-0 items-center gap-0 cursor-pointer select-none',
        className,
      )}
      aria-label="Girişimbee Ana Sayfa"
      onClick={(event) => {
        if (pathname === '/') {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          event.preventDefault();
          window.location.href = '/';
        }
      }}
    >
      {/* Orijinal arı maskotu (Dokunulmadı) */}
      <BrandMarkSlot
        size={isMark ? 34 : 38}
        priority
        className={cn(!isMark && '-mr-1')}
      />

      {!isMark && (
        <span className="font-display text-[1.2rem] font-bold leading-none tracking-tight sm:text-[1.35rem] inline-flex items-baseline">
          {/* 'ir' kısmı (Lacivert / Dark mode Beyaz) */}
          <span className="text-[#0F172A] dark:text-white transition-colors">ir</span>

          {/* 'isim' kısmı (Zümrüt Yeşili - 's' çengelsiz düz s) */}
          <span className="text-emerald-600 dark:text-emerald-400 transition-colors">isim</span>

          {/* 'bee' kısmı (Altın Sarısı) */}
          <span className="text-[#F59E0B] dark:text-amber-400 transition-colors">bee</span>
        </span>
      )}
    </Link>
  );
}

/** @deprecated Prefer GirisimbeeLogo */
export const GirisimcoLogo = GirisimbeeLogo;
