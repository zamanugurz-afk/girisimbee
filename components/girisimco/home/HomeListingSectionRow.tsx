'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ContentItem } from '@/features/categories/types/category.types';
import { ContentCard } from '@/components/girisimco/content-card';
import { FavoriteButton } from '@/components/girisimco/marketplace/favorite-button';
import { ListingCardSkeleton } from '@/components/girisimco/ui/listing-card-skeleton';
import type { HomeListingSectionConfig } from '@/features/home/config/home-sections.config';
import type { HomeListingSectionState } from '@/features/home/types/home-section.types';
import type { ListingId } from '@/lib/domain/ids';
import { cn } from '@/lib/utils';

interface HomeListingSectionRowProps {
  config: HomeListingSectionConfig;
  state: HomeListingSectionState;
}

type FeaturedTabId =
  | 'all'
  | 'entrepreneur'
  | 'investor'
  | 'job'
  | 'partner'
  | 'digital-ai'
  | 'general';

const FEATURED_CATEGORY_TABS: {
  id: FeaturedTabId;
  label: string;
  viewAllHref: string;
  /** Client-side match against already-loaded featured items (fast path). */
  match: (item: ContentItem) => boolean;
}[] = [
  {
    id: 'all',
    label: 'Tümü',
    viewAllHref: '/kesfet?featured=1',
    match: () => true,
  },
  {
    id: 'entrepreneur',
    label: 'Girişimci',
    viewAllHref: '/invest',
    match: (item) =>
      item.listingIconKey === 'investment'
      || item.listingTypeLabel?.toLocaleLowerCase('tr-TR').includes('yatırım arıyorum') === true,
  },
  {
    id: 'investor',
    label: 'Yatırımcı',
    viewAllHref: '/investors',
    match: (item) =>
      item.listingIconKey === 'investor'
      || item.listingTypeLabel?.toLocaleLowerCase('tr-TR').includes('yatırım yapıyorum') === true,
  },
  {
    id: 'job',
    label: 'İş Fırsatı',
    viewAllHref: '/is',
    match: (item) =>
      item.listingIconKey === 'employer'
      || item.listingIconKey === 'job-seeker'
      || item.listingGroupLabel === 'İş',
  },
  {
    id: 'partner',
    label: 'Ortaklık',
    viewAllHref: '/partners',
    match: (item) =>
      item.listingIconKey === 'partner'
      || item.listingGroupLabel === 'Ortaklık',
  },
  {
    id: 'digital-ai',
    label: 'Dijital & AI Çözümleri',
    viewAllHref: '/dijital-ai',
    match: (item) =>
      item.listingIconKey === 'digital'
      || item.listingGroupLabel === 'Dijital & AI Çözümleri'
      || item.listingTypeLabel?.toLocaleLowerCase('tr-TR').includes('dijital') === true,
  },
  {
    id: 'general',
    label: 'Genel İlanlar',
    viewAllHref: '/kesfet',
    match: (item) =>
      item.listingIconKey === 'general'
      || item.listingGroupLabel === 'İlan'
      || item.listingTypeLabel?.toLocaleLowerCase('tr-TR') === 'ilan',
  },
];

const DESKTOP_LIMIT = 4;
const SECTION_GRID_CLASS = 'hidden gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-4';

type TabFetchCache = Partial<Record<FeaturedTabId, ContentItem[]>>;

