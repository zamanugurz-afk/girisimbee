# İkinciBazar — TODO (Prioritized)

**Generated:** 2026-07-27  
**Basis:** Full project analysis — gaps between intended architecture and current implementation.

Items are ordered **within each tier** (top = do first). Cross-tier rule: finish Critical before High, etc.

---

## Critical

> Blockers for production use, data integrity, or basic security. Without these, the app is a demo only.

| # | Item | Why critical | Affected areas |
|---|------|--------------|----------------|
| C1 | **Implement real provider data collection** | All marketplace data is simulated (seeded random). Core product value depends on real listings. | `services/providers/*`, `supabase/functions/sync-runner` |
| C2 | **Validate owner token via Next.js middleware** | Any URL prefix grants access; `OWNER_TOKEN` is not enforced. Private app is publicly reachable. | New `middleware.ts`, `app/[token]/*` |
| C3 | **Lock down Supabase RLS policies** | All tables allow anonymous read/write. Anyone with the anon key can mutate data. | `supabase/migrations/*`, server-side data access |
| C4 | **Persist favorites to Supabase from UI** | Listing cards write to localStorage only; `favorites` table is unused. Data lost across devices/browsers. | `ListingCard`, `listing detail`, `favorites/page.tsx`, `FavoriteService` |
| C5 | **Persist price alarms to Supabase** | Alerts page CRUD is local React state seeded from mocks; survives no refresh correctly. | `alerts/page.tsx`, `AlarmService` |
| C6 | **Schedule automated sync (cron)** | No background job runs sync. Data goes stale unless manually triggered. | `SyncScheduler`, Netlify cron / Supabase pg_cron / edge cron → `sync-runner` |
| C7 | **Database seed for providers, categories, products** | Sync matches listings to products by title; empty DB = failed imports. Static config IDs ≠ Supabase UUIDs. | New seed migration or script |

---

## High

> Required for a coherent, trustworthy MVP. Architecture debt that causes bugs or misleading UX.

| # | Item | Why high | Affected areas |
|---|------|----------|----------------|
| H1 | **Persist AI analysis during sync** | AI recomputed on every page load; `ai_analysis` table exists but sync pipeline doesn't write to it. Wastes CPU; scores not historical. | `SyncService`, `DataCollector`, `AIService.analyzeAndPersist` |
| H2 | **Maintain `market_statistics` server-side** | Stats recomputed client-side from listing snapshot; table unused. Breaks at scale; inconsistent across pages. | Sync pipeline, `StatisticsService` |
| H3 | **Wire Sources page to real sync trigger** | "Sync all" button only refetches queries + shows toast; doesn't call `useTriggerSync` or edge function. | `sources/page.tsx`, `use-sync-data.ts` |
| H4 | **Consolidate dual type system** | Legacy `Listing`/`ProductModel` (camelCase, static IDs) vs `ListingResponse`/`ProductDTO` (UUID). Causes ID mismatches on products/categories pages. | `types/index.ts`, all pages using `PRODUCT_MODELS` |
| H5 | **Consolidate dual Zustand stores** | `useFavorites` vs `useFavoritesStore`, `useFilters` vs `useFiltersStore`. Inconsistent state across pages. | `lib/stores.ts`, `lib/stores/data-stores.ts` |
| H6 | **Remove mock data from production pages** | Favorites, alerts, command palette still import `mock-data-v2`. Shows wrong/stale data when Supabase has records. | `favorites/page.tsx`, `alerts/page.tsx`, `command-palette.tsx` |
| H7 | **Use real price history for charts** | Analytics + dashboard trends use synthetic sin-wave data; `price_history` table ignored for charts. | `usePriceHistoryQuery`, `use-dashboard-data.ts` |
| H8 | **Record price changes during sync** | `previous_price` column and `price_history` rows must be written when sync detects price diffs. | `SyncService`, `DataCollector`, `PriceHistoryService` |
| H9 | **Connect settings to `useSettingsStore`** | Theme works via next-themes; notification toggles, reduced motion, sync interval are toast-only. | `settings/page.tsx`, `useSettingsStore` |
| H10 | **Route UI through service layer** | `lib/queries.ts` duplicates service logic; harder to add server-side validation later. | All hooks → services instead of raw Supabase |

