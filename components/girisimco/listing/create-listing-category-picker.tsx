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
import { ScrollReveal } from '@/components/girisimco/ui/scroll-reveal';
import {
  CATEGORY_IDS,
  type CategoryListingTypeConfig,
} from '@/features/listings/config/listing-type-config';
import type { CategoryId } from '@/lib/domain/ids';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

type CreateVisualSlug =
  | 'yatirim-bul'
  | 'ise-al'
  | 'ortak-bul'
  | 'franchise'
  | 'dijital-ai';

const CATEGORY_VISUAL: Record<
  string,
  {
    slug: CreateVisualSlug;
    audience: string;
    Icon: LucideIcon;
    color: string;
    tint: string;
    border: string;
    glow: string;
  }
> = {
  [CATEGORY_IDS.yatirimBul]: {
    slug: 'yatirim-bul',
    audience: 'Yatırım arayanlar',
    Icon: CircleDollarSign,
    color: GC_CATEGORY_COLORS['yatirim-bul'],
    tint: 'from-[#60A5FA]/12 via-[#60A5FA]/4 to-transparent',
    border: 'border-[#60A5FA]/25 group-hover:border-[#60A5FA]/45',
    glow: 'group-hover:shadow-[0_8px_24px_-8px_#60A5FA40]',
  },
  [CATEGORY_IDS.iseAl]: {
    slug: 'ise-al',
    audience: 'İşverenler',
    Icon: Briefcase,
    color: GC_CATEGORY_COLORS['ise-al'],
    tint: 'from-[#22C55E]/12 via-[#22C55E]/4 to-transparent',
    border: 'border-[#22C55E]/25 group-hover:border-[#22C55E]/45',
    glow: 'group-hover:shadow-[0_8px_24px_-8px_#22C55E40]',
  },
  [CATEGORY_IDS.ortakBul]: {
    slug: 'ortak-bul',
    audience: 'Kurucu ortaklık',
    Icon: Handshake,
    color: GC_CATEGORY_COLORS['ortak-bul'],
    tint: 'from-[#F59E0B]/12 via-[#F59E0B]/4 to-transparent',
    border: 'border-[#F59E0B]/25 group-hover:border-[#F59E0B]/45',
    glow: 'group-hover:shadow-[0_8px_24px_-8px_#F59E0B40]',
  },
  [CATEGORY_IDS.bayilikAl]: {
    slug: 'franchise',
    audience: 'Franchise veren',
    Icon: Store,
    color: GC_CATEGORY_COLORS.franchise,
    tint: 'from-[#EC4899]/12 via-[#EC4899]/4 to-transparent',
    border: 'border-[#EC4899]/25 group-hover:border-[#EC4899]/45',
    glow: 'group-hover:shadow-[0_8px_24px_-8px_#EC489940]',
  },
  [CATEGORY_IDS.dijitalAi]: {
    slug: 'dijital-ai',
    audience: 'Ürün & yetenekler',
    Icon: BrainCircuit,
    color: GC_CATEGORY_COLORS['dijital-ai'],
    tint: 'from-[#8B5CF6]/12 via-[#8B5CF6]/4 to-transparent',
    border: 'border-[#8B5CF6]/25 group-hover:border-[#8B5CF6]/45',
    glow: 'group-hover:shadow-[0_8px_24px_-8px_#8B5CF640]',
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
    <section className="mb-8">
      <ScrollReveal>
        <div className="mb-6 max-w-xl">
          <p className="text-gc-xs font-medium uppercase tracking-wide text-primary">Adım 1</p>
          <h2 className="mt-1 font-display text-gc-lg font-semibold tracking-tight text-foreground sm:text-gc-xl">
            Hangi tür ilan vereceksiniz?
          </h2>
          <p className="mt-1.5 text-gc-sm leading-relaxed text-muted-foreground">
            Kategoriyi seçin; form yalnızca o türe özel alanları ve adımları gösterir.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((config, index) => {
          const visual = CATEGORY_VISUAL[config.categoryId];
          if (!visual) return null;
          const { Icon } = visual;

          return (
            <ScrollReveal key={config.categoryId} delay={Math.min(index * 40, 120)}>
              <button
                type="button"
                onClick={() => onSelect(config.categoryId)}
                className={cn(
                  'group relative flex h-full min-h-[9.5rem] w-full flex-col overflow-hidden rounded-2xl border p-4 text-left',
                  'bg-card shadow-md transition-all duration-300 ease-smooth',
                  'hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  visual.border,
                  visual.glow,
                )}
              >
                <div
                  className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b',
                    visual.tint,
                  )}
                  aria-hidden
                />
                <span
                  className="relative mb-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundColor: visual.color,
                    boxShadow: `0 8px 24px -8px ${visual.color}66`,
                  }}
                  aria-hidden
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <span className="relative text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {visual.audience}
                </span>
                <span className="relative mt-0.5 font-display text-gc-base font-semibold text-foreground sm:text-gc-lg">
                  {config.name}
                </span>
                <span className="relative mt-1.5 flex-1 text-gc-xs leading-relaxed text-muted-foreground sm:text-gc-sm">
                  {config.description}
                </span>
                <span
                  className="relative mt-3 inline-flex items-center gap-1 text-gc-xs font-medium opacity-70 transition-all duration-300 group-hover:opacity-100 sm:text-gc-sm"
                  style={{ color: visual.color }}
                >
                  Devam et
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </ScrollReveal>
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
    <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-3">
        {visual && Icon ? (
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: visual.color }}
            aria-hidden
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-gc-xs text-muted-foreground">Seçilen kategori</p>
          <p className="truncate text-gc-sm font-semibold text-foreground">{label}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 text-gc-sm font-medium text-primary hover:text-primary/80"
      >
        Değiştir
      </button>
    </div>
  );
}
