'use client';

import { ArrowLeft } from 'lucide-react';
import { CareerFlowChoiceCards } from '@/components/girisimco/home/career-flow-choice-cards';
import { CREATE_LISTING_CAREER_COPY } from '@/components/girisimco/listing/create-listing-career.data';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { CategoryId } from '@/lib/domain/ids';

const FLOW_TO_CATEGORY: Record<'seek' | 'hire', CategoryId> = {
  seek: CATEGORY_IDS.isBul,
  hire: CATEGORY_IDS.iseAl,
};

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

      <CareerFlowChoiceCards
        onSelect={(id) => onSelect(FLOW_TO_CATEGORY[id])}
      />
    </section>
  );
}
