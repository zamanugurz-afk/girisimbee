import type { HTMLAttributes } from 'react';
import { BeeMark } from '@/components/girisimco/bee-mark';
import { BRAND_BEE_ACCENT, BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement> & {
  /** Show the bee glyph after the name (off when the logo mark already has one). */
  showGlyph?: boolean;
};

/**
 * Girisimbee wordmark — keeps the spelling intact while softening the “b”
 * (≈90% size, slightly lighter weight, baseline-aligned).
 *
 * Optional bee accent is gated by `BRAND_BEE_ACCENT` in brand constants
 * so the treatment can be reverted without hunting through the UI.
 */
export function BrandWordmark({ className, showGlyph = true, ...props }: BrandWordmarkProps) {
  const withGlyph = BRAND_BEE_ACCENT && showGlyph;

  return (
    <span
      className={cn(withGlyph && 'gc-bee-wordmark inline-flex items-center gap-1.5', className)}
      aria-label={BRAND_NAME}
      {...props}
    >
      <span>
        Girisim
        <span className="text-[0.9em] font-medium">b</span>
        ee
      </span>
      {withGlyph ? <BeeMark className="gc-bee-glyph h-[0.95em] w-[0.95em]" tone="brand" /> : null}
    </span>
  );
}
