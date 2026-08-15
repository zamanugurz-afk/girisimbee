'use client';

import { ArrowLeft } from 'lucide-react';
import { CareerFlowChoiceCards } from '@/components/girisimco/home/career-flow-choice-cards';
import { CareerFlowChoiceHeader } from '@/components/girisimco/home/career-flow-choice-header';
import { CAREER_HUB_LANDING } from '@/components/girisimco/home/home-marketplace.data';
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
        action={
          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#64748B] transition-colors hover:text-[#0B1220] dark:hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kategorilere dön
          </button>
        }
      />

      <div className="mt-10 lg:mt-12">
        <CareerFlowChoiceCards
          onSelect={(id) => onSelect(FLOW_TO_CATEGORY[id])}
        />
      </div>

      <p className="mt-8 text-center text-[13px] text-[#94A3B8] lg:mt-10">
        {CAREER_HUB_LANDING.trust}
      </p>
    </section>
  );
}
