import type { ReactNode } from 'react';
import { CAREER_HUB_LANDING } from '@/components/girisimco/home/home-marketplace.data';
import { Badge } from '@/components/ui/badge';

export function CareerFlowChoiceHeader({
  headingLevel = 'h1',
  headingId,
  action,
}: {
  headingLevel?: 'h1' | 'h2';
  headingId?: string;
  action?: ReactNode;
}) {
  const Heading = headingLevel;

  return (
    <header className="mx-auto max-w-2xl text-center">
      <Badge variant="outline" className="rounded-full px-3 py-1 text-[13px] font-semibold">
        {CAREER_HUB_LANDING.badge}
      </Badge>
      <Heading
        id={headingId}
        className="mt-4 font-display text-2xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-3xl lg:text-[2rem]"
      >
        {CAREER_HUB_LANDING.title}
      </Heading>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <p className="text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
          {CAREER_HUB_LANDING.description}
        </p>
        {action}
      </div>
    </header>
  );
}
