'use client';

import { CareerFlowChoiceCards } from '@/components/girisimco/home/career-flow-choice-cards';
import { CareerFlowChoiceHeader } from '@/components/girisimco/home/career-flow-choice-header';
import {
  CREATE_LISTING_CAREER_COPY,
  CREATE_LISTING_CAREER_TRUST,
} from '@/components/girisimco/listing/create-listing-career.data';
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
      <CareerFlowChoiceHeader
        headingLevel="h2"
        headingId="create-career-heading"
        onBack={onBack}
      />

      <div className="mt-10 lg:mt-12">
        <CareerFlowChoiceCards
          options={CREATE_LISTING_CAREER_COPY.options}
          onSelect={(id) => onSelect(FLOW_TO_CATEGORY[id])}
        />
      </div>

      <p className="mt-8 text-center text-[13px] text-[#94A3B8] lg:mt-10">
        {CREATE_LISTING_CAREER_TRUST}
      </p>
    </section>
  );
}
