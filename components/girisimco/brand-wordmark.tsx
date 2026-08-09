import type { HTMLAttributes } from 'react';
import { BRAND_BEE_ACCENT, BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Girisimbee wordmark — original type, with optional bee-stripe “bee”
 * (`BRAND_BEE_ACCENT`).
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
      <span className="gc-bee-letters text-[0.9em] font-bold">b</span>
      <span className="gc-bee-letters font-bold">ee</span>
    </span>
  );
}