---

## Medium

> Important for polish, correctness, and maintainability. Not blocking basic usage once Critical/High are done.

| # | Item | Why medium | Affected areas |
|---|------|------------|----------------|
| M1 | **Integrate SearchEngine with live data** | Command palette searches mock listings; TopNav search not wired. | `command-palette.tsx`, `SearchEngine`, `useSearchStore` |
| M2 | **Unify sync dashboard hooks** | `useSyncDashboardData` + edge `dashboard-api` exist; Sources page uses legacy `useSyncRunsQuery`. | `sources/page.tsx`, `use-sync-data.ts` |
| M3 | **Add listing pagination / virtual scroll** | Hard 500 listing cap; no offset loading. Will degrade as inventory grows. | `fetchListings`, listings/deals pages, `DataTable` |
| M4 | **Persist listing notes & purchase status** | Detail page has `NotesSection`, `PurchaseStatusSection` with no DB model. | New table or columns, listing detail components |
| M5 | **Real notification delivery** | Notifications derived in-memory only; no push, email, or persistent inbox. | `useNotificationsQuery`, new `notifications` table |
| M6 | **Alarm trigger notifications** | Triggered alarms shown on dashboard but no alert when threshold crossed. | Sync post-process or DB trigger + notification service |
| M7 | **Favorite activity tracking** | Dashboard `favoriteUpdates` cycles fake change types; needs price/status diff logic. | `use-dashboard-data.ts`, sync diff |
| M8 | **Replace static `config/site.ts` catalog** | Products/categories/providers should load from Supabase; config becomes fallback only. | `products/page.tsx`, `categories/page.tsx`, `analytics/page.tsx` |
| M9 | **Use `FilterEngine` + `useFiltersStore` on listings page** | Listings page still uses legacy `useFilters` with fewer filter dimensions. | `listings/page.tsx`, `ListingsFilters` |
| M10 | **Server-side listing filters** | All filtering/sorting happens client-side after fetching 500 rows. | `ListingService.getAll`, Supabase query params |
| M11 | **Provider enable/disable from UI** | Settings shows static provider list; `providers.is_enabled` not togglable. | `settings/page.tsx`, `ProviderService` |
| M12 | **Error handling & retry for sync failures** | Failed provider runs logged but no user-facing alert or auto-retry policy. | `SyncService`, Sources page, notifications |
| M13 | **Content hash dedup for AI reanalysis** | `content_hash` column exists; engine computes hash but sync doesn't skip unchanged listings. | `AIService`, sync pipeline |
| M14 | **Product detail price trend from aggregated history** | Uses single best-deal listing history, not product-level aggregate. | `use-product-detail.ts` |
| M15 | **Delete/archive stale listings in sync** | Listings not seen in sync should set `is_active=false` or `deleted_at`. | `SyncService`, `DataCollector` |

---

## Low

> Nice-to-have, quality-of-life, or future-scale improvements.

