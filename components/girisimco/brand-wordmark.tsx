import Image from 'next/image';
import type { HTMLAttributes } from 'react';
import { BRAND_BEE_ACCENT, BRAND_BEE_YELLOW, BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Girisimbee wordmark — original type, with optional yellow “bee”
 * + trailing bee flight mark (`BRAND_BEE_ACCENT`).
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
      className={cn('gc-bee-wordmark inline-flex items-baseline', className)}
      aria-label={BRAND_NAME}
      {...props}
    >
      <span>Girisim</span>
      <span className="gc-bee-letters inline-flex items-baseline" style={{ color: BRAND_BEE_YELLOW }}>
        <span className="text-[0.9em] font-medium">b</span>
        ee
      </span>
      <span className="gc-bee-trail relative -ml-[0.02em] inline-flex translate-y-[-0.28em] items-center self-center">
        <Image
          src="/brand/bee-trail.png"
          alt=""
          width={149}
          height={188}
          className="h-[0.95em] w-auto max-w-none select-none"
          aria-hidden
          priority={false}
        />
      </span>
    </span>
  );
}
