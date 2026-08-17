'use client';

import { ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Shared picker grid — root hubs use two columns at the same card density. */
export const CREATE_LISTING_CATEGORY_CARD_GRID =
  'mx-auto grid max-w-[52rem] grid-cols-1 gap-3.5 md:grid-cols-2 lg:gap-4';

export function CategoryCardButton({
  title,
  description,
  color,
  Icon,
  onClick,
  ctaLabel = 'Devam et',
}: {
  title: string;
  description: string;
  audience?: string;
  color: string;
  Icon: LucideIcon;
  onClick: () => void;
  ctaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex h-full min-h-[13.5rem] w-full flex-col rounded-2xl border border-[#E6E8EE] bg-white p-5 text-left',
        'transition duration-200',
        'hover:border-[#0B1220]/25 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1220]/20',
        'dark:border-border dark:bg-card',
      )}
    >
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
        style={{ backgroundColor: color }}
        aria-hidden
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </span>
      <span className="mt-4 block break-words font-display text-base font-bold leading-snug text-[#0B1220] dark:text-foreground sm:text-[17px]">
        {title}
      </span>
      <span className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
        {description}
      </span>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-[#0B1220] dark:text-foreground">
        {ctaLabel}
        <ArrowRight
          className="h-4 w-4 shrink-0 text-[#94A3B8] transition duration-200 group-hover:translate-x-0.5 group-hover:text-[#0B1220]"
          aria-hidden
        />
      </span>
    </button>
  );
}
