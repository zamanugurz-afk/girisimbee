import type { HTMLAttributes } from 'react';
import { BRAND_BEE_ACCENT, BRAND_BEE_YELLOW, BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Girisimbee wordmark — optional accent: b yellow / e black / e yellow.
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
    <span className={cn(className)} aria-label={BRAND_NAME} {...props}>
      Girisim
      <span className="text-[0.9em] font-bold" style={{ color: BRAND_BEE_YELLOW }}>
        b
      </span>
      <span className="font-bold text-[#0F172A]">e</span>
      <span className="font-bold" style={{ color: BRAND_BEE_YELLOW }}>
        e
      </span>
    </span>
  );
}
