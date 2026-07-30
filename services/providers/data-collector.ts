import 'server-only';

import { supabase } from '@/lib/supabase';
import type {
  NormalizedListing,
  ListingDTO,
  ProductDTO,
} from '@/types';
import type {
  ProviderServiceInterface,
  CollectionResult,
} from './provider-service.interface';
import { listingNormalizer } from './listing-normalizer';
import { upsertListingSeller } from './seller-upsert';
import {
  classifyListingTitle,
  classifyListingFromSources,
  getProductSlugForCategory,
  listingClassificationCandidates,
} from '@/lib/product-classifier';
import { SYNC_SEARCH_KEYWORDS } from '@/config/product-catalog';
import { validatePrimaryProduct } from '@/lib/engines/product-validation-engine';
import { validateRawListingForIngest } from '@/lib/listing-url-validator';
import { productIntelligenceColumns } from '@/lib/product-normalizer';

/**
 * DataCollector — collects listings from a single provider, normalizes
 * them, saves new ones to the database, updates existing ones, marks
 * removed listings as inactive, and stores price history.
 *
 * One DataCollector instance per provider per sync run.
 *
 * Key behaviors:
 * - Never duplicates listings (matched by provider_id + external_listing_id)
 * - Saves previous_price when a price changes (before updating current price)
 * - Matches each listing to the correct tracked product by title
 * - Marks listings not seen in this sync as inactive
 */
export class DataCollector {
  constructor(private provider: ProviderServiceInterface) {}

  async collect(
    providerId: string,
    products: ProductDTO[],
    keywords: string[],
    limit?: number,
  ): Promise<CollectionResult> {
    const start = Date.now();
    const errors: string[] = [];
    let found = 0;
    let imported = 0;
    let updated = 0;
    let failed = 0;
    let avgResponseMs = 0;

    try {
      // 1. Search the provider
      const searchKeywords = keywords.length > 0 ? keywords : SYNC_SEARCH_KEYWORDS;
      const searchResult = await this.provider.search(searchKeywords, {
        limit: limit ?? 50,
      });
      found = searchResult.totalFound;
      avgResponseMs = searchResult.durationMs;

      if (searchResult.listings.length === 0) {
        return this.result(found, imported, updated, failed, start, errors, avgResponseMs);
      }

      // 2. Normalize and validate scraped listings before insert
      const acceptedExternalIds: string[] = [];

      for (const raw of searchResult.listings) {
        try {
          const ingestValidation = validateRawListingForIngest(raw, this.provider.providerSlug);
          if (!ingestValidation.accepted) {
            continue;
          }

          const item = listingNormalizer.normalize(raw);
          const validationCandidates = listingClassificationCandidates({
            title: item.title,
            url: item.url,
          });
          const validation = validationCandidates.reduce<ReturnType<typeof validatePrimaryProduct> | null>(
            (accepted, candidate) => {
              if (accepted?.accepted) return accepted;
              const result = validatePrimaryProduct({
                title: candidate,
                description: item.description,
              });
              return result.accepted ? result : accepted;
            },
            null,
          );
          if (!validation?.accepted) {
            continue;
          }

          const productId = this.resolveProductId(item.title, products, item.url);
          if (!productId) {
            continue;
          }

          acceptedExternalIds.push(item.external_listing_id);
          const sellerId = await upsertListingSeller(supabase, providerId, item);
          const existing = await this.findExisting(providerId, item.external_listing_id);

          if (existing) {
            const priceChanged = Number(existing.price) !== item.price;
            await this.updateListing(existing.id, item, sellerId, priceChanged ? Number(existing.price) : null);

            if (priceChanged) {
              await this.recordPriceHistory(existing.id, item.price);
            }
            updated++;
          } else {
            await this.insertListing(providerId, productId, item, sellerId);
            imported++;
          }
        } catch (err) {
          failed++;
          errors.push(err instanceof Error ? err.message : String(err));
        }
      }

      // 5. Mark removed listings as inactive
      await this.markRemovedInactive(providerId, acceptedExternalIds);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
      failed = found - imported - updated;
    }

    return this.result(found, imported, updated, failed, start, errors, avgResponseMs);
  }

  /**
   * Classify listing title and map to an active product row.
   */
  private resolveProductId(title: string, products: ProductDTO[], url?: string): string | null {
    const category =
      classifyListingFromSources({ title, url }) ?? classifyListingTitle(title);
    if (!category) return null;

    const slug = getProductSlugForCategory(category);
    const product = products.find((p) => p.slug === slug && p.is_active);
    return product?.id ?? null;
  }

