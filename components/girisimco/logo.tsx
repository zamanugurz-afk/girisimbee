'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BeeMark } from '@/components/girisimco/bee-mark';
import { BrandWordmark } from '@/components/girisimco/brand-wordmark';
import { BRAND_BEE_ACCENT } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** Icon-only mark for compact spaces */
  variant?: 'full' | 'mark';
}

/** Girisimbee mark: indigo circle + bee (or “G” when accent is off). */
export function GirisimbeeLogo({ className, variant = 'full' }: LogoProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMark = variant === 'mark';

  return (
    <Link
      href="/"
      prefetch
      className={cn('group inline-flex shrink-0 items-center gap-2.5', className)}
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
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-black/[0.04]',
          isMark ? 'h-9 w-9' : 'h-10 w-10',
        )}
        aria-hidden
      >
        <span
          className={cn(
            'flex items-center justify-center rounded-full bg-gradient-to-br from-[#60A5FA] via-[#5B5CF6] to-[#6C63FF] shadow-sm',
            isMark ? 'h-7 w-7' : 'h-8 w-8',
          )}
        >
          {BRAND_BEE_ACCENT ? (
            <BeeMark
              tone="onDark"
              className={cn('gc-bee-glyph', isMark ? 'h-[18px] w-[18px]' : 'h-5 w-5')}
            />
          ) : (
            <span className="font-display text-sm font-bold leading-none text-white">G</span>
          )}
        </span>
      </span>
      {!isMark && (
        <BrandWordmark
          showGlyph={false}
          className="font-display text-lg font-semibold tracking-tight text-[#0F172A] transition-colors duration-300 group-hover:text-[#334155]"
        />
      )}
    </Link>
  );
}

/** @deprecated Prefer GirisimbeeLogo */
export const GirisimcoLogo = GirisimbeeLogo;
