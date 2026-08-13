'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  HOME_LISTING_SECTIONS,
  useHomeListingSections,
} from '@/features/home';
import {
  type HomeCategoryTabId,
} from '@/features/home/config/home-category-tabs';
import { HomeListingSectionRow } from '@/components/girisimco/home/HomeListingSectionRow';
import type { HomeListingSectionsResult } from '@/features/home';
import { cn } from '@/lib/utils';

type HomeListingsCtxValue = HomeListingSectionsResult & {
  categoryTab: HomeCategoryTabId;
  setCategoryTab: (tab: HomeCategoryTabId) => void;
};

const HomeListingsCtx = createContext<HomeListingsCtxValue | null>(null);

export function useHomeListingsCtx() {
  const ctx = useContext(HomeListingsCtx);
  if (!ctx) {
    throw new Error('HomeListingsProvider required');
  }
  return ctx;
}

export function HomeListingsProvider({ children }: { children: ReactNode }) {
  const sectionsState = useHomeListingSections();
  const [categoryTab, setCategoryTabState] = useState<HomeCategoryTabId>('all');

  const setCategoryTab = useCallback((tab: HomeCategoryTabId) => {
    setCategoryTabState(tab);
  }, []);

  const value = useMemo(
    () => ({
      ...sectionsState,
      categoryTab,
      setCategoryTab,
    }),
    [sectionsState, categoryTab, setCategoryTab],
  );

  return <HomeListingsCtx.Provider value={value}>{children}</HomeListingsCtx.Provider>;
}

export function HomeFeaturedSection() {
  const { sections, categoryTab, setCategoryTab } = useHomeListingsCtx();
  const featured = HOME_LISTING_SECTIONS.find((s) => s.id === 'featured');
  if (!featured) return null;
  const state = sections.find((section) => section.id === featured.id);
  if (!state) return null;

  return (
    <div className="border-b border-[#E8EAF0] bg-white dark:border-border dark:bg-background">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-10 lg:px-8 lg:py-12">
        <HomeListingSectionRow
          config={featured}
          state={state}
          categoryTab={categoryTab}
          onCategoryTabChange={setCategoryTab}
          showCategoryTabs
        />
      </div>
    </div>
  );
}

export function HomeRestSections() {
  const { sections, categoryTab } = useHomeListingsCtx();
  const rest = HOME_LISTING_SECTIONS.filter((s) => s.id !== 'featured');

  return (
    <div className="bg-[#FAFBFC] dark:bg-background">
      {rest.map((config, index) => {
        const state = sections.find((section) => section.id === config.id);
        if (!state) return null;
        return (
          <div
            key={config.id}
            className={cn(
              'border-b border-[#E8EAF0] dark:border-border',
              index % 2 === 1 && 'bg-white dark:bg-background',
            )}
          >
            <div className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8 lg:py-12">
              <HomeListingSectionRow
                config={config}
                state={state}
                categoryTab={categoryTab}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** @deprecated Prefer HomeFeaturedSection + HomeRestSections */
export function HomeListingsModule() {
  return (
    <>
      <HomeFeaturedSection />
      <HomeRestSections />
    </>
  );
}
