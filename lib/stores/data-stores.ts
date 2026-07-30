'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CategoryDTO,
  ProductDTO,
  ProviderDTO,
  ListingResponse,
  SellerResponse,
  MarketStatisticsResponse,
  AlarmDTO,
  AIAnalysisResponse,
  DashboardData,
  ListingFilter,
  SortOption,
  ListingAgeFilter,
  ConditionGrade,
  SearchResponse,
} from '@/types';

// ============================================================================
// PRODUCTS STORE
// ============================================================================
interface ProductsState {
  products: ProductDTO[];
  categories: CategoryDTO[];
  selectedCategoryId: string | null;
  loading: boolean;
  error: string | null;
  setProducts: (p: ProductDTO[]) => void;
  setCategories: (c: CategoryDTO[]) => void;
  setSelectedCategory: (id: string | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useProductsStore = create<ProductsState>()((set) => ({
  products: [],
  categories: [],
  selectedCategoryId: null,
  loading: false,
  error: null,
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (selectedCategoryId) => set({ selectedCategoryId }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// ============================================================================
// PROVIDERS STORE
// ============================================================================
interface ProvidersState {
  providers: ProviderDTO[];
  loading: boolean;
  setProviders: (p: ProviderDTO[]) => void;
  setLoading: (v: boolean) => void;
}

export const useProvidersStore = create<ProvidersState>()((set) => ({
  providers: [],
  loading: false,
  setProviders: (providers) => set({ providers }),
  setLoading: (loading) => set({ loading }),
}));

// ============================================================================
// SELLERS STORE
// ============================================================================
interface SellersState {
  sellers: SellerResponse[];
  loading: boolean;
  setSellers: (s: SellerResponse[]) => void;
  setLoading: (v: boolean) => void;
}

export const useSellersStore = create<SellersState>()((set) => ({
  sellers: [],
  loading: false,
  setSellers: (sellers) => set({ sellers }),
  setLoading: (loading) => set({ loading }),
}));

// ============================================================================
// LISTINGS STORE
// ============================================================================
interface ListingsDataState {
  listings: ListingResponse[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  setListings: (l: ListingResponse[]) => void;
  setTotalCount: (n: number) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useListingsDataStore = create<ListingsDataState>()((set) => ({
  listings: [],
  totalCount: 0,
  loading: false,
  error: null,
  setListings: (listings) => set({ listings }),
  setTotalCount: (totalCount) => set({ totalCount }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// ============================================================================
// FILTERS STORE (extended)
// ============================================================================
interface FiltersDataState {
  search: string;
  providerId: string | null;
  productId: string | null;
  categoryId: string | null;
  city: string;
  district: string | null;
  condition: ConditionGrade | 'all';
  listingAge: ListingAgeFilter;
  minPrice: number | null;
  maxPrice: number | null;
  sort: SortOption;
  favoritesOnly: boolean;
  setSearch: (v: string) => void;
  setProviderId: (v: string | null) => void;
  setProductId: (v: string | null) => void;
  setCategoryId: (v: string | null) => void;
  setCity: (v: string) => void;
  setDistrict: (v: string | null) => void;
  setCondition: (v: ConditionGrade | 'all') => void;
  setListingAge: (v: ListingAgeFilter) => void;
  setMinPrice: (v: number | null) => void;
  setMaxPrice: (v: number | null) => void;
  setSort: (v: SortOption) => void;
  setFavoritesOnly: (v: boolean) => void;
  toFilter: () => ListingFilter;
  reset: () => void;
}

export const useFiltersStore = create<FiltersDataState>()(
  persist(
    (set, get) => ({
      search: '',
      providerId: null,
      productId: null,
      categoryId: null,
      city: 'Istanbul',
      district: null,
      condition: 'all',
      listingAge: 'all',
      minPrice: null,
      maxPrice: null,
      sort: 'newest',
      favoritesOnly: false,
      setSearch: (search) => set({ search }),
      setProviderId: (providerId) => set({ providerId }),
      setProductId: (productId) => set({ productId }),
      setCategoryId: (categoryId) => set({ categoryId }),
      setCity: (city) => set({ city }),
      setDistrict: (district) => set({ district }),
      setCondition: (condition) => set({ condition }),
      setListingAge: (listingAge) => set({ listingAge }),
      setMinPrice: (minPrice) => set({ minPrice }),
      setMaxPrice: (maxPrice) => set({ maxPrice }),
      setSort: (sort) => set({ sort }),
      setFavoritesOnly: (favoritesOnly) => set({ favoritesOnly }),
      toFilter: () => {
        const s = get();
        return {
          search: s.search,
          provider_id: s.providerId,
          product_id: s.productId,
          category_id: s.categoryId,
          city: s.city,
          district: s.district ?? undefined,
          condition: s.condition,
          listing_age: s.listingAge,
          min_price: s.minPrice,
          max_price: s.maxPrice,
          sort: s.sort,
          favorites_only: s.favoritesOnly,
          exclude_deleted: true,
        };
      },
      reset: () =>
        set({
          search: '',
          providerId: null,
          productId: null,
          categoryId: null,
          district: null,
          condition: 'all',
          listingAge: 'all',
          minPrice: null,
          maxPrice: null,
          sort: 'newest',
          favoritesOnly: false,
        }),
    }),
    {
      name: 'ib-filters-v2',
      partialize: (s) => ({ sort: s.sort, listingAge: s.listingAge, condition: s.condition }),
    },
  ),
);

// ============================================================================
// ALARMS STORE
// ============================================================================
interface AlarmsState {
  alarms: AlarmDTO[];
  loading: boolean;
  setAlarms: (a: AlarmDTO[]) => void;
  setLoading: (v: boolean) => void;
}

export const useAlarmsStore = create<AlarmsState>()((set) => ({
  alarms: [],
  loading: false,
  setAlarms: (alarms) => set({ alarms }),
  setLoading: (loading) => set({ loading }),
}));

// ============================================================================
// STATISTICS STORE
// ============================================================================
interface StatisticsState {
  stats: MarketStatisticsResponse[];
  loading: boolean;
  setStats: (s: MarketStatisticsResponse[]) => void;
  setLoading: (v: boolean) => void;
  getByProduct: (productId: string) => MarketStatisticsResponse | null;
}

export const useStatisticsStore = create<StatisticsState>()((set, get) => ({
  stats: [],
  loading: false,
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  getByProduct: (productId) => get().stats.find((s) => s.product_id === productId) ?? null,
}));

// ============================================================================
// AI STORE
// ============================================================================
interface AIState {
  analyses: AIAnalysisResponse[];
  loading: boolean;
  setAnalyses: (a: AIAnalysisResponse[]) => void;
  setLoading: (v: boolean) => void;
  getByListing: (listingId: string) => AIAnalysisResponse | null;
}

export const useAIStore = create<AIState>()((set, get) => ({
  analyses: [],
  loading: false,
  setAnalyses: (analyses) => set({ analyses }),
  setLoading: (loading) => set({ loading }),
  getByListing: (listingId) =>
    get().analyses.find((a) => a.listing_id === listingId) ?? null,
}));

// ============================================================================
// DASHBOARD STORE
// ============================================================================
interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  setData: (d: DashboardData) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  data: null,
  loading: false,
  error: null,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// ============================================================================
// SETTINGS / THEME STORE
// ============================================================================
interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  notifications: {
    newDeals: boolean;
    priceDrops: boolean;
    riskyListings: boolean;
    syncEvents: boolean;
    dailyDigest: boolean;
  };
  syncInterval: number;
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  setReducedMotion: (v: boolean) => void;
  setNotification: (key: keyof SettingsState['notifications'], v: boolean) => void;
  setSyncInterval: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      reducedMotion: false,
      notifications: {
        newDeals: true,
        priceDrops: true,
        riskyListings: true,
        syncEvents: false,
        dailyDigest: false,
      },
      syncInterval: 15,
      setTheme: (theme) => set({ theme }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setNotification: (key, value) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: value } })),
      setSyncInterval: (syncInterval) => set({ syncInterval }),
    }),
    { name: 'ib-settings' },
  ),
);

// ============================================================================
// SEARCH STORE
// ============================================================================
interface SearchState {
  query: string;
  results: SearchResponse | null;
  loading: boolean;
  setQuery: (q: string) => void;
  setResults: (r: SearchResponse | null) => void;
  setLoading: (v: boolean) => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
  query: '',
  results: null,
  loading: false,
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading }),
}));
