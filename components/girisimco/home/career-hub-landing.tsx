import { CareerFlowChoiceCards } from '@/components/girisimco/home/career-flow-choice-cards';
import { CareerFlowChoiceHeader } from '@/components/girisimco/home/career-flow-choice-header';
import { CAREER_HUB_LANDING } from '@/components/girisimco/home/home-marketplace.data';

export function CareerHubLanding() {
  return (
    <div className="gc-header-offset bg-[#FAFBFC] dark:bg-background">
      <div className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8 lg:py-16">
        <CareerFlowChoiceHeader />

        <div className="mt-10 lg:mt-12">
          <CareerFlowChoiceCards />
        </div>

        <p className="mt-8 text-center text-[13px] text-[#94A3B8] lg:mt-10">
          {CAREER_HUB_LANDING.trust}
        </p>
      </div>
    </div>
  );
}
