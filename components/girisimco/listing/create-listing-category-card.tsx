'use client';

import { ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Shared picker grid — level 1 and career level 2 use the same density. */
export const CREATE_LISTING_CATEGORY_CARD_GRID =
  'grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3';

export function CategoryCardButton({
  title,
  description,
  audience,
  color,
  Icon,
  onClick,
}: {
  title: string;
  description: string;
  audience: string;
  color: string;
  Icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex min-h-[8.5rem] w-full flex-col overflow-hidden rounded-xl border border-[#E6E8EE] bg-white p-4 text-left',
        'transition-colors duration-200 hover:border-[#C7CBD6] hover:bg-[#FAFBFC]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        'dark:border-border dark:bg-card',
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span
        className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: color }}
        aria-hidden
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">
        {audience}
      </span>
      <span className="mt-1 font-display text-base font-semibold text-[#0B1220] dark:text-foreground">
        {title}
      </span>
      <span className="mt-1.5 flex-1 text-[12px] leading-relaxed text-[#64748B]">
        {description}
      </span>
      <span
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold opacity-80 transition-opacity group-hover:opacity-100"
        style={{ color }}
      >
        Devam et
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}
