'use client';

import { useMemo } from 'react';
import {
  ArrowRight,
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
import { cn } from '@/lib/utils';

/**
 * Display order on /ilan/olustur.
 * Yatırım Yapacağım (yatirimYap) is deferred from create — kept in CATEGORY_VISUAL for restore.
 */
const PICKER_ORDER: CategoryId[] = [
  CATEGORY_IDS.yatirimBul,
  // CATEGORY_IDS.yatirimYap, // deferred — restore with CREATE_LISTING_DEFERRED_CATEGORY_IDS
  CATEGORY_IDS.ortakBul,
  CATEGORY_IDS.bayilikAl,
  CATEGORY_IDS.iseAl,
  CATEGORY_IDS.isBul,
  CATEGORY_IDS.dijitalAi,
  CATEGORY_IDS.genelIlan,
];

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

function CategoryCardButton({
  title,
  description,
  audience,
  color,
  Icon,
  onClick,
}: {
  title: string;
  description: string;
  audience: string;
  color: string;
  Icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex min-h-[8.5rem] w-full flex-col overflow-hidden rounded-xl border border-[#E6E8EE] bg-white p-4 text-left',
        'transition-colors duration-200 hover:border-[#C7CBD6] hover:bg-[#FAFBFC]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        'dark:border-border dark:bg-card',
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span
        className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: color }}
        aria-hidden
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">
        {audience}
      </span>
      <span className="mt-1 font-display text-base font-semibold text-[#0B1220] dark:text-foreground">
        {title}
      </span>
      <span className="mt-1.5 flex-1 text-[12px] leading-relaxed text-[#64748B]">
        {description}
      </span>
      <span
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold opacity-80 transition-opacity group-hover:opacity-100"
        style={{ color }}
      >
        Devam et
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

export function CreateListingCategoryPicker({
  options,
  onSelect,
}: {
  options: CategoryListingTypeConfig[];
  onSelect: (categoryId: CategoryId) => void;
}) {
  const ordered = useMemo(() => {
    const rank = new Map(PICKER_ORDER.map((id, i) => [id, i]));
    return [...options].sort((a, b) => {
      const ra = rank.get(a.categoryId) ?? 99;
      const rb = rank.get(b.categoryId) ?? 99;
      return ra - rb;
    });
  }, [options]);

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
