'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ContentItem } from '@/features/categories/types/category.types';
import { ContentCard } from '@/components/girisimco/content-card';
import { FavoriteButton } from '@/components/girisimco/marketplace/favorite-button';
import { ListingCardSkeleton } from '@/components/girisimco/ui/listing-card-skeleton';
import type { HomeListingSectionConfig } from '@/features/home/config/home-sections.config';
import {
  HOME_CATEGORY_TABS,
  type HomeCategoryTabId,
} from '@/features/home/config/home-category-tabs';
import type { HomeListingSectionState } from '@/features/home/types/home-section.types';
import type { ListingId } from '@/lib/domain/ids';
import { cn } from '@/lib/utils';

interface HomeListingSectionRowProps {
  config: HomeListingSectionConfig;
  state: HomeListingSectionState;
  categoryTab: HomeCategoryTabId;
  onCategoryTabChange?: (tab: HomeCategoryTabId) => void;
  /** Tabs render only on Öne Çıkan; selection filters every home section. */
  showCategoryTabs?: boolean;
}

const DESKTOP_LIMIT = 4;
const SECTION_GRID_CLASS = 'hidden gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-4';

export function HomeListingSectionRow({
  config,
  state,
  categoryTab,
  onCategoryTabChange,
  showCategoryTabs = false,
}: HomeListingSectionRowProps) {
  const activeTabConfig =
    HOME_CATEGORY_TABS.find((tab) => tab.id === categoryTab) ?? HOME_CATEGORY_TABS[0];

  /** Instant client filter from already-loaded section items. */
  const localFiltered = useMemo(() => {
    if (categoryTab === 'all') {
      return state.items.slice(0, DESKTOP_LIMIT);
    }
    return state.items.filter(activeTabConfig.match).slice(0, DESKTOP_LIMIT);
  }, [activeTabConfig, categoryTab, state.items]);

  const [remoteItems, setRemoteItems] = useState<ContentItem[] | null>(null);
  const [remoteTab, setRemoteTab] = useState<HomeCategoryTabId | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const fetchGenRef = useRef(0);
  const cacheRef = useRef<Partial<Record<string, ContentItem[]>>>({});

  const needsRemote =
    categoryTab !== 'all' && !state.isLoading && localFiltered.length === 0;

  useEffect(() => {
    if (!needsRemote) {
      fetchGenRef.current += 1;
      setRemoteLoading(false);
      setRemoteError(null);
      return;
    }

    const cacheKey = `${config.id}:${categoryTab}`;
    if (Object.prototype.hasOwnProperty.call(cacheRef.current, cacheKey)) {
      setRemoteItems(cacheRef.current[cacheKey] ?? []);
      setRemoteTab(categoryTab);
      setRemoteLoading(false);
      setRemoteError(null);
      return;
    }

    const tabId = categoryTab;
    const generation = ++fetchGenRef.current;
    const controller = new AbortController();
    setRemoteLoading(true);
    setRemoteError(null);
    setRemoteItems(null);
    setRemoteTab(tabId);

    void (async () => {
      try {
        const params = new URLSearchParams({
          categoryTab: tabId,
          sectionId: config.id,
        });
        const res = await fetch(`/api/marketplace/home-sections?${params}`, {
          method: 'GET',
          signal: controller.signal,
        });
        const body = (await res.json()) as {
          data?: { items?: ContentItem[] };
          error?: string;
        };
        if (generation !== fetchGenRef.current) return;
        if (!res.ok) {
          throw new Error(body.error ?? 'İlanlar yüklenemedi');
        }
        const items = (body.data?.items ?? []).slice(0, DESKTOP_LIMIT);
        cacheRef.current[cacheKey] = items;
        setRemoteItems(items);
        setRemoteTab(tabId);
      } catch (error) {
        if (generation !== fetchGenRef.current) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (error instanceof Error && error.name === 'AbortError') return;
        setRemoteItems([]);
        setRemoteTab(tabId);
        setRemoteError(error instanceof Error ? error.message : 'İlanlar yüklenemedi');
      } finally {
        if (generation === fetchGenRef.current) {
          setRemoteLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [needsRemote, categoryTab, config.id]);

  const visibleItems = useMemo(() => {
    if (categoryTab === 'all') return localFiltered;
    if (localFiltered.length > 0) return localFiltered;
    if (remoteTab === categoryTab && remoteItems) return remoteItems;
    return [];
  }, [categoryTab, localFiltered, remoteItems, remoteTab]);

  const viewAllHref =
    showCategoryTabs && categoryTab !== 'all'
      ? activeTabConfig.viewAllHref
      : config.viewAllHref;

  const showLoading =
    state.isLoading
    || (needsRemote && remoteLoading && !(remoteTab === categoryTab && remoteItems));

  function selectTab(id: HomeCategoryTabId) {
    if (!onCategoryTabChange || id === categoryTab) return;
    onCategoryTabChange(id);
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

        {showCategoryTabs ? (
          <div
            className="flex flex-wrap gap-1.5"
            role="tablist"
            aria-label="Ana sayfa kategori filtreleri"
          >
            {HOME_CATEGORY_TABS.map((tab) => {
              const selected = tab.id === categoryTab;
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
      ) : state.error || remoteError ? (
        <p className="rounded-2xl border border-dashed border-[#E6E8EE] bg-white px-5 py-8 text-sm text-[#64748B]">
          {remoteError ?? state.error}
        </p>
      ) : visibleItems.length === 0 ? (
        <p className="flex min-h-[14rem] items-center rounded-2xl border border-dashed border-[#E6E8EE] bg-white px-5 py-8 text-sm text-[#64748B]">
          {categoryTab !== 'all'
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
