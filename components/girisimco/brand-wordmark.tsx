import type { HTMLAttributes } from 'react';
import { BRAND_BEE_ACCENT, BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Girisimbee wordmark — original type; optional yellow “bee” with one
 * vertical black stripe (`BRAND_BEE_ACCENT`).
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
    <span className={cn('gc-bee-wordmark', className)} aria-label={BRAND_NAME} {...props}>
      Girisim
      <span className="gc-bee-letters font-bold">
        <span className="text-[0.9em]">b</span>
        ee
      </span>
    </span>
  );
}
