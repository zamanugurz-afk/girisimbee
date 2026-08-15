'use client';

import { ArrowRight, Briefcase, CheckCircle2, UserRoundSearch } from 'lucide-react';
import { CREATE_LISTING_CAREER_COPY } from '@/components/girisimco/listing/create-listing-career.data';
import {
  JOB_HIRE_CARD_COLOR,
  JOB_SEEKER_CARD_COLOR,
} from '@/features/listings/utils/listing-card-display';
import type { CategoryId } from '@/lib/domain/ids';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FLOW_VISUAL = {
  seek: { color: JOB_SEEKER_CARD_COLOR, Icon: UserRoundSearch },
  hire: { color: JOB_HIRE_CARD_COLOR, Icon: Briefcase },
} as const;

export function CreateListingCareerGroup({
  onSelect,
}: {
  onSelect: (categoryId: CategoryId) => void;
}) {
  return (
    <section className="mt-8" aria-labelledby="create-career-heading">
      <div className="mb-5 max-w-xl">
        <h3
          id="create-career-heading"
          className="font-display text-lg font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-xl"
        >
          {CREATE_LISTING_CAREER_COPY.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[#64748B]">
          {CREATE_LISTING_CAREER_COPY.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2 lg:gap-4">
        {CREATE_LISTING_CAREER_COPY.options.map((option) => {
          const visual = FLOW_VISUAL[option.id];
          const Icon = visual.Icon;
          return (
            <button
              key={option.categoryId}
              type="button"
              onClick={() => onSelect(option.categoryId)}
              className={cn(
                'group flex h-full flex-col rounded-2xl border border-[#E6E8EE] bg-white p-5 text-left',
                'transition duration-200',
                'hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1220]/20',
                'dark:border-border dark:bg-card',
              )}
              style={{ borderColor: `${visual.color}40` }}
            >
              <div
                className="flex h-20 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${visual.color}14` }}
                aria-hidden
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                  style={{ backgroundColor: visual.color }}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </span>
              </div>

              <span className="mt-4 font-display text-lg font-bold tracking-tight text-[#0B1220] dark:text-foreground">
                {option.label}
              </span>
              <span className="mt-1.5 text-sm leading-relaxed text-[#64748B]">
                {option.description}
              </span>

              <ul className="mt-5 flex flex-col gap-3">
                {option.benefits.map((benefit) => (
                  <li key={benefit.title} className="flex gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: visual.color }}
                      aria-hidden
                    />
                    <span>
                      <span className="block text-sm font-semibold leading-snug text-[#0B1220] dark:text-foreground">
                        {benefit.title}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-relaxed text-[#64748B]">
                        {benefit.text}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <span
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'mt-6 w-full hover:scale-100',
                )}
                  style={{ backgroundColor: visual.color }}
              >
                {option.label}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
