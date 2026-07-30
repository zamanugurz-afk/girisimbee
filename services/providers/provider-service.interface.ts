import type {
  RawListing,
  NormalizedListing,
  ProviderSearchResult,
  ProviderHealthCheck,
  ListingDTO,
} from '@/types';

/**
 * Common interface every provider must implement.
 * Each provider is completely independent — adding a new source
 * means creating a new class that implements this interface.
 */
export interface ProviderServiceInterface {
  readonly providerSlug: string;

  /** Search for listings matching the given query/keywords. */
  search(keywords: string[], options?: ProviderSearchOptions): Promise<ProviderSearchResult>;

  /** Fetch a single listing by its external ID on the provider. */
  getListing(externalId: string): Promise<RawListing | null>;

  /** Convert a raw provider response into the common normalized model. */
  normalize(raw: RawListing): NormalizedListing;

  /** Check if the provider is reachable and responding. */
  healthCheck(): Promise<ProviderHealthCheck>;
}

export interface ProviderSearchOptions {
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  district?: string;
  limit?: number;
}

/**
 * Registry that maps provider slugs to their service instances.
 * The SyncService and DataCollector use this to find collectors.
 */
export type ProviderRegistry = Map<string, ProviderServiceInterface>;

/**
 * Result of a single provider collection pass.
 * Used by the DataCollector to report outcomes.
 */
export interface CollectionResult {
  providerSlug: string;
  found: number;
  imported: number;
  updated: number;
  failed: number;
  durationMs: number;
  avgResponseMs: number;
  errors: string[];
  skipped: boolean;
}
