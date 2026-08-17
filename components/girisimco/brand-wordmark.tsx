import type { HTMLAttributes } from 'react';
import { BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/** Text-only wordmark: Gir (navy) + işim (emerald) + bee (gold). */
export function BrandWordmark({ className, ...props }: BrandWordmarkProps) {
  return (
    <span className={cn('inline-flex items-baseline font-bold', className)} aria-label={BRAND_NAME} {...props}>
      <span className="text-[#0F172A] dark:text-slate-100">Gir</span>
      <span className="text-emerald-600 dark:text-emerald-400">işim</span>
      <span className="text-[#F59E0B]">bee</span>
    </span>
  );
}
