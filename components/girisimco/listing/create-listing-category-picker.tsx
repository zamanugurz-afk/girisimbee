'use client';

import {
  ArrowRight,
  BrainCircuit,
  Briefcase,
  CircleDollarSign,
  Handshake,
  Store,
  type LucideIcon,
} from 'lucide-react';
import {
  CATEGORY_IDS,
  type CategoryListingTypeConfig,
} from '@/features/listings/config/listing-type-config';
import type { CategoryId } from '@/lib/domain/ids';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

const CATEGORY_VISUAL: Record<
  string,
  {
    audience: string;
    Icon: LucideIcon;
    color: string;
  }
> = {
  [CATEGORY_IDS.yatirimBul]: {
    audience: 'Yatırım arayanlar',
    Icon: CircleDollarSign,
    color: GC_CATEGORY_COLORS['yatirim-bul'],
  },
  [CATEGORY_IDS.iseAl]: {
    audience: 'İşverenler',
    Icon: Briefcase,
    color: GC_CATEGORY_COLORS['ise-al'],
  },
  [CATEGORY_IDS.ortakBul]: {
    audience: 'Kurucu ortaklık',
    Icon: Handshake,
    color: GC_CATEGORY_COLORS['ortak-bul'],
  },
  [CATEGORY_IDS.bayilikAl]: {
    audience: 'Franchise veren',
    Icon: Store,
    color: GC_CATEGORY_COLORS.franchise,
  },
  [CATEGORY_IDS.dijitalAi]: {
    audience: 'Ürün & yetenekler',
    Icon: BrainCircuit,
    color: GC_CATEGORY_COLORS['dijital-ai'],
  },
};

export function CreateListingCategoryPicker({
  options,
  onSelect,
}: {
  options: CategoryListingTypeConfig[];
  onSelect: (categoryId: CategoryId) => void;
}) {
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
          Kategoriyi seçin; form yalnızca o türe özel alanları gösterir.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((config) => {
          const visual = CATEGORY_VISUAL[config.categoryId];
          if (!visual) return null;
          const { Icon } = visual;

          return (
            <button
              key={config.categoryId}
              type="button"
              onClick={() => onSelect(config.categoryId)}
              className={cn(
                'group relative flex min-h-[8.5rem] w-full flex-col overflow-hidden rounded-xl border border-[#E6E8EE] bg-white p-4 text-left',
                'transition-colors duration-200 hover:border-[#C7CBD6] hover:bg-[#FAFBFC]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                'dark:border-border dark:bg-card',
              )}
            >
              <span
                className="absolute inset-y-0 left-0 w-[3px]"
                style={{ backgroundColor: visual.color }}
                aria-hidden
              />
              <span
                className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: visual.color }}
                aria-hidden
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">
                {visual.audience}
              </span>
              <span className="mt-1 font-display text-base font-semibold text-[#0B1220] dark:text-foreground">
                {config.name}
              </span>
              <span className="mt-1.5 flex-1 text-[12px] leading-relaxed text-[#64748B]">
                {config.description}
              </span>
              <span
                className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold opacity-80 transition-opacity group-hover:opacity-100"
                style={{ color: visual.color }}
              >
                Devam et
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
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
