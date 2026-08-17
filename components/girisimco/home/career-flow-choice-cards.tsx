'use client';

import Link from 'next/link';
import { ArrowRight, Briefcase, CheckCircle2, UserRoundSearch, type LucideIcon } from 'lucide-react';
import { CAREER_FLOW_OPTIONS } from '@/components/girisimco/home/home-marketplace.data';
import { buttonVariants } from '@/components/ui/button';
import {
  JOB_HIRE_CARD_COLOR,
  JOB_SEEKER_CARD_COLOR,
} from '@/features/listings/utils/listing-card-display';
import { cn } from '@/lib/utils';

const FLOW_VISUAL = {
  seek: {
    color: '#0EA5E9',
    Icon: UserRoundSearch,
  },
  hire: {
    color: '#10B981',
    Icon: Briefcase,
  },
} as const;

type ChoiceCardOption = {
  id: string;
  label: string;
  description: string;
  benefits: readonly { title: string; text: string }[];
  href?: string;
  ctaLabel?: string;
};

type ChoiceCardVisual = { color: string; Icon: LucideIcon };

function CareerFlowChoiceCardBody({
  label,
  description,
  benefits,
  color,
  Icon,
  ctaLabel,
  compact = false,
}: {
  label: string;
  description: string;
  benefits: readonly { title: string; text: string }[];
  color: string;
  Icon: LucideIcon;
  ctaLabel?: string;
  compact?: boolean;
}) {
  return (
    <>
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${color}0D` }}
        aria-hidden
      >
        <span
          className={cn(
            'flex items-center justify-center rounded-2xl text-white shadow-sm',
            compact ? 'h-11 w-11' : 'h-14 w-14',
          )}
          style={{ backgroundColor: color }}
        >
          <Icon className={compact ? 'h-5 w-5' : 'h-7 w-7'} strokeWidth={2} />
        </span>
      </div>

      <h2
        className={cn(
          'self-end font-display font-bold tracking-tight text-[#0B1220] dark:text-foreground',
          compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-[22px]',
        )}
      >
        {label}
      </h2>
      <p
        className={cn(
          'leading-relaxed text-[#64748B]',
          compact ? 'text-[13px] sm:text-sm' : 'text-sm sm:text-[15px]',
        )}
      >
        {description}
      </p>

      <ul className={cn('grid grid-rows-3', compact ? 'gap-2.5' : 'gap-4')}>
        {benefits.map((benefit) => (
          <li key={benefit.title} className={cn('flex', compact ? 'gap-2' : 'gap-3')}>
            <CheckCircle2
              className={cn('mt-0.5 shrink-0', compact ? 'h-4 w-4' : 'h-5 w-5')}
              style={{ color }}
              aria-hidden
            />
            <div>
              <p
                className={cn(
                  'font-semibold leading-snug text-[#0B1220] dark:text-foreground',
                  compact ? 'text-[13px]' : 'text-sm',
                )}
              >
                {benefit.title}
              </p>
              <p
                className={cn(
                  'leading-relaxed text-[#64748B]',
                  compact ? 'mt-0 text-xs' : 'mt-0.5 text-[13px]',
                )}
              >
                {benefit.text}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="self-end">
        <span
          className={cn(
            buttonVariants({ size: compact ? 'default' : 'lg' }),
            'w-full hover:scale-100',
          )}
          style={{ backgroundColor: color }}
        >
          {ctaLabel ?? label}
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </>
  );
}

export function CareerFlowChoiceCards({
  onSelect,
  options = CAREER_FLOW_OPTIONS,
  visuals,
  columns = 2,
  compact = false,
  splitEnds = false,
}: {
  onSelect?: (id: string) => void;
  options?: readonly ChoiceCardOption[];
  visuals?: Record<string, ChoiceCardVisual>;
  columns?: 2 | 3;
  compact?: boolean;
  splitEnds?: boolean;
}) {
  const visualMap: Record<string, ChoiceCardVisual> = visuals ?? FLOW_VISUAL;

  return (
    <nav aria-label="Seçenekler">
      <div
        className={cn(
          'grid auto-rows-fr grid-cols-1 items-stretch gap-4 lg:gap-5',
          splitEnds
            ? 'lg:grid-cols-3'
            : columns === 3
              ? 'lg:grid-cols-3'
              : 'mx-auto lg:max-w-[calc((100%-2.5rem)*2/3+1.25rem)] lg:grid-cols-2',
        )}
      >
        {options.map((option, index) => {
          const visual = visualMap[option.id];
          if (!visual) return null;
          const Icon = visual.Icon;
          const splitColClass = splitEnds
            ? index === 0
              ? 'lg:col-start-1'
              : index === 1
                ? 'lg:col-start-3'
                : ''
            : '';

          return (
            <div
              key={option.id}
              className={cn(
                'group relative grid h-full w-full self-stretch text-left overflow-hidden',
                splitColClass,
                compact
                  ? 'min-h-0 grid-rows-[4.25rem_auto_auto_minmax(8.5rem,1fr)_auto] gap-y-3 rounded-2xl p-4 sm:p-5'
                  : 'min-h-[36rem] grid-rows-[6rem_auto_3.25rem_minmax(13.5rem,1fr)_auto] gap-y-5 rounded-2xl p-5 sm:p-7',
                'border border-border/70 bg-gradient-to-b from-card to-card/70 backdrop-blur-sm',
                'transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_20px_35px_rgba(0,0,0,0.5)]',
                'dark:border-border dark:bg-card',
              )}
              style={{ borderColor: `${visual.color}35` }}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full blur-[80px] opacity-[0.035] transition-opacity duration-500 group-hover:opacity-[0.07]"
                style={{ backgroundColor: visual.color }}
              />
              <CareerFlowChoiceCardBody
                label={option.label}
                description={option.description}
                benefits={option.benefits}
                color={visual.color}
                Icon={Icon}
                ctaLabel={option.ctaLabel}
                compact={compact}
              />
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(option.id)}
                  className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={option.label}
                />
              ) : option.href ? (
                <Link
                  href={option.href}
                  className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={option.label}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
