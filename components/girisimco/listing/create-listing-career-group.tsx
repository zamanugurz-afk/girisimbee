'use client';

import { ArrowLeft, Briefcase, UserRoundSearch } from 'lucide-react';
import { CategoryCardButton } from '@/components/girisimco/listing/create-listing-category-card';
import { CREATE_LISTING_CAREER_COPY } from '@/components/girisimco/listing/create-listing-career.data';
import {
  JOB_HIRE_CARD_COLOR,
  JOB_SEEKER_CARD_COLOR,
} from '@/features/listings/utils/listing-card-display';
import type { CategoryId } from '@/lib/domain/ids';

const FLOW_VISUAL = {
  seek: {
    color: JOB_SEEKER_CARD_COLOR,
    Icon: UserRoundSearch,
    audience: 'İş arayanlar · kariyer profili',
  },
  hire: {
    color: JOB_HIRE_CARD_COLOR,
    Icon: Briefcase,
    audience: 'İşverenler · açık pozisyon',
  },
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

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {CREATE_LISTING_CAREER_COPY.options.map((option) => {
          const visual = FLOW_VISUAL[option.id];
          return (
            <CategoryCardButton
              key={option.categoryId}
              title={option.label}
              description={option.description}
              audience={visual.audience}
              color={visual.color}
              Icon={visual.Icon}
              ctaLabel={option.label}
              onClick={() => onSelect(option.categoryId)}
            />
          );
        })}
      </div>
    </section>
  );
}
