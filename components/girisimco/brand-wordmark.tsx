import type { HTMLAttributes } from 'react';
import { BRAND_BEE_ACCENT, BRAND_NAME } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Girisimbee wordmark — keeps the spelling intact while softening the “b”
 * (≈90% size, slightly lighter weight, baseline-aligned).
 *
 * Optional bee accent is gated by `BRAND_BEE_ACCENT` in brand constants
 * so the treatment can be reverted without hunting through the UI.
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
    <span className={cn('gc-bee-wordmark', className)} aria-label={BRAND_NAME} {...props}>
      Girisim
      <span className="gc-bee-accent inline-flex items-baseline">
        <span className="text-[0.9em] font-medium">b</span>
        <span className="gc-bee-letters relative inline-block bg-gradient-to-r from-[#60A5FA] via-[#5B5CF6] to-[#F59E0B] bg-clip-text font-semibold text-transparent">
          ee
          <span className="gc-bee-wings pointer-events-none absolute -top-1.5 left-1/2 flex -translate-x-1/2 gap-0.5" aria-hidden>
            <span className="gc-bee-wing gc-bee-wing-left block h-1.5 w-2.5 rounded-full bg-gradient-to-br from-[#FDE68A]/90 to-[#F59E0B]/70 opacity-80" />
            <span className="gc-bee-wing gc-bee-wing-right block h-1.5 w-2.5 rounded-full bg-gradient-to-bl from-[#FDE68A]/90 to-[#F59E0B]/70 opacity-80" />
          </span>
        </span>
      </span>
    </span>
  );
}
