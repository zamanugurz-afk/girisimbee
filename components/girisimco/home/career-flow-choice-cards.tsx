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
    color: JOB_SEEKER_CARD_COLOR,
    Icon: UserRoundSearch,
  },
  hire: {
    color: JOB_HIRE_CARD_COLOR,
    Icon: Briefcase,
  },
} as const;

function CareerFlowChoiceCardBody({
  label,
  description,
  benefits,
  color,
  Icon,
}: {
  label: string;
  description: string;
  benefits: readonly { title: string; text: string }[];
  color: string;
  Icon: LucideIcon;
}) {
  return (
    <>
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${color}14` }}
        aria-hidden
      >
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
          style={{ backgroundColor: color }}
        >
          <Icon className="h-7 w-7" strokeWidth={2} />
        </span>
      </div>

      <h2 className="self-end font-display text-xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-[22px]">
        {label}
      </h2>
      <p className="text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
        {description}
      </p>

      <ul className="grid grid-rows-3 gap-4">
        {benefits.map((benefit) => (
          <li key={benefit.title} className="flex gap-3">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0"
              style={{ color }}
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold leading-snug text-[#0B1220] dark:text-foreground">
                {benefit.title}
              </p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-[#64748B]">
                {benefit.text}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="self-end">
        <span
          className={cn(
            buttonVariants({ size: 'lg' }),
            'w-full hover:scale-100',
          )}
          style={{ backgroundColor: color }}
        >
          {label}
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </>
  );
}

export function CareerFlowChoiceCards({
  onSelect,
}: {
  onSelect?: (id: 'seek' | 'hire') => void;
}) {
  return (
    <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-5">
      {CAREER_FLOW_OPTIONS.map((option) => {
        const visual = FLOW_VISUAL[option.id];
        const Icon = visual.Icon;

        return (
          <div
            key={option.id}
            className={cn(
              'group relative grid h-full min-h-[36rem] w-full grid-rows-[6rem_auto_3.25rem_minmax(13.5rem,1fr)_auto] gap-y-5 self-stretch',
              'rounded-2xl border border-[#E6E8EE] bg-white p-5 text-left',
              'transition duration-200 sm:p-7',
              'hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]',
              'dark:border-border dark:bg-card',
            )}
            style={{ borderColor: `${visual.color}40` }}
          >
            <CareerFlowChoiceCardBody
              label={option.label}
              description={option.description}
              benefits={option.benefits}
              color={visual.color}
              Icon={Icon}
            />
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(option.id)}
                className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1220]/20"
                aria-label={option.label}
              />
            ) : (
              <Link
                href={option.href}
                className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1220]/20"
                aria-label={option.label}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