export function HomeListingSectionRow({ config, state }: HomeListingSectionRowProps) {
  const isFeatured = config.id === 'featured';
  const [activeTab, setActiveTab] = useState<FeaturedTabId>('all');
  const [tabItems, setTabItems] = useState<ContentItem[] | null>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState<string | null>(null);
  const cacheRef = useRef<TabFetchCache>({});
  const fetchGenRef = useRef(0);

  const activeTabConfig =
    FEATURED_CATEGORY_TABS.find((tab) => tab.id === activeTab) ?? FEATURED_CATEGORY_TABS[0];

  const localFiltered = useMemo(() => {
    if (!isFeatured || activeTabConfig.id === 'all') {
      return state.items.slice(0, DESKTOP_LIMIT);
    }
    return state.items.filter(activeTabConfig.match).slice(0, DESKTOP_LIMIT);
  }, [activeTabConfig, isFeatured, state.items]);

  const localFilteredKey = useMemo(
    () => localFiltered.map((item) => item.id).join('|'),
    [localFiltered],
  );

  useEffect(() => {
    if (!isFeatured) return;

    if (activeTab === 'all') {
      fetchGenRef.current += 1;
      setTabItems(null);
      setTabLoading(false);
      setTabError(null);
      return;
    }

    // Prefer already-loaded featured items when the tab has matches.
    if (localFiltered.length > 0) {
      fetchGenRef.current += 1;
      setTabItems(localFiltered);
      setTabLoading(false);
      setTabError(null);
      return;
    }

    // Cache empty arrays too — otherwise empty tabs refetch forever.
    if (Object.prototype.hasOwnProperty.call(cacheRef.current, activeTab)) {
      fetchGenRef.current += 1;
      setTabItems(cacheRef.current[activeTab] ?? []);
      setTabLoading(false);
      setTabError(null);
      return;
    }

    const tabId = activeTab;
    const generation = ++fetchGenRef.current;
    const controller = new AbortController();
    // Drop previous tab's cards immediately so stale listings never stick.
    setTabItems(null);
    setTabLoading(true);
    setTabError(null);

    void (async () => {
      try {
        const res = await fetch(
          `/api/marketplace/home-sections?featuredTab=${encodeURIComponent(tabId)}`,
          { method: 'GET', signal: controller.signal },
        );
        const body = (await res.json()) as {
          data?: { items?: ContentItem[] };
          error?: string;
        };
        if (generation !== fetchGenRef.current) return;
        if (!res.ok) {
          throw new Error(body.error ?? 'İlanlar yüklenemedi');
        }
        const items = (body.data?.items ?? []).slice(0, DESKTOP_LIMIT);
        cacheRef.current[tabId] = items;
        setTabItems(items);
      } catch (error) {
        if (generation !== fetchGenRef.current) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (error instanceof Error && error.name === 'AbortError') return;
        setTabItems([]);
        setTabError(error instanceof Error ? error.message : 'İlanlar yüklenemedi');
      } finally {
        if (generation === fetchGenRef.current) {
          setTabLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
    // localFilteredKey stabilizes identity; localFiltered read intentionally for contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- localFilteredKey tracks item ids
  }, [activeTab, isFeatured, localFilteredKey]);

  const visibleItems =
    isFeatured && activeTab !== 'all'
      ? (tabLoading ? [] : (tabItems ?? localFiltered))
      : localFiltered;

  const viewAllHref = isFeatured ? activeTabConfig.viewAllHref : config.viewAllHref;
  const showLoading =
    state.isLoading || (isFeatured && activeTab !== 'all' && (tabLoading || tabItems === null));

  function selectTab(id: FeaturedTabId) {
    if (id === activeTab) return;
    // Cancel in-flight requests and clear cards so the previous tab never sticks.
    fetchGenRef.current += 1;
    setTabError(null);
    setTabItems(null);
    setTabLoading(id !== 'all');
    setActiveTab(id);
  }

  return (
    <section className="space-y-5" aria-labelledby={`home-section-${config.id}`}>
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border border-[#E8EAF0] bg-white/90',
            'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-18px_rgba(15,23,42,0.18)]',
            'dark:border-border dark:bg-card',
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background: `radial-gradient(ellipse 70% 120% at 0% 0%, ${config.accent}14, transparent 55%)`,
            }}
            aria-hidden
          />
          <div
            className="absolute inset-y-3 left-0 w-[3px] rounded-full"
            style={{ backgroundColor: config.accent }}
            aria-hidden
          />

          <div className="relative flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
            <div className="min-w-0 pl-2 sm:pl-2.5">
              <h2
                id={`home-section-${config.id}`}
                className={cn(
                  'font-display text-xl font-bold tracking-tight sm:text-2xl',
                  config.titleClassName,
                )}
              >
                {config.title}
              </h2>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#64748B]">
                {config.description}
              </p>
            </div>

            <Link
              href={viewAllHref}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-[#E6E8EE] bg-white/95',
                'px-3.5 py-2 text-[13px] font-semibold text-[#0B1220]',
                'shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all',
                'hover:border-[#0B1220]/20 hover:bg-white hover:shadow-[0_4px_12px_-6px_rgba(15,23,42,0.2)]',
                'sm:self-auto dark:border-border dark:bg-card dark:text-foreground',
              )}
            >
              Tümünü Gör
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        {isFeatured ? (
          <div
            className="flex flex-wrap gap-1.5"
            role="tablist"
            aria-label="Öne çıkan kategori filtreleri"
          >
            {FEATURED_CATEGORY_TABS.map((tab) => {
              const selected = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-pressed={selected}
                  onClick={() => selectTab(tab.id)}
                  className={cn(
                    'inline-flex items-center rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors',
                    selected
                      ? 'bg-[#0B1220] text-white'
                      : 'bg-[#F1F3F7] text-[#475569] hover:bg-[#E8EAF0] hover:text-[#0B1220] dark:bg-muted dark:text-muted-foreground',
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {showLoading ? (
        <>
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 lg:hidden">
            {Array.from({ length: DESKTOP_LIMIT }).map((_, index) => (
              <div key={index} className="w-[18rem] shrink-0">
                <ListingCardSkeleton />
              </div>
            ))}
          </div>
          <div className={SECTION_GRID_CLASS}>
            {Array.from({ length: DESKTOP_LIMIT }).map((_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        </>
      ) : state.error || tabError ? (
        <p className="rounded-2xl border border-dashed border-[#E6E8EE] bg-white px-5 py-8 text-sm text-[#64748B]">
          {tabError ?? state.error}
        </p>
      ) : visibleItems.length === 0 ? (
        <p className="flex min-h-[14rem] items-center rounded-2xl border border-dashed border-[#E6E8EE] bg-white px-5 py-8 text-sm text-[#64748B]">
          {isFeatured && activeTab !== 'all'
            ? 'Bu kategoride henüz ilan yok.'
            : config.emptyMessage}
        </p>
      ) : (
        <>
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 snap-x snap-mandatory ib-scrollbar-none lg:hidden">
            {visibleItems.map((item) => (
              <HomeSectionCard key={item.id} item={item} layout="scroll" />
            ))}
          </div>
          <div className={SECTION_GRID_CLASS}>
            {visibleItems.map((item) => (
              <HomeSectionCard key={item.id} item={item} layout="grid" />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function HomeSectionCard({
  item,
  layout,
}: {
  item: ContentItem;
  layout: 'scroll' | 'grid';
}) {
  return (
    <div
      className={cn(
        'relative h-full',
        layout === 'scroll' && 'w-[18rem] shrink-0 snap-start',
        layout === 'grid' && 'min-w-0',
      )}
    >
      <ContentCard item={item} />
      {item.listingId && (
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton listingId={item.listingId as ListingId} />
        </div>
      )}
    </div>
  );
}
