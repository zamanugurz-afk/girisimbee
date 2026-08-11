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
 * Agreed lockup: [bee+G]irisimbee — mark supplies the G, tight kerning.
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
      <BrandMarkSlot
        size={isMark ? 34 : 38}
        priority
        className={cn(!isMark && '-mr-1')}
      />
      {!isMark && (
        <span className="font-display text-[1.2rem] font-bold leading-none tracking-tight sm:text-[1.35rem]">
          <span className="text-[#0F172A] dark:text-foreground">irisim</span>
          <span className="text-[#F59E0B]">bee</span>
        </span>
      )}
    </Link>
  );
}

/** @deprecated Prefer GirisimbeeLogo */
export const GirisimcoLogo = GirisimbeeLogo;
