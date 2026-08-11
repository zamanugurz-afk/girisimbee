import type { HTMLAttributes } from 'react';
import { BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/** Text-only wordmark: irisim (navy) + bee (gold). Pair with BrandMarkSlot for full lockup. */
export function BrandWordmark({ className, ...props }: BrandWordmarkProps) {
  return (
    <span className={cn('inline-flex items-baseline', className)} aria-label={BRAND_NAME} {...props}>
      <span className="text-[#0F172A] dark:text-foreground">irisim</span>
      <span className="text-[#F59E0B]">bee</span>
    </span>
  );
}
