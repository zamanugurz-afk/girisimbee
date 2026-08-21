'use client';

import {
  Briefcase,
  BrainCircuit,
  Handshake,
  Landmark,
  Megaphone,
  Store,
  UserRoundSearch,
  type LucideIcon,
} from 'lucide-react';
import type { PartnershipIntent } from '@/features/founders/partnership-intent';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { CategoryId } from '@/lib/domain/ids';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';
import { CareerFlowChoiceCards } from '@/components/girisimco/home/career-flow-choice-cards';
import { CreateListingCareerGroup } from '@/components/girisimco/listing/create-listing-career-group';
import { CreateListingVentureGroup } from '@/components/girisimco/listing/create-listing-venture-group';
import {
  CREATE_LISTING_CAREER_HUB,
  CREATE_LISTING_FRANCHISE_HUB,
  CREATE_LISTING_VENTURE_HUB,
} from '@/components/girisimco/listing/create-listing-career.data';
import { Badge } from '@/components/ui/badge';

export type CreateListingHubStep = 'career' | 'venture' | null;

const CATEGORY_VISUAL: Record<
  string,
  {
    audience: string;
    Icon: LucideIcon;
    color: string;
  }
> = {
  [CATEGORY_IDS.yatirimYap]: {
    audience: 'Yatırımcılar · profil yayınlayanlar',
    Icon: Landmark,
    color: GC_CATEGORY_COLORS['yatirim-yap'] ?? '#3B82F6',
  },
  [CATEGORY_IDS.iseAl]: {
    audience: 'İşverenler · açık pozisyon',
    Icon: Briefcase,
    color: GC_CATEGORY_COLORS['ise-al'],
  },
  [CATEGORY_IDS.isBul]: {
    audience: 'İş arayanlar · kariyer profili',
    Icon: UserRoundSearch,
    color: '#0EA5E9',
  },
  [CATEGORY_IDS.ortakBul]: {
    audience: 'Kurucu / iş ortaklığı',
    Icon: Handshake,
    color: GC_CATEGORY_COLORS['ortak-bul'],
  },
  [CATEGORY_IDS.bayilikAl]: {
    audience: 'Franchise veren markalar',
    Icon: Store,
    color: GC_CATEGORY_COLORS.franchise,
  },
  [CATEGORY_IDS.dijitalAi]: {
    audience: 'Yazılım & AI çözümleri',
    Icon: BrainCircuit,
    color: GC_CATEGORY_COLORS['dijital-ai'],
  },
  [CATEGORY_IDS.genelIlan]: {
    audience: 'Diğer ürün / hizmet / duyuru',
    Icon: Megaphone,
    color: GC_CATEGORY_COLORS.ilan,
  },
};

export function CreateListingCategoryPicker({
  onSelect,
  hubStep,
  onHubStepChange,
}: {
  onSelect: (
    categoryId: CategoryId,
    options?: { partnershipIntent?: PartnershipIntent; subIntent?: string },
  ) => void;
  hubStep: CreateListingHubStep;
  onHubStepChange: (step: CreateListingHubStep) => void;
}) {
  if (hubStep === 'career') {
    return (
      <section className="mb-10">
        <CreateListingCareerGroup
          onSelect={onSelect}
          onBack={() => onHubStepChange(null)}
        />
      </section>
    );
  }

  if (hubStep === 'venture') {
    return (
      <section className="mb-10">
        <CreateListingVentureGroup
          onSelect={onSelect}
          onBack={() => onHubStepChange(null)}
        />
      </section>
    );
  }

  return (
    <section className="mb-10">
      <header className="mx-auto max-w-2xl text-center">
        <Badge variant="outline" className="rounded-full px-3 py-1 text-[13px] font-semibold">
          Kategori Seçimi
        </Badge>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-3xl lg:text-[2rem]">
          Hangi tür ilan vereceksiniz?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
          Kariyer profili veya iş ilanı yayınlayın; ortaklık ya da franchise fırsatı oluşturun.
        </p>
      </header>

      <div className="mt-8 lg:mt-10">
        <CareerFlowChoiceCards
          columns={3}
          options={[
            {
              id: 'career',
              label: CREATE_LISTING_CAREER_HUB.title,
              description: CREATE_LISTING_CAREER_HUB.description,
              benefits: CREATE_LISTING_CAREER_HUB.benefits,
            },
            {
              id: 'venture',
              label: CREATE_LISTING_VENTURE_HUB.title,
              description: CREATE_LISTING_VENTURE_HUB.description,
              benefits: CREATE_LISTING_VENTURE_HUB.benefits,
            },
            {
              id: 'franchise',
              label: CREATE_LISTING_FRANCHISE_HUB.title,
              description: CREATE_LISTING_FRANCHISE_HUB.description,
              benefits: CREATE_LISTING_FRANCHISE_HUB.benefits,
            },
          ]}
          visuals={{
            career: {
              color: GC_CATEGORY_COLORS['ise-al'],
              Icon: Briefcase,
            },
            venture: {
              color: GC_CATEGORY_COLORS['ortak-bul'],
              Icon: Handshake,
            },
            franchise: {
              color: GC_CATEGORY_COLORS.franchise,
              Icon: Store,
            },
          }}
          onSelect={(id) => {
            if (id === 'career') onHubStepChange('career');
            if (id === 'venture') onHubStepChange('venture');
            if (id === 'franchise') onSelect(CATEGORY_IDS.bayilikAl);
          }}
        />
      </div>
    </section>
  );
}

export function CreateListingSelectedCategoryBar({
  categoryId,
  label,
  caption = 'Seçilen kategori',
  icon: IconOverride,
  onChange,
}: {
  categoryId: CategoryId;
  label: string;
  caption?: string;
  icon?: LucideIcon;
  onChange: () => void;
}) {
  const visual = CATEGORY_VISUAL[categoryId];
  const Icon = IconOverride ?? visual?.Icon;

  return (
    <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[#E6E8EE] bg-white px-4 py-3 dark:border-border dark:bg-card">
      <div className="flex min-w-0 items-center gap-3">
        {visual && Icon ? (
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: visual.color }}
            aria-hidden
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-[11px] text-[#64748B]">{caption}</p>
          <p className="truncate text-sm font-semibold text-[#0B1220] dark:text-foreground">
            {label}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 text-sm font-semibold text-primary hover:opacity-80"
      >
        Değiştir
      </button>
    </div>
  );
}
