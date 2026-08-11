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
 * Header lockup: [arı+G]irisimbee — tight kerning, no overlap.
 */
export function GirisimbeeLogo({ className, variant = 'full' }: LogoProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMark = variant === 'mark';

  return (
    <Link
      href="/"
      prefetch
      className={cn(
        'group relative z-20 inline-flex shrink-0 items-center gap-1.5 pr-1',
        className,
      )}
      aria-label="Girisimbee"
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
      <BrandMarkSlot size={isMark ? 34 : 38} priority />
      {!isMark && (
        <span className="font-display text-[1.15rem] font-bold leading-none tracking-tight sm:text-[1.3rem]">
          <span className="text-[#0F172A] dark:text-foreground">irisim</span>
          <span className="text-[#F59E0B]">bee</span>
        </span>
      )}
    </Link>
  );
}

/** @deprecated Prefer GirisimbeeLogo */
export const GirisimcoLogo = GirisimbeeLogo;
