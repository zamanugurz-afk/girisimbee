'use client';

import Link from 'next/link';
import type { PartnershipIntent } from '@/features/founders/partnership-intent';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export type VentureFlowTabId = 'seeking' | 'joining' | 'isletme-devri';

const SEEKING_COLOR = '#6366F1';
const ISLETME_DEVRİ_COLOR = GC_CATEGORY_COLORS['isletme-devri']; // #D97706

interface VentureFlowOption {
  id: VentureFlowTabId;
  label: string;
  href: string;
  color: string;
}

const VENTURE_FLOW_OPTIONS: VentureFlowOption[] = [
  {
    id: 'seeking',
    label: 'Ortaklık',
    href: '/partners',
    color: SEEKING_COLOR,
  },
  {
    id: 'isletme-devri',
    label: 'İşletme Devri',
    href: '/isletme-devri',
    color: ISLETME_DEVRİ_COLOR,
  },
];

/** Preserved in codebase for future modular re-activation */
export const ARCHIVED_JOINING_FLOW_OPTION: VentureFlowOption = {
  id: 'joining',
  label: 'Ortak Olmak İstiyorum',
  href: '/partners?intent=joining',
  color: '#DB2777',
};

/**
 * 3-way direction selector for Ortaklık ve Devir browse pages:
 * - "Ortak Arıyorum"
 * - "Ortak Olmak İstiyorum"
 * - "İşletme Devri"
 * Matches JobFlowFilters visual behavior, borders, colors, hover, and active states.
 */
export function PartnershipFlowFilters({
  categorySlug,
  partnershipIntent,
  value,
  onChange,
  className,
}: {
  categorySlug?: string;
  partnershipIntent?: PartnershipIntent;
  value?: VentureFlowTabId;
  onChange?: (patch: { categorySlug?: string; partnershipIntent?: PartnershipIntent }) => void;
  className?: string;
}) {
  const activeTab: VentureFlowTabId =
    value ??
    (categorySlug === 'isletme-devri'
      ? 'isletme-devri'
      : partnershipIntent === 'joining'
        ? 'joining'
        : 'seeking');

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="group"
      aria-label="Ortaklık ve devir türü"
    >
      {VENTURE_FLOW_OPTIONS.map((option) => {
        const isActive = activeTab === option.id;

        return (
          <Link
            key={option.id}
            href={option.href}
            aria-pressed={isActive}
            onClick={() => {
              if (onChange) {
                if (option.id === 'isletme-devri') {
                  onChange({ categorySlug: 'isletme-devri', partnershipIntent: undefined });
                } else {
                  onChange({ categorySlug: 'ortak-bul', partnershipIntent: option.id });
                }
              }
            }}
            className={cn(
              'relative inline-flex h-11 min-h-[44px] shrink-0 items-center overflow-hidden rounded-xl border bg-card',
              'px-3.5 pl-3.5 text-left transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
              isActive ? 'shadow-sm' : 'border-input hover:border-ring/40 dark:border-border',
            )}
            style={
              isActive
                ? {
                    borderColor: `${option.color}66`,
                    backgroundImage: `linear-gradient(90deg, ${option.color}18 0%, transparent 68%)`,
                  }
                : {
                    backgroundImage: `linear-gradient(90deg, ${option.color}0F 0%, transparent 60%)`,
                  }
            }
          >
            <span
              className="absolute inset-y-2 left-0 w-[3px] rounded-full"
              style={{ backgroundColor: option.color }}
              aria-hidden
            />
            <span
              className="truncate text-sm font-semibold tracking-tight"
              style={{ color: option.color }}
            >
              {option.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
