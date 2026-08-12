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
      className={cn('flex flex-wrap items-stretch gap-2', className)}
      role="group"
      aria-label="İş ilanı türü"
    >
      <JobFlowChip
        active={value === 'hire'}
        color={HIRE_COLOR}
        title="İşe Alıyorum"
        subtitle="Açık pozisyonlar"
        onClick={() => toggle('hire')}
      />
      <JobFlowChip
        active={value === 'seek'}
        color={SEEK_COLOR}
        title="İş Arıyorum"
        subtitle="Kariyer profilleri"
        onClick={() => toggle('seek')}
      />
    </div>
  );
}

function JobFlowChip({
  active,
  color,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  color: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative inline-flex h-9 min-w-[10.5rem] flex-1 items-center overflow-hidden rounded-lg border bg-white sm:flex-none',
        'pl-3.5 pr-3 text-left transition-colors',
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
      <span className="min-w-0 leading-none">
        <span className="block truncate text-[12px] font-semibold tracking-tight" style={{ color }}>
          {title}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-[#64748B]">{subtitle}</span>
      </span>
    </button>
  );
}
