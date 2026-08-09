import Image from 'next/image';
import type { HTMLAttributes } from 'react';
import { BRAND_BEE_ACCENT, BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Girisimbee wordmark — “Girisim” stays typographic; optional “bee” uses the
 * branded bee-letter artwork (toggle via `BRAND_BEE_ACCENT`).
 *
 * Bee art is sized ~15% taller than the text so letter height reads equal/larger
 * (antennae + trail sit outside the type box).
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
      className={cn('gc-bee-wordmark inline-flex items-center gap-1', className)}
      aria-label={BRAND_NAME}
      {...props}
    >
      <span className="leading-none">Girisim</span>
      <span className="gc-bee-letters relative inline-flex shrink-0 items-center self-center">
        <Image
          src="/brand/bee-letters.png"
          alt=""
          width={509}
          height={235}
          className="h-[1.55em] w-auto max-w-none select-none"
          aria-hidden
          priority={false}
        />
      </span>
    </span>
  );
}