  private async findExisting(providerId: string, externalId: string): Promise<ListingDTO | null> {
    const { data, error } = await supabase
      .from('listings')
      .select('id, price')
      .eq('provider_id', providerId)
      .eq('external_listing_id', externalId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as ListingDTO | null;
  }

  private async insertListing(
    providerId: string,
    productId: string,
    item: NormalizedListing,
    sellerId: string | null,
  ): Promise<void> {
    const intelligence = productIntelligenceColumns(item.title);
    const payload: Record<string, unknown> = {
      provider_id: providerId,
      product_id: productId,
      external_listing_id: item.external_listing_id,
      title: item.title,
      description: item.description,
      url: item.url,
      source_url: item.source_url,
      source_url_status: 'valid',
      source_url_issue: null,
      image_urls: item.image_urls,
      price: item.price,
      currency: item.currency,
      district: item.district,
      city: item.city,
      listing_date: item.listing_date,
      condition: item.condition,
      seller_id: sellerId,
      last_seen_at: new Date().toISOString(),
      is_active: true,
      ...(intelligence ?? {}),
    };

    const { error } = await this.writeListingRow('insert', payload);
    if (error) throw new Error(error.message);
  }

  private async updateListing(
    id: string,
    item: NormalizedListing,
    sellerId: string | null,
    previousPrice: number | null,
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      title: item.title,
      description: item.description,
      url: item.url,
      source_url: item.source_url,
      source_url_status: 'valid',
      source_url_issue: null,
      image_urls: item.image_urls,
      district: item.district,
      city: item.city,
      condition: item.condition,
      seller_id: sellerId,
      last_seen_at: new Date().toISOString(),
      is_active: true,
      deleted_at: null,
      ...productIntelligenceColumns(item.title),
    };

    if (previousPrice !== null) {
      updateData.previous_price = previousPrice;
      updateData.price = item.price;
    }

    const { error } = await this.writeListingRow('update', updateData, id);
    if (error) throw new Error(error.message);
  }

  /** Insert/update with fallback when optional URL or intelligence columns are not migrated yet. */
  private async writeListingRow(
    mode: 'insert' | 'update',
    payload: Record<string, unknown>,
    id?: string,
  ): Promise<{ error: { message: string } | null }> {
    const optionalColumns = [
      'source_url',
      'source_url_status',
      'source_url_issue',
      'product_family',
      'edition',
      'storage',
      'item_condition',
      'bundle_type',
      'brand',
      'platform',
      'generation',
      'model',
      'color',
      'is_bundle',
    ];

    let current = { ...payload };
    for (let attempt = 0; attempt <= optionalColumns.length; attempt++) {
      const result =
        mode === 'insert'
          ? await supabase.from('listings').insert(current)
          : await supabase.from('listings').update(current).eq('id', id!);

      if (!result.error) return { error: null };

      const missing =
        result.error.message.match(/Could not find the '([^']+)' column/)?.[1] ??
        optionalColumns.find((column) => result.error!.message.includes(column));
      if (!missing) return { error: result.error };

      const { [missing]: _removed, ...rest } = current;
      current = rest;
    }

    return {
      error: { message: 'Failed to persist listing after optional column fallback' },
    };
  }

  private async recordPriceHistory(listingId: string, price: number): Promise<void> {
    const { error } = await supabase.from('price_history').insert({
      listing_id: listingId,
      price,
      detected_at: new Date().toISOString(),
    });

    if (error) throw new Error(error.message);
  }

  private async markRemovedInactive(providerId: string, foundExternalIds: string[]): Promise<void> {
    if (foundExternalIds.length === 0) return;

    const foundSet = new Set(foundExternalIds);
    const { data, error } = await supabase
      .from('listings')
      .select('id, external_listing_id')
      .eq('provider_id', providerId)
      .eq('is_active', true);

    if (error || !data || data.length === 0) return;

    const ids = data
      .filter((row) => !foundSet.has(row.external_listing_id))
      .map((row) => row.id);
    if (ids.length === 0) return;
    const { error: updateError } = await supabase
      .from('listings')
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .in('id', ids);

    if (updateError) throw new Error(updateError.message);
  }

  private result(
    found: number,
    imported: number,
    updated: number,
    failed: number,
    start: number,
    errors: string[],
    avgResponseMs: number,
  ): CollectionResult {
    return {
      providerSlug: this.provider.providerSlug,
      found,
      imported,
      updated,
      failed,
      durationMs: Date.now() - start,
      avgResponseMs,
      errors,
      skipped: false,
    };
  }
}
