'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, type LucideIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface OpportunityCardOption {
  id: string;
  label: string;
  description: string;
  benefits: readonly { title: string; text?: string }[];
  href?: string;
  ctaLabel?: string;
}

export interface OpportunityCardVisual {
  color: string;
  Icon: LucideIcon;
}

export interface OpportunityCardProps {
  option: OpportunityCardOption;
  visual: OpportunityCardVisual;
  compact?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

export function OpportunityCardBody({
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
  benefits: readonly { title: string; text?: string }[];
  color: string;
  Icon: LucideIcon;
  ctaLabel?: string;
  compact?: boolean;
}) {
  return (
    <>
      {/* 1. Header / Icon Container */}
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${color}0D` }}
        aria-hidden
      >
        <span
          className={cn(
            'flex items-center justify-center rounded-2xl text-white shadow-sm',
            compact ? 'h-10 w-10' : 'h-12 w-12',
          )}
          style={{ backgroundColor: color }}
        >
          <Icon className={compact ? 'h-5 w-5' : 'h-6 w-6'} strokeWidth={2} />
        </span>
      </div>

      {/* 2. Title */}
      <h2
        className={cn(
          'self-end font-display font-bold tracking-tight text-[#0B1220] dark:text-foreground',
          compact ? 'text-base sm:text-lg' : 'text-lg sm:text-[19px]',
        )}
      >
        {label}
      </h2>

      {/* 3. Description */}
      <p
        className={cn(
          'leading-relaxed text-[#64748B]',
          compact ? 'text-xs sm:text-[13px]' : 'text-xs sm:text-[13.5px]',
        )}
      >
        {description}
      </p>

      {/* 4. Benefits / Features List */}
      <ul className={cn('grid grid-rows-3', compact ? 'gap-2' : 'gap-3')}>
        {benefits.map((benefit, i) => (
          <li key={benefit.title || i} className={cn('flex', compact ? 'gap-2' : 'gap-2.5')}>
            <CheckCircle2
              className={cn('mt-0.5 shrink-0', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')}
              style={{ color }}
              aria-hidden
            />
            <div className="min-w-0">
              <p
                className={cn(
                  'font-semibold leading-snug text-[#0B1220] dark:text-foreground',
                  compact ? 'text-xs' : 'text-[13px]',
                )}
              >
                {benefit.title}
              </p>
              {benefit.text ? (
                <p
                  className={cn(
                    'leading-relaxed text-[#64748B]',
                    compact ? 'mt-0 text-[11px]' : 'mt-0.5 text-xs',
                  )}
                >
                  {benefit.text}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {/* 5. CTA Button */}
      <div className="self-end pt-1">
        <span
          className={cn(
            buttonVariants({ size: compact ? 'sm' : 'default' }),
            'w-full hover:scale-100 font-semibold shadow-xs h-10 sm:h-11 rounded-xl text-xs sm:text-sm',
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

export function OpportunityCard({
  option,
  visual,
  compact = false,
  onSelect,
  className,
}: OpportunityCardProps) {
  const Icon = visual.Icon;

  return (
    <div
      className={cn(
        'group relative grid h-full w-full self-stretch text-left overflow-hidden cursor-pointer',
        compact
          ? 'min-h-0 grid-rows-[3.5rem_auto_auto_1fr_auto] gap-y-3 rounded-2xl p-4 sm:p-5'
          : 'min-h-[29rem] grid-rows-[4.5rem_auto_auto_1fr_auto] gap-y-3.5 rounded-2xl p-4 sm:p-5',
        'border border-border/70 bg-gradient-to-b from-card to-card/70 backdrop-blur-sm',
        'transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_20px_35px_rgba(0,0,0,0.5)]',
        'dark:border-border dark:bg-card',
        className,
      )}
      style={{ borderColor: `${visual.color}35` }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full blur-[80px] opacity-[0.035] transition-opacity duration-500 group-hover:opacity-[0.07]"
        style={{ backgroundColor: visual.color }}
      />
      <OpportunityCardBody
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
          className="absolute inset-0 z-20 h-full w-full cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label={option.label}
        />
      ) : option.href ? (
        <Link
          href={option.href}
          className="absolute inset-0 z-20 h-full w-full cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label={option.label}
        />
      ) : null}
    </div>
  );
}

export function OpportunityCardGrid({
  children,
  columns = 3,
  splitEnds = false,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  splitEnds?: boolean;
  className?: string;
}) {
  return (
    <nav aria-label="Seçenekler">
      <div
        className={cn(
          'grid auto-rows-fr grid-cols-1 items-stretch gap-4 lg:gap-5',
          splitEnds
            ? 'lg:grid-cols-3'
            : columns === 4
              ? 'md:grid-cols-2 lg:grid-cols-4'
              : columns === 3
                ? 'lg:grid-cols-3'
                : 'mx-auto lg:max-w-[calc((100%-2.5rem)*2/3+1.25rem)] lg:grid-cols-2',
          className,
        )}
      >
        {children}
      </div>
    </nav>
  );
}
