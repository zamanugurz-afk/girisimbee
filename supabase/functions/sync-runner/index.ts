import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { searchDolapKeywords, searchDolap } from "../../../services/providers/dolap-scraper.ts";
import { searchSahibindenKeywords } from "../../../services/providers/sahibinden-scraper.ts";
import { searchLetgoKeywords } from "../../../services/providers/letgo-scraper.ts";
import { listingNormalizer } from "../../../services/providers/listing-normalizer.ts";
import { upsertListingSeller } from "../../../services/providers/seller-upsert.ts";
import {
  classifyListingTitle,
  getProductSlugForCategory,
  SYNC_SEARCH_KEYWORDS,
} from "../../../lib/product-classifier.ts";
import { validatePrimaryProduct } from "../../../lib/engines/product-validation-engine.ts";
import { validateRawListingForIngest } from "../../../lib/listing-url-validator.ts";
import { captureGroupedProductPriceSnapshotsWithClient } from "../../../lib/engines/grouped-price-history-engine.ts";
import { filterMarketplaceListings } from "../../../lib/listing-window.ts";
import { checkAlertsAfterSyncWithClient } from "../../../lib/engines/price-alert-engine.ts";
import { productIntelligenceColumns } from "../../../lib/product-normalizer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ============================================================================
// TYPES — mirror the frontend interfaces
// ============================================================================
interface RawListing {
  externalId: string;
  title: string;
  price: number;
  currency?: string;
  url: string;
  imageUrls?: string[];
  description?: string;
  district?: string;
  city?: string;
  listingDate?: string;
  condition?: string;
  sellerName?: string;
  sellerRating?: number;
  sellerMemberSince?: number;
  sellerVerified?: boolean;
  productName: string;
}

interface ProviderAdapter {
  slug: string;
  search(keywords: string[], limit: number): Promise<{ listings: RawListing[]; durationMs: number }>;
  getListing(externalId: string): Promise<RawListing | null>;
  normalize(raw: RawListing): NormalizedListing;
}

interface NormalizedListing {
  external_listing_id: string;
  title: string;
  price: number;
  currency: string;
  url: string;
  source_url: string;
  image_urls: string[];
  description: string | null;
  district: string;
  city: string;
  listing_date: string | null;
  condition: string;
  seller_display_name: string | null;
  seller_rating: number | null;
  seller_member_since: number | null;
  seller_verified: boolean;
}

interface SyncResult {
  slug: string;
  found: number;
  imported: number;
  updated: number;
  failed: number;
  durationMs: number;
  avgResponseMs: number;
  errors: string[];
}

// ============================================================================
// SHARED DATA
// ============================================================================
const TRACKED_PRODUCTS = SYNC_SEARCH_KEYWORDS;

function normalizeListing(raw: RawListing): NormalizedListing {
  return listingNormalizer.normalize(raw);
}

// ============================================================================
// PROVIDER ADAPTERS — each is fully isolated
// ============================================================================

function createScraperAdapter(
  slug: string,
  searchKeywords: (keywords: string[], limit: number) => Promise<Array<{
    externalId: string;
    title: string;
    price: number;
    url: string;
    imageUrls: string[];
    description?: string;
    district?: string;
    condition?: string;
    sellerName?: string;
  }>>,
  searchSingle?: (keyword: string, limit: number) => Promise<Array<{
    externalId: string;
    title: string;
    price: number;
    url: string;
    imageUrls: string[];
    description?: string;
    district?: string;
    condition?: string;
    sellerName?: string;
  }>>,
): ProviderAdapter {
  return {
    slug,
    async search(keywords: string[], limit: number) {
      const start = Date.now();
      try {
        const scraped = await searchKeywords(keywords, limit);
        const listings: RawListing[] = scraped.map((item) => ({
          externalId: item.externalId,
          title: item.title,
          price: item.price,
          currency: "TRY",
          url: item.url,
          imageUrls: item.imageUrls,
          description: item.description,
          district: item.district,
          city: "Istanbul",
          condition: item.condition,
          sellerName: item.sellerName,
          sellerVerified: false,
          productName: item.title,
        }));
        return { listings, durationMs: Date.now() - start };
      } catch {
        return { listings: [], durationMs: Date.now() - start };
      }
    },
    async getListing(externalId: string) {
      const productId = externalId.replace(new RegExp(`^${slug}-`), "");
      const searchFn = searchSingle ?? ((keyword: string, lim: number) => searchKeywords([keyword], lim));
      try {
        const results = await searchFn(productId, 10);
        const match = results.find((r) => r.externalId === productId);
        if (!match) return null;
        return {
          externalId: match.externalId,
          title: match.title,
          price: match.price,
          currency: "TRY",
          url: match.url,
          imageUrls: match.imageUrls,
          description: match.description,
          district: match.district,
          city: "Istanbul",
          condition: match.condition,
          sellerName: match.sellerName,
          sellerVerified: false,
          productName: match.title,
        };
      } catch {
        return null;
      }
    },
    normalize: normalizeListing,
  };
}

