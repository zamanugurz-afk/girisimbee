'use client';

import { ArrowLeft, Handshake, Store, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CareerFlowChoiceCards } from '@/components/girisimco/home/career-flow-choice-cards';
import {
  CREATE_LISTING_VENTURE_COPY,
  CREATE_LISTING_VENTURE_HUB,
} from '@/components/girisimco/listing/create-listing-career.data';
import type { PartnershipIntent } from '@/features/founders/partnership-intent';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';
import type { CategoryId } from '@/lib/domain/ids';

const VENTURE_TO_CATEGORY: Record<string, CategoryId> = {
  'ortak-ariyorum': CATEGORY_IDS.ortakBul,
  'ortak-olmak': CATEGORY_IDS.ortakBul,
  franchise: CATEGORY_IDS.bayilikAl,
};

const VENTURE_TO_INTENT: Partial<Record<string, PartnershipIntent>> = {
  'ortak-ariyorum': 'seeking',
  'ortak-olmak': 'joining',
};

const VENTURE_VISUALS = {
  'ortak-ariyorum': {
    color: GC_CATEGORY_COLORS['ortak-bul'],
    Icon: Handshake,
  },
  'ortak-olmak': {
    color: GC_CATEGORY_COLORS['ortak-bul'],
    Icon: Users,
  },
  franchise: {
    color: GC_CATEGORY_COLORS.franchise,
    Icon: Store,
  },
} as const;

export function CreateListingVentureGroup({
  onSelect,
  onBack,
}: {
  onSelect: (categoryId: CategoryId, options?: { partnershipIntent?: PartnershipIntent }) => void;
  onBack: () => void;
}) {
  return (
    <section aria-labelledby="create-venture-heading">
      <header className="mx-auto max-w-2xl text-center">
        <Badge variant="outline" className="rounded-full px-3 py-1 text-[13px] font-semibold">
          {CREATE_LISTING_VENTURE_HUB.title}
        </Badge>
        <h2
          id="create-venture-heading"
          className="mt-4 font-display text-2xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-3xl lg:text-[2rem]"
        >
          {CREATE_LISTING_VENTURE_COPY.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
          {CREATE_LISTING_VENTURE_COPY.description}
        </p>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] transition-colors hover:text-[#0B1220] dark:hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kategorilere dön
          </button>
        </div>
      </header>

      <div className="mt-8 lg:mt-10">
        <CareerFlowChoiceCards
          options={CREATE_LISTING_VENTURE_COPY.options}
          visuals={VENTURE_VISUALS}
          columns={3}
          onSelect={(id) => {
            const categoryId = VENTURE_TO_CATEGORY[id];
            if (!categoryId) return;
            const partnershipIntent = VENTURE_TO_INTENT[id];
            onSelect(categoryId, partnershipIntent ? { partnershipIntent } : undefined);
          }}
        />
      </div>

      <p className="mt-8 text-center text-[13px] text-[#94A3B8] lg:mt-10">
        {CREATE_LISTING_VENTURE_COPY.trust}
      </p>
    </section>
  );
}
