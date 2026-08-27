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
        'relative inline-flex h-11 min-h-[44px] shrink-0 items-center overflow-hidden rounded-xl border bg-card',
        'px-3.5 pl-3.5 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        active ? 'shadow-sm' : 'border-input hover:border-ring/40 dark:border-border',
      )}
      style={
        active
          ? {
              borderColor: `${color}66`,
              backgroundImage: `linear-gradient(90deg, ${color}18 0%, transparent 68%)`,
            }
          : {
              backgroundImage: `linear-gradient(90deg, ${color}0F 0%, transparent 60%)`,
            }
      }
    >
      <span
        className="absolute inset-y-2 left-0 w-[3px] rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span
        className="truncate text-sm font-semibold tracking-tight"
        style={{ color }}
      >
        {label}
      </span>
    </button>
  );
}
