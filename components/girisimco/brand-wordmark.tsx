import Image from 'next/image';
import type { HTMLAttributes } from 'react';
import { BRAND_BEE_ACCENT, BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Girisimbee wordmark — “Girisim” + branded “bee” letter art.
 * Toggle via `BRAND_BEE_ACCENT`.
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
      className={cn('gc-bee-wordmark inline-flex items-center', className)}
      aria-label={BRAND_NAME}
      {...props}
    >
      <span className="leading-none">Girisim</span>
      <span className="gc-bee-letters relative -ml-[0.06em] inline-flex shrink-0 items-center self-center">
        <Image
          src="/brand/bee-letters.png"
          alt=""
          width={509}
          height={235}
          className="h-[1.4em] w-auto max-w-none select-none"
          aria-hidden
          priority={false}
        />
      </span>
    </span>
  );
}
