import crypto from 'crypto';
import {
  CV_EXTRACTION_VERSION,
  CAREER_TAXONOMY_VERSION,
  CV_PARSER_VERSION,
  type CvProfileDraftResult,
} from '@/features/candidates/cv/cv.types';

export interface CvCacheEntry {
  hash: string;
  cacheKey: string;
  result: CvProfileDraftResult;
  createdAt: number;
}

export class CvAnalysisCache {
  private cache: Map<string, CvCacheEntry> = new Map();
  private maxEntries = 500;
  private hits = 0;
  private misses = 0;

  /**
   * Computes SHA-256 hash of normalized text
   */
  computeHash(text: string): string {
    const normalized = text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Creates a deterministic cache key with extraction, taxonomy and parser versions
   */
  makeKey(hash: string): string {
    return `${hash}:${CV_EXTRACTION_VERSION}:${CAREER_TAXONOMY_VERSION}:${CV_PARSER_VERSION}`;
  }

  /**
   * Checks if an entry exists for text
   */
  has(text: string): boolean {
    const hash = this.computeHash(text);
    const key = this.makeKey(hash);
    return this.cache.has(key);
  }

  /**
   * Retrieves cached analysis result
   */
  get(text: string): CvProfileDraftResult | null {
    const hash = this.computeHash(text);
    const key = this.makeKey(hash);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    this.hits++;
    // Return deep clone with updated cacheHit flag
    const cloned = JSON.parse(JSON.stringify(entry.result)) as CvProfileDraftResult;
    cloned.metrics.cacheHit = true;
    cloned.metrics.aiCallCount = 0;
    cloned.metrics.aiSkipped = true;
    cloned.metrics.aiCalled = false;
    cloned.metrics.inputTokens = 0;
    cloned.metrics.outputTokens = 0;
    cloned.metrics.estimatedCostUsd = 0;
    return cloned;
  }

  /**
   * Stores analysis result in cache
   */
  set(text: string, result: CvProfileDraftResult): void {
    const hash = this.computeHash(text);
    const key = this.makeKey(hash);

    // Evict oldest if capacity reached
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      hash,
      cacheKey: key,
      result: JSON.parse(JSON.stringify(result)),
      createdAt: Date.now(),
    });
  }

  /**
   * Clears the cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Returns cache metrics and stats
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    maxEntries: number;
  } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      maxEntries: this.maxEntries,
    };
  }
}

export const cvAnalysisCache = new CvAnalysisCache();
