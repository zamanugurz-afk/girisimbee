import type { HTMLAttributes } from 'react';
import { BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/** Girişim (navy) + bee (gold). */
export function BrandWordmark({ className, ...props }: BrandWordmarkProps) {
  return (
    <span className={cn('inline-flex items-baseline', className)} aria-label={BRAND_NAME} {...props}>
      <span className="text-[#0F172A] dark:text-foreground">Girişim</span>
      <span className="text-[#F59E0B]">bee</span>
    </span>
  );
}
