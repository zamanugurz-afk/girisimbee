'use client';

import { Briefcase, UserRoundSearch, type LucideIcon } from 'lucide-react';
import { CAREER_FLOW_OPTIONS } from '@/components/girisimco/home/home-marketplace.data';
import {
  OpportunityCard,
  OpportunityCardGrid,
  OpportunityCardBody,
  type OpportunityCardOption,
  type OpportunityCardVisual,
} from '@/components/girisimco/ui/opportunity-card';
import {
  JOB_HIRE_CARD_COLOR,
  JOB_SEEKER_CARD_COLOR,
} from '@/features/listings/utils/listing-card-display';

const FLOW_VISUAL = {
  seek: {
    color: '#0EA5E9',
    Icon: UserRoundSearch,
  },
  hire: {
    color: '#10B981',
    Icon: Briefcase,
  },
} as const;

export type ChoiceCardOption = OpportunityCardOption;
export type ChoiceCardVisual = OpportunityCardVisual;

export { OpportunityCardBody as CareerFlowChoiceCardBody };

export function CareerFlowChoiceCards({
  onSelect,
  options = CAREER_FLOW_OPTIONS,
  visuals,
  columns = 2,
  compact = false,
  splitEnds = false,
}: {
  onSelect?: (id: string) => void;
  options?: readonly ChoiceCardOption[];
  visuals?: Record<string, ChoiceCardVisual>;
  columns?: 2 | 3;
  compact?: boolean;
  splitEnds?: boolean;
}) {
  const visualMap: Record<string, ChoiceCardVisual> = visuals ?? FLOW_VISUAL;

  return (
    <OpportunityCardGrid columns={columns} splitEnds={splitEnds}>
      {options.map((option, index) => {
        const visual = visualMap[option.id];
        if (!visual) return null;

        const splitColClass = splitEnds
          ? index === 0
            ? 'lg:col-start-1'
            : index === 1
              ? 'lg:col-start-3'
              : ''
          : '';

        return (
          <OpportunityCard
            key={option.id}
            option={option}
            visual={visual}
            compact={compact}
            onSelect={onSelect}
            className={splitColClass}
          />
        );
      })}
    </OpportunityCardGrid>
  );
}

