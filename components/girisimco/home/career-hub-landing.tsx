import { CareerFlowChoiceCards } from '@/components/girisimco/home/career-flow-choice-cards';
import { CAREER_HUB_LANDING } from '@/components/girisimco/home/home-marketplace.data';
import { Badge } from '@/components/ui/badge';

export function CareerHubLanding() {
  return (
    <div className="gc-header-offset bg-[#FAFBFC] dark:bg-background">
      <div className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8 lg:py-16">
        <header className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[13px] font-semibold">
            {CAREER_HUB_LANDING.badge}
          </Badge>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-3xl lg:text-[2rem]">
            {CAREER_HUB_LANDING.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
            {CAREER_HUB_LANDING.description}
          </p>
        </header>

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
