'use client';

import { useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Briefcase,
  CircleDollarSign,
  Handshake,
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

const JOB_GROUP_COLOR = GC_CATEGORY_COLORS['ise-al'];
const JOB_CATEGORY_IDS = new Set<string>([CATEGORY_IDS.iseAl, CATEGORY_IDS.isBul]);

export type CreateListingPickerSelection =
  | { kind: 'category'; categoryId: CategoryId }
  | { kind: 'job' };

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
  [CATEGORY_IDS.isBul]: {
    audience: 'İş arayanlar',
    Icon: UserRoundSearch,
    color: '#0EA5E9',
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
  onSelect: (selection: CreateListingPickerSelection) => void;
}) {
  const { standalone, hasJobGroup } = useMemo(() => {
    let jobs = false;
    const rest: CategoryListingTypeConfig[] = [];
    for (const config of options) {
      if (JOB_CATEGORY_IDS.has(config.categoryId)) jobs = true;
      else rest.push(config);
    }
    return { standalone: rest, hasJobGroup: jobs };
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
          Kategoriyi seçin; form yalnızca o türe özel alanları gösterir.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {hasJobGroup ? (
          <CategoryCardButton
            title="İş İlanları"
            description="İşe alıyorum veya iş arıyorum"
            audience="İşveren / iş arayan"
            color={JOB_GROUP_COLOR}
            Icon={Briefcase}
            onClick={() => onSelect({ kind: 'job' })}
          />
        ) : null}

        {standalone.map((config) => {
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
              onClick={() => onSelect({ kind: 'category', categoryId: config.categoryId })}
            />
          );
        })}
      </div>
    </section>
  );
}

function JobFlowOption({
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
        'group relative flex h-full min-h-[11.5rem] flex-col overflow-hidden rounded-2xl border border-[#E8EBF1] bg-white p-5 pl-6 text-left',
        'shadow-[0_1px_0_rgba(15,23,42,0.03)] transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-[#D5DAE5] hover:shadow-[0_12px_28px_-18px_rgba(15,23,42,0.28)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        'dark:border-border dark:bg-card',
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-2xl"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span
        className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: color }}
        aria-hidden
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
        {audience}
      </span>
      <span className="mt-1.5 font-display text-[1.05rem] font-semibold tracking-tight text-[#0B1220] dark:text-foreground">
        {title}
      </span>
      <span className="mt-2 flex-1 text-[13px] leading-relaxed text-[#64748B]">{description}</span>
      <span
        className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
        style={{ color }}
      >
        Devam et
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

/**
 * Full-screen job flow chooser.
 * Replaces the category grid — other listing cards must not render alongside this.
 */
export function JobListingFlowStep({
  onSelect,
  onBack,
}: {
  onSelect: (categoryId: CategoryId) => void;
  onBack: () => void;
}) {
  return (
    <section className="mb-10">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
            Adım 1 · İş İlanları
          </p>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-2xl">
            Akışınızı seçin
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
            İşe alım veya anonim kariyer özeti — form seçiminize göre açılır.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E6E8EE] bg-white px-3.5 py-2',
            'text-sm font-medium text-[#64748B] transition-colors',
            'hover:border-[#C7CBD6] hover:text-[#0B1220]',
            'dark:border-border dark:bg-card dark:hover:text-foreground',
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Geri
        </button>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <JobFlowOption
          title="İşe Alıyorum"
          description="Açık pozisyon yayınlayın; adaylar iletişim talebi gönderebilir."
          audience="İşverenler"
          color={GC_CATEGORY_COLORS['ise-al']}
          Icon={Briefcase}
          onClick={() => onSelect(CATEGORY_IDS.iseAl)}
        />
        <JobFlowOption
          title="İş Arıyorum"
          description="Anonim kariyer özeti oluşturun; CV ve firma adı paylaşmadan işverenlere ulaşın."
          audience="İş arayanlar"
          color="#0EA5E9"
          Icon={UserRoundSearch}
          onClick={() => onSelect(CATEGORY_IDS.isBul)}
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
  const isJobFlow = JOB_CATEGORY_IDS.has(categoryId);
  const displayLabel = isJobFlow ? `İş İlanları · ${label}` : label;

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
            {displayLabel}
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
