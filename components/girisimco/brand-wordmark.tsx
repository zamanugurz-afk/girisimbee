import type { HTMLAttributes } from 'react';
import { BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Girisimbee wordmark — keeps the spelling intact while softening the “b”
 * (≈90% size, slightly lighter weight, baseline-aligned).
 */
export function BrandWordmark({ className, ...props }: BrandWordmarkProps) {
  return (
    <span className={cn(className)} aria-label={BRAND_NAME} {...props}>
      Girisim
      <span className="text-[0.9em] font-medium">b</span>
      ee
    </span>
  );
}
