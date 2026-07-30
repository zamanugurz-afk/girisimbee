'use client';

import { create } from 'zustand';

export interface HomeFiltersState {
  platform: string | null;
  brand: string | null;
  product: string | null;
  model: string | null;
  city: string | null;
  district: string | null;
  source: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  condition: string | null;
  setPlatform: (value: string | null) => void;
  setBrand: (value: string | null) => void;
  setProduct: (value: string | null) => void;
  setModel: (value: string | null) => void;
  setCity: (value: string | null) => void;
  setDistrict: (value: string | null) => void;
  setSource: (value: string | null) => void;
  setMinPrice: (value: number | null) => void;
  setMaxPrice: (value: number | null) => void;
  setCondition: (value: string | null) => void;
  reset: () => void;
}

const initialState = {
  platform: null,
  brand: null,
  product: null,
  model: null,
  city: null,
  district: null,
  source: null,
  minPrice: null,
  maxPrice: null,
  condition: null,
};

export const useHomeFilters = create<HomeFiltersState>()((set) => ({
  ...initialState,
  setPlatform: (platform) => set({ platform }),
  setBrand: (brand) => set({ brand }),
  setProduct: (product) => set({ product }),
  setModel: (model) => set({ model }),
  setCity: (city) => set({ city }),
  setDistrict: (district) => set({ district }),
  setSource: (source) => set({ source }),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setCondition: (condition) => set({ condition }),
  reset: () => set(initialState),
}));