// --- Sahibinden adapter ---
const sahibindenAdapter = createScraperAdapter("sahibinden", searchSahibindenKeywords);

// --- Letgo adapter ---
const letgoAdapter = createScraperAdapter("letgo", searchLetgoKeywords);

// --- Dolap adapter ---
const dolapAdapter: ProviderAdapter = {
  slug: "dolap",
  async search(keywords: string[], limit: number) {
    const start = Date.now();
    try {
      const scraped = await searchDolapKeywords(keywords, limit);
      const listings: RawListing[] = scraped.map((item) => ({
        externalId: item.externalId,
        title: item.title,
        price: item.price,
        currency: "TRY",
        url: item.url,
        imageUrls: item.imageUrls,
        description: item.description,
        district: item.district,
        city: "Istanbul",
        condition: item.condition,
        sellerName: item.sellerName,
        sellerVerified: false,
        productName: item.title,
      }));
      return { listings, durationMs: Date.now() - start };
    } catch {
      return { listings: [], durationMs: Date.now() - start };
    }
  },
  async getListing(externalId: string) {
    const productId = externalId.replace(/^dolap-/, "");
    try {
      const results = await searchDolap(productId, 10);
      const match =
        results.find((r) => r.externalId === productId) ??
        results.find((r) => r.url.endsWith(`-${productId}`));
      if (!match) return null;
      return {
        externalId: match.externalId,
        title: match.title,
        price: match.price,
        currency: "TRY",
        url: match.url,
        imageUrls: match.imageUrls,
        description: match.description,
        city: "Istanbul",
        condition: match.condition,
        sellerName: match.sellerName,
        sellerVerified: false,
        productName: match.title,
      };
    } catch {
      return null;
    }
  },
  normalize: normalizeListing,
};

const PROVIDER_ADAPTERS: Record<string, ProviderAdapter> = {
  sahibinden: sahibindenAdapter,
  letgo: letgoAdapter,
  dolap: dolapAdapter,
};

