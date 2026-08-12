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
  size = 'default',
}: {
  title: string;
  description: string;
  audience: string;
  color: string;
  Icon: LucideIcon;
  onClick: () => void;
  /** `lg` = same listing-card format, just larger (job flow step). */
  size?: 'default' | 'lg';
}) {
  const large = size === 'lg';
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-xl border border-[#E6E8EE] bg-white text-left',
        'transition-colors duration-200 hover:border-[#C7CBD6] hover:bg-[#FAFBFC]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        'dark:border-border dark:bg-card',
        large ? 'min-h-[14.5rem] p-5 sm:min-h-[15.5rem] sm:p-6' : 'min-h-[8.5rem] p-4',
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span
        className={cn(
          'mb-3 inline-flex items-center justify-center rounded-lg text-white',
          large ? 'h-10 w-10' : 'h-9 w-9',
        )}
        style={{ backgroundColor: color }}
        aria-hidden
      >
        <Icon className={large ? 'h-[18px] w-[18px]' : 'h-4 w-4'} strokeWidth={1.75} />
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">
        {audience}
      </span>
      <span
        className={cn(
          'mt-1 font-display font-semibold text-[#0B1220] dark:text-foreground',
          large ? 'text-lg' : 'text-base',
        )}
      >
        {title}
      </span>
      <span
        className={cn(
          'mt-1.5 flex-1 leading-relaxed text-[#64748B]',
          large ? 'text-[13px]' : 'text-[12px]',
        )}
      >
        {description}
      </span>
      <span
        className={cn(
          'mt-3 inline-flex items-center gap-1 font-semibold opacity-80 transition-opacity group-hover:opacity-100',
          large ? 'text-[13px]' : 'text-[12px]',
        )}
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

const HIRE_FLOW_COLOR = GC_CATEGORY_COLORS['ise-al'];
const SEEK_FLOW_COLOR = '#0EA5E9';

/**
 * Same listing-card format as the category grid — larger, side-by-side, no shared shell.
 * Page title/copy + Geri live on /ilan/olustur when this step is active.
 */
export function JobListingFlowStep({
  onSelect,
}: {
  onSelect: (categoryId: CategoryId) => void;
}) {
  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <CategoryCardButton
          size="lg"
          title="İşe Alıyorum"
          description="Açık pozisyon yayınlayın; adaylar iletişim talebi gönderebilir"
          audience="İşverenler"
          color={HIRE_FLOW_COLOR}
          Icon={Briefcase}
          onClick={() => onSelect(CATEGORY_IDS.iseAl)}
        />
        <CategoryCardButton
          size="lg"
          title="İş Arıyorum"
          description="Anonim kariyer özeti oluşturun; CV ve firma adı paylaşmadan işverenlere ulaşın"
          audience="İş arayanlar"
          color={SEEK_FLOW_COLOR}
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
