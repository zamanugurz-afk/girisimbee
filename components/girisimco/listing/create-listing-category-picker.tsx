'use client';

import { useMemo, useState } from 'react';
import {
  BrainCircuit,
  Briefcase,
  CircleDollarSign,
  Handshake,
  Landmark,
  Megaphone,
  Store,
  UserRoundSearch,
  type LucideIcon,
} from 'lucide-react';
import {
  CATEGORY_IDS,
  type CategoryListingTypeConfig,
} from '@/features/listings/config/listing-type-config';
import type { CategoryId } from '@/lib/domain/ids';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';
import { CategoryCardButton } from '@/components/girisimco/listing/create-listing-category-card';
import { CreateListingCareerGroup } from '@/components/girisimco/listing/create-listing-career-group';
import {
  CREATE_LISTING_CAREER_CATEGORY_IDS,
  CREATE_LISTING_CAREER_HUB,
  CREATE_LISTING_PICKER_ORDER,
} from '@/components/girisimco/listing/create-listing-career.data';

const CAREER_CREATE_SET = new Set<string>(CREATE_LISTING_CAREER_CATEGORY_IDS);

const CATEGORY_VISUAL: Record<
  string,
  {
    audience: string;
    Icon: LucideIcon;
    color: string;
  }
> = {
  [CATEGORY_IDS.yatirimBul]: {
    audience: 'Girişimciler · yatırımcı arayanlar',
    Icon: CircleDollarSign,
    color: GC_CATEGORY_COLORS['yatirim-bul'],
  },
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
  options,
  onSelect,
}: {
  options: CategoryListingTypeConfig[];
  onSelect: (categoryId: CategoryId) => void;
}) {
  const [careerStep, setCareerStep] = useState(false);
  const ordered = useMemo(() => {
    // Only CREATE_LISTING_PICKER_ORDER ids render in the flat grid.
    // Career types (isBul / iseAl) open from the parent hub card; deferred types stay out.
    const rank = new Map(CREATE_LISTING_PICKER_ORDER.map((id, i) => [id, i]));
    return [...options]
      .filter((c) => rank.has(c.categoryId) && !CAREER_CREATE_SET.has(c.categoryId))
      .sort((a, b) => (rank.get(a.categoryId) ?? 99) - (rank.get(b.categoryId) ?? 99));
  }, [options]);

  if (careerStep) {
    return (
      <section className="mb-10">
        <CreateListingCareerGroup
          onSelect={onSelect}
          onBack={() => setCareerStep(false)}
        />
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div className="mb-6 max-w-xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
          Adım 1
        </p>
        <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-2xl">
          Hangi tür ilan vereceksiniz?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
          Kartların üstündeki hedef kitleye göre seçin. Örn. girişimciyseniz
          “Yatırım Arıyorum”. Form yalnızca seçtiğiniz türe özel alanları gösterir.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((config) => {
          const visual = CATEGORY_VISUAL[config.categoryId];
          if (!visual) return null;
          return (
            <CategoryCardButton
              key={config.categoryId}
              title={config.name}
              description={config.description}
              audience={visual.audience}
              color={visual.color}
              Icon={visual.Icon}
              onClick={() => onSelect(config.categoryId)}
            />
          );
        })}
        <CategoryCardButton
          title={CREATE_LISTING_CAREER_HUB.title}
          description={CREATE_LISTING_CAREER_HUB.description}
          audience={CREATE_LISTING_CAREER_HUB.audience}
          color={GC_CATEGORY_COLORS['ise-al']}
          Icon={Briefcase}
          onClick={() => setCareerStep(true)}
        />
      </div>
    </section>
  );
}

export function CreateListingSelectedCategoryBar({
  categoryId,
  label,
  onChange,
}: {
  categoryId: CategoryId;
  label: string;
  onChange: () => void;
}) {
  const visual = CATEGORY_VISUAL[categoryId];
  const Icon = visual?.Icon;

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
          <p className="text-[11px] text-[#64748B]">Seçilen kategori</p>
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
