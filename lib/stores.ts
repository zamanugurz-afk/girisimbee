'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Listing } from '@/types';

interface FiltersState {
  query: string;
  provider: string | null;
  category: string | null;
  dealScore: string | null;
  maxPrice: number | null;
  sortBy: 'deal' | 'price-asc' | 'price-desc' | 'newest';
  setQuery: (q: string) => void;
  setProvider: (p: string | null) => void;
  setCategory: (c: string | null) => void;
  setDealScore: (d: string | null) => void;
  setMaxPrice: (p: number | null) => void;
  setSortBy: (s: FiltersState['sortBy']) => void;
  reset: () => void;
}

export const useFilters = create<FiltersState>()(
  persist(
    (set) => ({
      query: '',
      provider: null,
      category: null,
      dealScore: null,
      maxPrice: null,
      sortBy: 'deal',
      setQuery: (query) => set({ query }),
      setProvider: (provider) => set({ provider }),
      setCategory: (category) => set({ category }),
      setDealScore: (dealScore) => set({ dealScore }),
      setMaxPrice: (maxPrice) => set({ maxPrice }),
      setSortBy: (sortBy) => set({ sortBy }),
      reset: () =>
        set({
          query: '',
          provider: null,
          category: null,
          dealScore: null,
          maxPrice: null,
          sortBy: 'deal',
        }),
    }),
    { name: 'ib-filters', partialize: (s) => ({ sortBy: s.sortBy }) },
  ),
);

interface UIState {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (v: boolean) => void;
  setCommandOpen: (v: boolean) => void;
  setMobileNavOpen: (v: boolean) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandOpen: false,
      mobileNavOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebar: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
    }),
    { name: 'ib-ui', partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }) },
  ),
);

interface ListingsState {
  listings: Listing[];
  setListings: (l: Listing[]) => void;
}

export const useListingsStore = create<ListingsState>()((set) => ({
  listings: [],
  setListings: (listings) => set({ listings }),
}));
