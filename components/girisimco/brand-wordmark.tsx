import type { HTMLAttributes } from 'react';
import { BeeLetters } from '@/components/girisimco/bee-letters';
import { BRAND_BEE_ACCENT, BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Girisimbee wordmark — “Girisim” stays typographic; optional “bee” uses
 * inline bee letter art (toggle via `BRAND_BEE_ACCENT`).
 */
export function BrandWordmark({ className, ...props }: BrandWordmarkProps) {
  if (!BRAND_BEE_ACCENT) {
    return (
      <span className={cn(className)} aria-label={BRAND_NAME} {...props}>
        Girisim
        <span className="text-[0.9em] font-medium">b</span>
        ee
      </span>
    );
  }

  return (
    <span
      className={cn('gc-bee-wordmark inline-flex items-center gap-1', className)}
      aria-label={BRAND_NAME}
      {...props}
    >
      <span className="leading-none">Girisim</span>
      <span className="gc-bee-letters relative inline-flex shrink-0 items-center self-center drop-shadow-sm">
        <BeeLetters className="h-[1.32em] w-auto" />
      </span>
    </span>
  );
}
