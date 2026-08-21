'use client';

import { type LucideIcon } from 'lucide-react';
import {
  OpportunityCard,
  OpportunityCardGrid,
} from '@/components/girisimco/ui/opportunity-card';

/** Shared picker grid — root hubs use two columns at the same card density. */
export const CREATE_LISTING_CATEGORY_CARD_GRID =
  'mx-auto grid max-w-[52rem] grid-cols-1 gap-3.5 md:grid-cols-2 lg:gap-4';

export function CategoryCardButton({
  title,
  description,
  color,
  Icon,
  onClick,
  ctaLabel = 'Devam et',
}: {
  title: string;
  description: string;
  audience?: string;
  color: string;
  Icon: LucideIcon;
  onClick: () => void;
  ctaLabel?: string;
}) {
  return (
    <OpportunityCard
      compact
      onSelect={onClick}
      option={{
        id: title,
        label: title,
        description,
        benefits: [],
        ctaLabel,
      }}
      visual={{
        color,
        Icon,
      }}
    />
  );
}

export { OpportunityCard, OpportunityCardGrid };
