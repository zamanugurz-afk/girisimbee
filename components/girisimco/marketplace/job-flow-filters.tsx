'use client';

import type { JobFlowFilter } from '@/features/listings/types/marketplace.types';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

const HIRE_COLOR = GC_CATEGORY_COLORS['ise-al'];
const SEEK_COLOR = '#0EA5E9';

/**
 * Compact job-flow chips for /is — filter control size, featured-section accent look.
 */
export function JobFlowFilters({
  value,
  onChange,
  className,
}: {
  value?: JobFlowFilter;
  onChange: (next: JobFlowFilter | undefined) => void;
  className?: string;
}) {
  function toggle(next: JobFlowFilter) {
    onChange(value === next ? undefined : next);
  }

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="group"
      aria-label="İş ilanı türü"
    >
      <JobFlowChip
        active={value === 'hire'}
        color={HIRE_COLOR}
        label="İşe Alıyorum"
        onClick={() => toggle('hire')}
      />
      <JobFlowChip
        active={value === 'seek'}
        color={SEEK_COLOR}
        label="İş Arıyorum"
        onClick={() => toggle('seek')}
      />
    </div>
  );
}

function JobFlowChip({
  active,
  color,
  label,
  onClick,
}: {
  active: boolean;
  color: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative inline-flex h-10 shrink-0 items-center overflow-hidden rounded-lg border bg-white',
        'px-3.5 pl-3.5 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        'dark:bg-card',
        active ? 'shadow-sm' : 'border-[#E6E8EE] hover:border-[#C7CBD6] dark:border-border',
      )}
      style={
        active
          ? {
              borderColor: `${color}66`,
              backgroundImage: `linear-gradient(90deg, ${color}18 0%, #ffffff 68%)`,
            }
          : {
              backgroundImage: `linear-gradient(90deg, ${color}0F 0%, transparent 60%)`,
            }
      }
    >
      <span
        className="absolute inset-y-1.5 left-0 w-[3px] rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span
        className="truncate text-[15px] font-bold tracking-tight sm:text-base"
        style={{ color }}
      >
        {label}
      </span>
    </button>
  );
}
