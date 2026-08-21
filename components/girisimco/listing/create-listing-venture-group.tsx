'use client';

import { useState } from 'react';
import { ArrowLeft, Building2, Handshake, Store, Users, DollarSign, StoreIcon, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CareerFlowChoiceCards } from '@/components/girisimco/home/career-flow-choice-cards';
import {
  CREATE_LISTING_VENTURE_CATEGORIES_COPY,
  CREATE_LISTING_VENTURE_HUB,
  CREATE_LISTING_VENTURE_SUB_OPTIONS,
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

const SUB_OPTION_VISUALS: Record<string, { color: string; Icon: any }> = {
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
  const [selectedPillar, setSelectedPillar] = useState<VentureCategoryKey | null>(null);

  if (selectedPillar) {
    const options = CREATE_LISTING_VENTURE_SUB_OPTIONS[selectedPillar];
    const pillarMeta = CREATE_LISTING_VENTURE_CATEGORIES_COPY.categories.find(
      (c) => c.id === selectedPillar,
    );

    return (
      <section aria-labelledby="create-venture-sub-heading">
        <header className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[13px] font-semibold">
            {pillarMeta?.label ?? CREATE_LISTING_VENTURE_HUB.title}
          </Badge>
          <h2
            id="create-venture-sub-heading"
            className="mt-4 font-display text-2xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-3xl lg:text-[2rem]"
          >
            {pillarMeta?.label}: İlan Yönünü Seçin
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
            {pillarMeta?.description}
          </p>
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setSelectedPillar(null)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] transition-colors hover:text-[#0B1220] dark:hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Girişim kategorilerine dön
            </button>
          </div>
        </header>

        <div className="mt-8 lg:mt-10">
          <CareerFlowChoiceCards
            options={options}
            visuals={SUB_OPTION_VISUALS}
            columns={2}
            onSelect={(id) => {
              const categoryId = SUB_ID_TO_CATEGORY[id];
              if (!categoryId) return;
              const partnershipIntent = SUB_ID_TO_INTENT[id];
              onSelect(categoryId, {
                partnershipIntent,
                subIntent: id,
              });
            }}
          />
        </div>

        <p className="mt-8 text-center text-[13px] text-[#94A3B8] lg:mt-10">
          {CREATE_LISTING_VENTURE_CATEGORIES_COPY.trust}
        </p>
      </section>
    );
  }

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
            setSelectedPillar(id as VentureCategoryKey);
          }}
        />
      </div>

      <p className="mt-8 text-center text-[13px] text-[#94A3B8] lg:mt-10">
        {CREATE_LISTING_VENTURE_CATEGORIES_COPY.trust}
      </p>
    </section>
  );
}

