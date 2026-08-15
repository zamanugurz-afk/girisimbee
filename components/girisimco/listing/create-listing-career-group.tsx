'use client';

import { ArrowLeft, ArrowRight, Briefcase, UserRoundSearch } from 'lucide-react';
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
  onBack,
}: {
  onSelect: (categoryId: CategoryId) => void;
  onBack: () => void;
}) {
  return (
    <section aria-labelledby="create-career-heading">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] transition-colors hover:text-[#0B1220] dark:hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kategorilere dön
      </button>

      <div className="mb-6 max-w-xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
          Adım 1
        </p>
        <h2
          id="create-career-heading"
          className="mt-1.5 font-display text-xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-2xl"
        >
          {CREATE_LISTING_CAREER_COPY.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
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
                'transition duration-200 sm:p-7',
                'hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1220]/20',
                'dark:border-border dark:bg-card',
              )}
              style={{ borderColor: `${visual.color}40` }}
            >
              <div
                className="flex h-24 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${visual.color}14` }}
                aria-hidden
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                  style={{ backgroundColor: visual.color }}
                >
                  <Icon className="h-7 w-7" strokeWidth={2} />
                </span>
              </div>

              <span className="mt-5 font-display text-xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-[22px]">
                {option.label}
              </span>
              <span className="mt-2 text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
                {option.description}
              </span>

              <span
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'mt-7 w-full hover:scale-100',
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
