import Image from 'next/image';
import type { HTMLAttributes } from 'react';
import { BRAND_BEE_ACCENT, BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Girisimbee wordmark — “Girisim” stays typographic; optional “bee” uses the
 * branded bee-letter artwork (toggle via `BRAND_BEE_ACCENT`).
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
      className={cn('gc-bee-wordmark inline-flex items-baseline gap-0.5', className)}
      aria-label={BRAND_NAME}
      {...props}
    >
      <span>Girisim</span>
      <span className="gc-bee-letters relative inline-flex translate-y-[0.08em] items-center">
        <Image
          src="/brand/bee-letters.png"
          alt=""
          width={220}
          height={100}
          className="h-[1.35em] w-auto select-none"
          aria-hidden
          priority={false}
        />
      </span>
    </span>
  );
}
