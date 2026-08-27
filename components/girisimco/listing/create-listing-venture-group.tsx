'use client';

import { ArrowLeft, Building2, Handshake, Store, Users, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CareerFlowChoiceCards } from '@/components/girisimco/home/career-flow-choice-cards';
import {
  CREATE_LISTING_VENTURE_CATEGORIES_COPY,
  CREATE_LISTING_VENTURE_HUB,
} from '@/components/girisimco/listing/create-listing-career.data';
import type { PartnershipIntent } from '@/features/founders/partnership-intent';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';
import type { CategoryId } from '@/lib/domain/ids';

type VentureCategoryKey = 'partnership' | 'business_transfer';

const MAIN_CATEGORY_VISUALS = {
  partnership: {
    color: GC_CATEGORY_COLORS['ortak-bul'],
    Icon: Handshake,
  },
  franchise: {
    color: GC_CATEGORY_COLORS.franchise,
    Icon: Store,
  },
  business_transfer: {
    color: GC_CATEGORY_COLORS['isletme-devri'] ?? '#D97706',
    Icon: Building2,
  },
} as const;

/** Preserved in repository for future modular re-activation */
export const SUB_OPTION_VISUALS: Record<string, { color: string; Icon: any }> = {
  'ortak-ariyorum': {
    color: GC_CATEGORY_COLORS['ortak-bul'],
    Icon: Handshake,
  },
  'ortak-olmak': {
    color: GC_CATEGORY_COLORS['ortak-bul'],
    Icon: Users,
  },
  'isletme-devret': {
    color: GC_CATEGORY_COLORS['isletme-devri'] ?? '#D97706',
    Icon: Building2,
  },
  'isletme-devral': {
    color: GC_CATEGORY_COLORS['isletme-devri'] ?? '#D97706',
    Icon: ArrowRightLeft,
  },
};

const SUB_ID_TO_CATEGORY: Record<string, CategoryId> = {
  'ortak-ariyorum': CATEGORY_IDS.ortakBul,
  'ortak-olmak': CATEGORY_IDS.ortakBul,
  'isletme-devret': CATEGORY_IDS.isletmeDevri,
  'isletme-devral': CATEGORY_IDS.isletmeDevri,
};

const SUB_ID_TO_INTENT: Record<string, PartnershipIntent> = {
  'ortak-ariyorum': 'seeking',
  'ortak-olmak': 'joining',
};

export function CreateListingVentureGroup({
  onSelect,
  onBack,
}: {
  onSelect: (categoryId: CategoryId, options?: { partnershipIntent?: PartnershipIntent; subIntent?: string }) => void;
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
          {CREATE_LISTING_VENTURE_CATEGORIES_COPY.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
          {CREATE_LISTING_VENTURE_CATEGORIES_COPY.description}
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
          options={CREATE_LISTING_VENTURE_CATEGORIES_COPY.categories}
          visuals={MAIN_CATEGORY_VISUALS}
          columns={2}
          onSelect={(id) => {
            if (id === 'partnership') {
              onSelect(CATEGORY_IDS.ortakBul, {
                partnershipIntent: 'seeking',
                subIntent: 'ortak-ariyorum',
              });
              return;
            }
            if (id === 'business_transfer') {
              onSelect(CATEGORY_IDS.isletmeDevri, {
                subIntent: 'isletme-devret',
              });
              return;
            }
          }}
        />
      </div>

      <p className="mt-8 text-center text-[13px] text-[#94A3B8] lg:mt-10">
        {CREATE_LISTING_VENTURE_CATEGORIES_COPY.trust}
      </p>
    </section>
  );
}