// ============================================================================
// SYNC ENGINE
// ============================================================================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const body = await req.json().catch(() => ({}));
    const keywords: string[] = body.keywords ?? TRACKED_PRODUCTS;
    const intervalMinutes: number = body.intervalMinutes ?? 10;

    // 1. Create sync_run
    const { data: runData } = await supabase
      .from("sync_runs")
      .insert({ status: "running", interval_minutes: intervalMinutes, started_at: new Date().toISOString() })
      .select().single();
    const runId = runData.id;

    // 2. Get enabled providers + active products
    const { data: providers } = await supabase
      .from("providers").select("*").eq("is_enabled", true);
    const { data: products } = await supabase
      .from("products").select("*").eq("is_active", true);

    if (!providers || providers.length === 0) {
      await supabase.from("sync_runs").update({
        status: "error", finished_at: new Date().toISOString(), error_summary: "No providers",
      }).eq("id", runId);
      return jsonResponse({ error: "No providers" }, 400);
    }

    // Build product slug → id lookup
    const productLookup = new Map<string, string>();
    for (const p of products ?? []) {
      if (p.is_active) {
        productLookup.set(p.slug, p.id);
      }
    }

    const results: SyncResult[] = [];

    // 3. Run each provider adapter independently
    for (const provider of providers) {
      const adapter = PROVIDER_ADAPTERS[provider.slug];
      const logStart = Date.now();

      // Create sync_log
      const { data: logData } = await supabase
        .from("sync_logs")
        .insert({ sync_run_id: runId, provider_id: provider.id, status: "running", started_at: new Date().toISOString() })
        .select().single();
      const logId = logData?.id;

      if (!adapter) {
        await supabase.from("sync_logs").update({
          status: "skipped", finished_at: new Date().toISOString(),
          error_message: `No adapter for ${provider.slug}`,
        }).eq("id", logId);
        results.push({ slug: provider.slug, found: 0, imported: 0, updated: 0, failed: 0, durationMs: 0, avgResponseMs: 0, errors: [`No adapter`] });
        continue;
      }

      try {
        const result = await runProviderSync(supabase, adapter, provider.id, productLookup, keywords);
        results.push(result);

        // Update sync_log
        await supabase.from("sync_logs").update({
          status: result.failed > 0 && result.imported === 0 ? "error" : "success",
          finished_at: new Date().toISOString(),
          duration_ms: result.durationMs,
          found_count: result.found,
          imported_count: result.imported,
          updated_count: result.updated,
          failed_count: result.failed,
          avg_response_ms: result.avgResponseMs,
          error_message: result.errors.length > 0 ? result.errors.join("; ") : null,
        }).eq("id", logId);

        // Update provider_status
        await updateProviderStatus(supabase, provider.id, "success", result.imported, result.updated, result.failed, result.avgResponseMs, result.durationMs);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        results.push({ slug: provider.slug, found: 0, imported: 0, updated: 0, failed: 1, durationMs: Date.now() - logStart, avgResponseMs: 0, errors: [errMsg] });
        await supabase.from("sync_logs").update({
          status: "error", finished_at: new Date().toISOString(), error_message: errMsg,
        }).eq("id", logId);
        await updateProviderStatus(supabase, provider.id, "error", 0, 0, 1, 0, Date.now() - logStart, errMsg);
      }
    }

    // 4. Finalize sync run
    const totalFound = results.reduce((a, r) => a + r.found, 0);
    const totalImported = results.reduce((a, r) => a + r.imported, 0);
    const totalUpdated = results.reduce((a, r) => a + r.updated, 0);
    const totalFailed = results.reduce((a, r) => a + r.failed, 0);
    const errorCount = results.filter((r) => r.errors.length > 0).length;
    const status = errorCount === 0 ? "success" : errorCount < results.length ? "partial" : "error";

    await supabase.from("sync_runs").update({
      status, finished_at: new Date().toISOString(),
      total_found: totalFound, total_imported: totalImported,
      total_updated: totalUpdated, total_failed: totalFailed,
      error_summary: results.filter((r) => r.errors.length > 0).map((r) => `${r.slug}: ${r.errors.join(", ")}`).join("; ") || null,
    }).eq("id", runId);

    try {
      const { data: snapshotRows, error: snapshotFetchError } = await supabase
        .from("listings")
        .select(
          "id, price, is_active, deleted_at, is_bundle, product_family, edition, storage, brand, platform, generation, model, color, bundle_type, title, item_condition, first_seen_at, created_at",
        )
        .eq("is_active", true)
        .is("deleted_at", null);

      if (snapshotFetchError) throw new Error(snapshotFetchError.message);

      await captureGroupedProductPriceSnapshotsWithClient(
        supabase,
        filterMarketplaceListings(snapshotRows ?? []),
      );
    } catch (snapshotError) {
      const snapshotMessage = snapshotError instanceof Error ? snapshotError.message : String(snapshotError);
      await supabase.from("sync_runs").update({
        error_summary: results.filter((r) => r.errors.length > 0).map((r) => `${r.slug}: ${r.errors.join(", ")}`).join("; ")
          ? `${results.filter((r) => r.errors.length > 0).map((r) => `${r.slug}: ${r.errors.join(", ")}`).join("; ")}; price snapshot: ${snapshotMessage}`
          : `price snapshot: ${snapshotMessage}`,
      }).eq("id", runId);
    }

    try {
      await checkAlertsAfterSyncWithClient(supabase);
    } catch (alertError) {
      const alertMessage = alertError instanceof Error ? alertError.message : String(alertError);
      await supabase.from("sync_runs").update({
        error_summary: results.filter((r) => r.errors.length > 0).map((r) => `${r.slug}: ${r.errors.join(", ")}`).join("; ")
          ? `${results.filter((r) => r.errors.length > 0).map((r) => `${r.slug}: ${r.errors.join(", ")}`).join("; ")}; price alerts: ${alertMessage}`
          : `price alerts: ${alertMessage}`,
      }).eq("id", runId);
    }

    return jsonResponse({ runId, status, totalFound, totalImported, totalUpdated, totalFailed, results });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});

// ============================================================================
// SYNC ENGINE — per-provider sync logic
// ============================================================================

