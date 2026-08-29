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
  return null;
}

export function HomeRestSections() {
  const { sections } = useHomeListingsCtx();

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {HOME_LISTING_SECTIONS.map((config) => {
        const state = sections.find((section) => section.id === config.id);
        if (!state) return null;
        return (
          <div key={config.id} className="mx-auto w-full max-w-[1280px] px-5 lg:px-8">
            <HomeListingSectionRow config={config} state={state} />
          </div>
        );
      })}
    </div>
  );
}

/** @deprecated Prefer HomeRestSections */
export function HomeListingsModule() {
  return <HomeRestSections />;
}
