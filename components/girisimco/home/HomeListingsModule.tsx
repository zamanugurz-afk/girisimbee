'use client';

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import {
  HOME_LISTING_SECTIONS,
  useHomeListingSections,
} from '@/features/home';
import { HomeListingSectionRow } from '@/components/girisimco/home/HomeListingSectionRow';
import type { HomeListingSectionsResult } from '@/features/home';

const HomeListingsCtx = createContext<HomeListingSectionsResult | null>(null);

function useHomeListingsCtx() {
  const ctx = useContext(HomeListingsCtx);
  if (!ctx) {
    throw new Error('HomeListingsProvider required');
  }
  return ctx;
}

export function HomeListingsProvider({ children }: { children: ReactNode }) {
  const value = useHomeListingSections();
  return <HomeListingsCtx.Provider value={value}>{children}</HomeListingsCtx.Provider>;
}

export function HomeFeaturedSection() {
  const { sections } = useHomeListingsCtx();
  const featured = HOME_LISTING_SECTIONS.find((s) => s.id === 'featured');
  if (!featured) return null;
  const state = sections.find((section) => section.id === featured.id);
  if (!state) return null;

  return (
    <div className="bg-transparent dark:bg-transparent">
      {/* Market sonrası ve Öne Çıkan İlanlar öncesi net ayrım çizgisi */}
      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-8 pt-4 pb-2">
        <div className="h-[1px] w-full bg-slate-200 dark:bg-zinc-800" />
      </div>
      <div className="mx-auto w-full max-w-[1280px] px-5 py-6 lg:px-8 lg:py-8">
        <HomeListingSectionRow config={featured} state={state} />
      </div>
    </div>
  );
}

export function HomeRestSections() {
  const { sections } = useHomeListingsCtx();
  const rest = HOME_LISTING_SECTIONS.filter((s) => s.id !== 'featured');

  return (
    <div className="bg-transparent dark:bg-transparent">
      {rest.map((config) => {
        const state = sections.find((section) => section.id === config.id);
        if (!state) return null;
        return (
          <div key={config.id}>
            {/* İlan bölümleri arasındaki net ayrım çizgisi */}
            <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-8 pt-4 pb-2">
              <div className="h-[1px] w-full bg-slate-200 dark:bg-zinc-800" />
            </div>
            <div className="mx-auto w-full max-w-[1280px] px-5 py-6 lg:px-8 lg:py-8">
              <HomeListingSectionRow config={config} state={state} />
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