async function runProviderSync(
  supabase: ReturnType<typeof createClient>,
  adapter: ProviderAdapter,
  providerId: string,
  productLookup: Map<string, string>,
  keywords: string[],
): Promise<SyncResult> {
  const start = Date.now();
  let imported = 0, updated = 0, failed = 0;
  const errors: string[] = [];

  // 1. Search
  const searchResult = await adapter.search(keywords, 25);
  const found = searchResult.listings.length;
  const avgResponseMs = searchResult.durationMs;

  if (found === 0) {
    return { slug: adapter.slug, found: 0, imported: 0, updated: 0, failed: 0, durationMs: Date.now() - start, avgResponseMs, errors };
  }

  // 2. Normalize and validate scraped listings
  const acceptedExternalIds: string[] = [];

  for (const raw of searchResult.listings) {
    try {
      const ingestValidation = validateRawListingForIngest(raw, adapter.slug);
      if (!ingestValidation.accepted) {
        continue;
      }

      const item = adapter.normalize(raw);
      const validation = validatePrimaryProduct({
        title: item.title,
        description: item.description,
      });
      if (!validation.accepted) {
        continue;
      }

      const productId = matchProduct(item.title, productLookup);
      if (!productId) continue;

      acceptedExternalIds.push(item.external_listing_id);

      const sellerId = await upsertListingSeller(supabase, providerId, item);

      // Check if listing exists
      const { data: existing } = await supabase
        .from("listings").select("id, price")
        .eq("provider_id", providerId)
        .eq("external_listing_id", item.external_listing_id)
        .maybeSingle();

      if (existing) {
        const priceChanged = Number(existing.price) !== item.price;
        const updateData: Record<string, unknown> = {
          title: item.title,
          description: item.description,
          url: item.url,
          source_url: item.source_url,
          source_url_status: "valid",
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
        if (priceChanged) {
          updateData.previous_price = Number(existing.price);
          updateData.price = item.price;
        }
        await supabase.from("listings").update(updateData).eq("id", existing.id);

        if (priceChanged) {
          await supabase.from("price_history").insert({
            listing_id: existing.id, price: item.price, detected_at: new Date().toISOString(),
          });
        }
        updated++;
      } else {
        await supabase.from("listings").insert({
          provider_id: providerId, product_id: productId,
          external_listing_id: item.external_listing_id, title: item.title,
          description: item.description, url: item.url, source_url: item.source_url,
          source_url_status: "valid", source_url_issue: null,
          image_urls: item.image_urls, price: item.price, currency: item.currency,
          district: item.district, city: item.city, listing_date: item.listing_date,
          condition: item.condition, seller_id: sellerId, is_active: true,
          last_seen_at: new Date().toISOString(),
          ...productIntelligenceColumns(item.title),
        });
        imported++;
      }
    } catch (err) {
      failed++;
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  // 4. Mark removed listings as inactive
  if (acceptedExternalIds.length > 0) {
    const foundSet = new Set(acceptedExternalIds);
    const { data: activeRows } = await supabase
      .from("listings")
      .select("id, external_listing_id")
      .eq("provider_id", providerId)
      .eq("is_active", true);

    const stale = (activeRows ?? []).filter((row) => !foundSet.has(row.external_listing_id));

    if (stale.length > 0) {
      await supabase.from("listings").update({
        is_active: false, deleted_at: new Date().toISOString(),
      }).in("id", stale.map((l: { id: string }) => l.id));
    }
  }

  return { slug: adapter.slug, found, imported, updated, failed, durationMs: Date.now() - start, avgResponseMs, errors };
}

function matchProduct(title: string, productLookup: Map<string, string>): string | null {
  const category = classifyListingTitle(title);
  if (!category) return null;
  const slug = getProductSlugForCategory(category);
  return productLookup.get(slug) ?? null;
}

async function updateProviderStatus(
  supabase: ReturnType<typeof createClient>,
  providerId: string,
  status: string,
  imported: number,
  updated: number,
  failed: number,
  avgResponseMs: number,
  durationMs: number,
  errorMsg?: string,
): Promise<void> {
  const { data: existing } = await supabase
    .from("provider_status")
    .select("*").eq("provider_id", providerId).maybeSingle();

  if (existing) {
    await supabase.from("provider_status").update({
      status,
      last_sync_at: new Date().toISOString(),
      last_sync_duration_ms: durationMs,
      total_listings_imported: (existing.total_listings_imported ?? 0) + imported,
      total_errors: errorMsg ? (existing.total_errors ?? 0) + 1 : existing.total_errors,
      avg_response_ms: avgResponseMs > 0 ? avgResponseMs : existing.avg_response_ms,
    }).eq("provider_id", providerId);
  } else {
    await supabase.from("provider_status").insert({
      provider_id: providerId, status,
      last_sync_at: new Date().toISOString(),
      last_sync_duration_ms: durationMs,
      total_listings_imported: imported,
      total_errors: errorMsg ? 1 : 0,
      avg_response_ms: avgResponseMs > 0 ? avgResponseMs : null,
    });
  }
}

function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
