'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandMarkSlot } from '@/components/girisimco/brand-mark-slot';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'mark';
}

/**
 * Agreed lockup: [bee+G] + ir(navy) + işim(emerald with falling left hook) + bee(amber)
 * Existing bee mark is completely untouched.
 */
export function GirisimbeeLogo({ className, variant = 'full' }: LogoProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMark = variant === 'mark';

  return (
    <Link
      href="/"
      prefetch
      className={cn('group relative z-20 inline-flex shrink-0 items-center gap-0', className)}
      aria-label="Girişimbee"
      onClick={(event) => {
        if (pathname === '/') {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        event.preventDefault();
        router.push('/');
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

          {/* 'işim' kısmı (Zümrüt Yeşili - Sola düşen çengel ile) */}
          <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-baseline transition-colors">
            <span>i</span>
            <span className="relative inline-block">
              <span>s</span>
              {/* Sola doğru kıvrılan ve düşüyormuş hissi veren mikro çengel */}
              <svg
                viewBox="0 0 10 12"
                className="absolute -bottom-[5px] left-1/2 -translate-x-[60%] w-[7px] h-[8px] pointer-events-none text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5.5 0.5 C 5.5 3.5, 3.2 5.8, 1 5.2" />
              </svg>
            </span>
            <span>im</span>
          </span>

          {/* 'bee' kısmı (Altın Sarısı) */}
          <span className="text-[#F59E0B] dark:text-amber-400 transition-colors">bee</span>
        </span>
      )}
    </Link>
  );
}

/** @deprecated Prefer GirisimbeeLogo */
export const GirisimcoLogo = GirisimbeeLogo;