| # | Item | Why low | Affected areas |
|---|------|---------|----------------|
| L1 | **Add test suite** | No unit/integration/E2E tests. | Jest/Vitest, Playwright |
| L2 | **Add CI pipeline** | No GitHub Actions or lint/typecheck gate in repo. | `.github/workflows` |
| L3 | **Remove legacy `mock-data.ts` / `mock-data-v2.ts`** | Keep only for Storybook/dev fixtures after production paths migrated. | `lib/mock-data*.ts` |
| L4 | **Remove unused `useListingsStore`** | Dead code in legacy stores. | `lib/stores.ts` |
| L5 | **Set HTML `lang="tr"`** | UI is Turkish; document declares English. | `app/layout.tsx` |
| L6 | **Add `.env.example`** | Document required environment variables for onboarding. | Project root |
| L7 | **Multi-city selector in UI** | Schema supports `city`; UI locked to Istanbul. | Filters, settings, sync keywords |
| L8 | **District heatmap real geodata** | Dashboard heatmap uses district name grouping only; no map visualization. | `DistrictHeatmapSection` |
| L9 | **Export / share listing report** | AI summary report section has no PDF or share action. | `notes-status.tsx` |
| L10 | **Keyboard shortcuts beyond ⌘K** | Only command palette; no listing navigation shortcuts. | `AppShell`, layout |
| L11 | **Image analysis with real CV/LLM** | `ImageAnalyzer` uses heuristics (count, URL patterns), not actual image inspection. | `lib/engines/analyzers/image-analyzer.ts` |
| L12 | **LLM-powered descriptions analysis** | `DescriptionAnalyzer` is keyword/heuristic based. | `description-analyzer.ts` |
| L13 | **Upgrade Next.js 13 → 14/15** | Security patches, App Router improvements, React 19 path. | `package.json`, breaking changes audit |
| L14 | **Supabase typed client codegen** | Manual row types in queries.ts; generate from schema. | Supabase CLI types |
| L15 | **Rate limiting on sync-runner edge function** | Unauthenticated POST could trigger expensive sync. | `supabase/functions/sync-runner` |
| L16 | **Daily digest email** | Settings toggle exists; no email infrastructure. | Settings, external email service |
| L17 | **Bulk alarm management** | Create/edit one at a time only. | `alerts/page.tsx` |
| L18 | **Seller profile page** | Seller data shown inline on listing; no dedicated `/sellers/[id]` route. | New page + nav entry |
| L19 | **Comparison basket** | Compare multiple listings side-by-side. | New feature |
| L20 | **PWA / offline favorites cache** | Service worker for read-only offline access. | Next.js PWA config |

---

## Suggested Implementation Order

A pragmatic sequence if tackling the backlog systematically:

```
Phase 1 — Trust & data (Critical)
  C7 → C2 → C3 → C6 → C1 → C4 → C5

Phase 2 — Coherent MVP (High)
  H8 → H1 → H2 → H3 → H4 → H5 → H6 → H7 → H9

Phase 3 — Scale & polish (Medium)
  M10 → M3 → M1 → M8 → M2 → M5 → M6 → M15

Phase 4 — Quality (Low)
  L1 → L2 → L6 → L3 → L5 → L13
```

---

## Quick Reference: Mock vs Live by Page

| Page | Live (Supabase) | Mock / Static | Local only |
|------|-----------------|---------------|-------------|
| Dashboard | ✅ | ⚠️ Synthetic price trends | — |
| Deals | ✅ | — | Favorites (localStorage) |
| Listings | ✅ | Static PRODUCT_MAP for labels | Favorites (localStorage) |
| Listing detail | ✅ | — | Favorites (localStorage) |
| Products | ⚠️ Stats live, labels static | PRODUCT_MODELS IDs | — |
| Product detail | ✅ | — | — |
| Categories | ⚠️ Stats live, catalog static | CATEGORIES | — |
| Favorites | ❌ | getMockListings | localStorage |
| Analytics | ⚠️ Stats live | Synthetic history, static catalog | — |
| Alerts | ⚠️ Notifications derived | getMockAlarms | Local alarm state |
| Sources | ✅ Sync tables | Static PROVIDERS config | Fake sync button |
| Settings | — | Static catalog counts | Toast-only toggles |
| Command palette | — | getMockListings | — |

---

## Definition of Done (MVP)

The project can be considered MVP-complete when:

- [ ] Real listings flow from at least one provider into Supabase on a schedule
- [ ] Owner token is enforced; database is not openly writable
- [ ] Favorites and alarms survive refresh and sync across sessions
- [ ] AI scores and market stats are persisted during sync, not recomputed in browser
- [ ] No production page imports `mock-data` or `mock-data-v2`
- [ ] Sources page triggers and displays real sync runs
- [ ] Price charts reflect `price_history`, not generated waves
- [ ] Products/categories use Supabase UUIDs end-to-end
