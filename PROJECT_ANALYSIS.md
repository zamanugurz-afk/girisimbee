# İkinciBazar — Project Analysis

**Generated:** 2026-07-27  
**Scope:** Full codebase review (read-only)  
**Product:** Private AI-assisted second-hand market monitor for Istanbul (Sahibinden, Letgo, Dolap)

---

## Executive Summary

İkinciBazar is a **Next.js 13** single-page application backed by **Supabase (PostgreSQL)**. It tracks gaming consoles and smart watches across Turkish classifieds platforms, scores listings with a **rules-based AI engine**, and surfaces deals, analytics, and sync health through a polished dashboard UI.

The architecture is **intentionally layered** (types → services → engines → queries → hooks → pages), but the project is in a **transitional state**: newer Supabase-backed data paths coexist with legacy config/mock paths. Several features are UI-complete but not fully wired to persistent backend behavior.

---

## Folder Structure

```
project/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout, fonts, AppProviders
│   ├── page.tsx                  # Redirects to /{OWNER_TOKEN}
│   ├── globals.css
│   └── [token]/                  # Token-scoped owner routes
│       ├── layout.tsx            # AppShell wrapper
│       ├── page.tsx              # Dashboard
│       ├── not-found.tsx
│       ├── alerts/
│       ├── analytics/
│       ├── categories/
│       ├── deals/
│       ├── favorites/
│       ├── listings/
│       │   └── [id]/
│       ├── products/
│       │   └── [id]/
│       ├── settings/
│       └── sources/
│
├── components/
│   ├── charts/                   # Recharts wrappers (trends, bar, donut)
│   ├── dashboard/                # Dashboard widgets & sections (~15 files)
│   ├── data-display/             # ListingCard, DataTable, filters, badges
│   ├── feedback/                 # Spinner, skeletons, empty/error states, motion
│   ├── layout/                   # AppShell, Sidebar, TopNav, CommandPalette
│   ├── listing-detail/           # Listing detail page sections (~15 files)
│   ├── providers/                # React Query + Theme providers
│   └── ui/                       # shadcn/Radix UI primitives (~40 files)
│
├── config/
│   ├── site.ts                   # Site metadata, static PRODUCT_MODELS, PROVIDERS
│   └── navigation.ts             # Sidebar nav sections, quick actions
│
├── hooks/
│   ├── use-dashboard-data.ts     # Dashboard aggregation from Supabase
│   ├── use-listing-detail.ts     # Listing detail aggregation
│   ├── use-product-detail.ts     # Product detail aggregation
│   ├── use-sync-data.ts          # Sync dashboard mutations/queries
│   └── use-toast.ts
│
├── lib/
│   ├── engines/                  # AI, price, filter, search engines + analyzers
│   ├── services/                 # Supabase CRUD service classes
│   ├── stores/
│   │   └── data-stores.ts        # New Zustand stores (v2)
│   ├── stores.ts                 # Legacy Zustand stores (favorites, filters, UI)
│   ├── queries.ts                # React Query fetchers + legacy hooks
│   ├── supabase.ts               # Browser Supabase client (anon key)
│   ├── mock-data.ts              # Legacy mock helpers
│   ├── mock-data-v2.ts           # Rich mock dataset (DTO-shaped)
│   ├── nav.ts                    # URL helpers (listingUrl, productUrl)
│   └── utils.ts
│
├── services/                     # Sync & provider infrastructure (server-side capable)
│   ├── sync-service.ts           # Orchestrates multi-provider sync
│   ├── sync-status-service.ts    # Read sync metrics
│   ├── scheduler.ts              # Interval-based sync scheduler
│   └── providers/                # Sahibinden, Letgo, Dolap adapters
│
├── supabase/
│   ├── migrations/               # 4 SQL migrations (core + sync + AI columns)
│   └── functions/
│       ├── sync-runner/          # Edge function: simulated provider sync
│       └── dashboard-api/        # Edge function: sync dashboard REST endpoints
│
├── types/
│   └── index.ts                  # Full domain type system (~1000 lines)
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

**Tech stack:** Next.js 13.5, React 18, TypeScript 5.2, Supabase JS 2.58, TanStack Query 5, Zustand 5, Tailwind 3.3, Radix UI, Framer Motion, Recharts, Zod, React Hook Form, Netlify Next plugin.

---

## Pages

All authenticated owner routes live under `/{NEXT_PUBLIC_OWNER_TOKEN}` (default: `/demo-token`). There is **no middleware** validating the token — any path segment works as a route prefix.

| Route | File | Purpose | Data source |
|-------|------|---------|-------------|
| `/` | `app/page.tsx` | Redirect to owner route | Static |
| `/{token}` | `app/[token]/page.tsx` | Dashboard — KPIs, deals, AI widgets, market overview | `useDashboardData` → Supabase |
| `/{token}/deals` | `deals/page.tsx` | AI-ranked deal feed (excellent/good) | `useListingsQuery` → Supabase + client AI |
| `/{token}/listings` | `listings/page.tsx` | Filterable listing grid | `useFilteredListings` → Supabase |
| `/{token}/listings/[id]` | `listings/[id]/page.tsx` | Full listing analysis & negotiation UI | `useListingDetail` → Supabase |
| `/{token}/products` | `products/page.tsx` | Product market stats table | `useMarketStatsQuery` + static `PRODUCT_MODELS` |
| `/{token}/products/[id]` | `products/[id]/page.tsx` | Product detail with related listings | `useProductDetail` → Supabase |
| `/{token}/categories` | `categories/page.tsx` | Category overview cards | Static categories + Supabase stats |
| `/{token}/favorites` | `favorites/page.tsx` | Saved listings | **Mock data** + localStorage favorites |
| `/{token}/analytics` | `analytics/page.tsx` | Charts, trends, distribution | Supabase stats + **synthetic price history** |
| `/{token}/alerts` | `alerts/page.tsx` | Notifications + price alarms | Derived notifications + **local mock alarms** |
| `/{token}/sources` | `sources/page.tsx` | Provider sync health | `useSyncRunsQuery` → Supabase sync tables |
| `/{token}/settings` | `settings/page.tsx` | Theme, notifications (UI only), scope info | Static config + toasts |

---

## Components

### Layout (`components/layout/`)
| Component | Role |
|-----------|------|
| `AppShell` | Sidebar + TopNav + MobileSidebar + CommandPalette wrapper |
| `Sidebar` / `MobileSidebar` | Navigation from `NAV_SECTIONS` |
| `TopNav` | Search trigger, notifications bell, theme toggle |
| `CommandPalette` | ⌘K global search (**uses mock listings**) |
| `Breadcrumbs` / `PageHeader` / `ThemeToggle` | Page chrome |

### Dashboard (`components/dashboard/`)
~20 section components: `KpiCards`, `BestDealsTable`, `ai-sections`, `alerts-timeline`, `market-sections`, `charts-sections`, `insights-sections`, `new-widgets`, `QuickActionsPanel`, etc. All consume `DashboardAggregation` from `useDashboardData`.

### Listing Detail (`components/listing-detail/`)
Rich analysis UI: `ListingHeader`, `ImageGallery`, `AIDecisionCard`, `MarketAnalysisCard`, `NegotiationCenter`, `SellerInfoCard`, `RiskCenter`, `PurchaseChecklist`, `SimilarListingsTable`, `ActionSidebar`, etc.

### Data Display (`components/data-display/`)
`ListingCard`, `ListingsFilters`, `DataTable`, `StatCard`, `SectionCard`, badges, `ListingDetailDialog` (legacy mock insight).

### Feedback (`components/feedback/`)
Loading skeletons, `EmptyState`, `ErrorState`, Framer Motion wrappers.

### UI (`components/ui/`)
Full shadcn-style Radix component library (~40 primitives).

### Charts (`components/charts/`)
`PriceTrendChart`, `BarSeriesChart`, `DonutChart` — built on Recharts.

---

## Services

### Supabase CRUD Layer (`lib/services/`)

| Service | Table(s) | Notes |
|---------|----------|-------|
| `CategoryService` | `categories` | CRUD |
| `ProductService` | `products` | CRUD + filters |
| `ProviderService` | `providers` | CRUD |
| `SellerService` | `sellers` | CRUD |
| `ListingService` | `listings` | CRUD, upsert, rich joins incl. `ai_analysis` |
| `FavoriteService` | `favorites` | Toggle, CRUD |
| `AlarmService` | `alarms` | CRUD |
| `PriceHistoryService` | `price_history` | Read/create |
| `StatisticsService` | `market_statistics` | Aggregated stats CRUD |
| `AIService` | `ai_analysis` | CRUD + `analyzeAndPersist` via AIEngine |

**Usage gap:** Pages and hooks primarily call `lib/queries.ts` directly. Service classes are exported but largely unused by the UI layer.

### Sync & Provider Layer (`services/`)

| Module | Role |
|--------|------|
| `SyncService` | Creates `sync_runs`, runs providers in parallel, writes `sync_logs`, updates `provider_status`, upserts listings/sellers |
| `SyncStatusService` | Reads sync dashboard metrics |
| `SyncScheduler` | Browser `setTimeout`-based interval runner (5/10/15/30 min) |
| `DataCollector` | Per-provider collection + normalization pipeline |
| `ListingNormalizer` | Raw → DB-shaped listing |
| `SahibindenProviderService` | **Simulated** listings (seeded random) |
| `LetgoProviderService` | **Simulated** listings |
| `DolapProviderService` | **Simulated** listings |

### Edge Functions (`supabase/functions/`)

| Function | Endpoints | Role |
|----------|-----------|------|
| `dashboard-api` | `/provider-status`, `/last-sync`, `/imported-today`, `/listings-today`, `/price-changes-today`, `/recent-logs` | REST API for sync dashboard (service role) |
| `sync-runner` | POST trigger | Server-side sync with embedded simulated providers |

---

## Stores

### Legacy (`lib/stores.ts`)
| Store | Persisted | Purpose |
|-------|-----------|---------|
| `useFavorites` | localStorage (`ib-favorites`) | Favorite listing IDs only |
| `useFilters` | localStorage (`ib-filters`) | Legacy filter state for listings page |
| `useUI` | localStorage (`ib-ui`) | Sidebar collapse, command palette, mobile nav |
| `useListingsStore` | No | Unused legacy listing cache |

### New (`lib/stores/data-stores.ts`)
| Store | Persisted | Purpose |
|-------|-----------|---------|
| `useProductsStore` | No | Products + categories cache |
| `useProvidersStore` | No | Providers cache |
| `useSellersStore` | No | Sellers cache |
| `useListingsDataStore` | No | Listings cache |
| `useFiltersStore` | Partial (`ib-filters-v2`) | Extended filter state with `toFilter()` |
| `useFavoritesStore` | Yes (`ib-favorites-v2`) | Favorites with toggle (local only) |
| `useAlarmsStore` | No | Alarms cache |
| `useStatisticsStore` | No | Market stats cache |
| `useAIStore` | No | AI analyses cache |
| `useDashboardStore` | No | Dashboard data cache |
| `useSettingsStore` | Yes (`ib-settings`) | Theme, notifications prefs, sync interval |
| `useSearchStore` | No | Search query/results |

**Duplication:** Two favorites systems (`useFavorites` vs `useFavoritesStore`) and two filter systems (`useFilters` vs `useFiltersStore`) run in parallel. Listing cards use legacy `useFavorites` (localStorage only); `FavoriteService` writes to Supabase but is not called from UI.

---

## Database Models

Defined in `supabase/migrations/` and mirrored in `types/index.ts`.

### Core Schema (`20260727092139_create_core_schema.sql`)

| Table | Key fields | Relationships |
|-------|------------|---------------|
| `categories` | name, slug, icon, sort_order | → products |
| `products` | category_id, name, brand, model, slug, is_active | → listings, alarms, market_statistics |
| `providers` | name, slug, logo_url, is_enabled | → sellers, listings |
| `sellers` | provider_id, external_id, display_name, rating, verified flags | UNIQUE(provider_id, external_id) |
| `listings` | provider_id, product_id, external_listing_id, title, price, images (jsonb), location, condition, seller_id, soft delete | UNIQUE(provider_id, external_listing_id) |
| `favorites` | listing_id, notes | |
| `alarms` | product_id, target_price, is_enabled | |
| `price_history` | listing_id, price, detected_at | |
| `market_statistics` | product_id, avg/median/min/max price, listing_count | UNIQUE(product_id) |
| `ai_analysis` | listing_id, scores (opportunity, seller, image, description, negotiation, fake, confidence), recommendation | UNIQUE(listing_id) |

### Sync Infrastructure (`20260727125501_create_sync_infrastructure.sql`)

| Table | Purpose |
|-------|---------|
| `sync_runs` | Per-cycle aggregate (found/imported/updated/failed) |
| `sync_logs` | Per-provider log within a run |
| `provider_status` | Denormalized provider health (one row per provider) |

### Additional Migrations
- `20260727121532` — Extended `ai_analysis` columns (price_score, risk_score, overall_score, ai_summary, negotiation fields, content_hash)
- `20260727130703` — `listings.previous_price` for instant price-drop detection

### Security Model
All tables have RLS enabled with **open policies** (`USING (true)` for anon + authenticated). Designed for single-tenant private use with **no authentication**. Comments note future `owner_id` scoping for multi-user.

---

## API Structure

There are **no Next.js API routes** (`app/api/`). Data access patterns:

```
Browser (anon key)
    └── Supabase Client (lib/supabase.ts)
            ├── Direct table queries (lib/queries.ts)
            ├── Service classes (lib/services/*) — mostly unused by UI
            └── React Query hooks (hooks/*, lib/queries.ts)

Edge Functions (service role)
    ├── dashboard-api  → GET sync metrics
    └── sync-runner    → POST run sync cycle

Sync (can run client or edge)
    └── SyncService → Provider adapters → Supabase upserts
```

### Query Layer (`lib/queries.ts`)

**Supabase fetchers:** `fetchProviders`, `fetchCategories`, `fetchActiveProducts`, `fetchListings`, `fetchListingById`, `fetchSellers`, `fetchPriceHistory`, `fetchAlarms`, `fetchFavorites`

**Client-side compute:** `computeMarketStats`, `computeAIAnalyses` — run in browser on every fetch

**Legacy hooks:** `useListingsQuery`, `useFilteredListings`, `useMarketStatsQuery`, `usePriceHistoryQuery` (synthetic), `useSyncRunsQuery`, `useNotificationsQuery` (derived)

### Hooks Layer

| Hook | Aggregates |
|------|------------|
| `useDashboardData` | Full dashboard: KPIs, deals, price drops, alerts, districts, trends |
| `useListingDetail` | Single listing + negotiation, risk, timeline, similar listings |
| `useProductDetail` | Product stats + related listings |
| `useSyncDashboardData` | Sync metrics via `SyncStatusService` (**not used by Sources page**) |
| `useTriggerSync` | Manual sync mutation (**not wired to Sources page button**) |

---

## Engines (`lib/engines/`)

| Engine | Responsibility |
|--------|----------------|
| `AIEngine` | Orchestrates analyzers → opportunity score, recommendation, negotiation |
| `PriceEngine` | Median/min/max stats, opportunity %, trends |
| `FilterEngine` | Listing filter application |
| `SearchEngine` | In-memory text search across listings/products/sellers |
| Analyzers | `OpportunityAnalyzer`, `SellerAnalyzer`, `PriceAnalyzer`, `DescriptionAnalyzer`, `ImageAnalyzer`, `NegotiationAnalyzer`, `RiskAnalyzer`, `RecommendationEngine`, `SummaryAnalyzer` |

AI is **heuristic/rules-based**, not LLM-powered. Results are computed client-side and **not consistently persisted** to `ai_analysis` during sync.

---

## Missing Functionality

### Critical gaps
1. **No real provider integrations** — Sahibinden/Letgo/Dolap adapters generate simulated data
2. **No route protection** — `OWNER_TOKEN` is cosmetic; no middleware validates access
3. **Open database security** — RLS allows full read/write for anonymous users
4. **Favorites not persisted** — UI uses localStorage; `favorites` table unused by listing cards
5. **Alarms not persisted** — Alerts page uses local state + mock seed data
6. **Automated sync not scheduled** — `SyncScheduler` exists but nothing starts it; no cron wiring

### High gaps
7. **Dual architecture not consolidated** — Legacy types/stores/config coexist with Supabase DTO path
8. **AI analysis not stored during sync** — Recomputed on every page load; `ai_analysis` table underutilized
9. **Market statistics not maintained server-side** — Computed client-side from listings snapshot
10. **Sources page sync button is fake** — Refetches queries only; does not call `useTriggerSync`
11. **Settings are non-functional** — Notification toggles, reduced motion, sync interval show toasts only
12. **Product/category pages use static config IDs** — `PRODUCT_MODELS` IDs may not match Supabase UUIDs

### Medium gaps
13. **Synthetic price trends** — Analytics and dashboard charts use sin-wave generated data, not `price_history`
14. **Command palette uses mock listings** — Not connected to Supabase search
15. **Favorites page uses mock data** — `getMockListings()` instead of Supabase
16. **Service layer bypassed** — CRUD services exist but queries.ts duplicates logic
17. **No seed migration** — DB tables empty without sync run; static config fills UI gaps
18. **Notification system incomplete** — Derived from listings, no push/email/digest
19. **Search not integrated** — `SearchEngine` exists but TopNav/command palette don't use it with live data
20. **Purchase status / notes on listings** — UI sections exist but no DB backing

### Low gaps
21. **No tests** — No unit, integration, or E2E test suite
22. **No CI/CD config** in repo root (Netlify plugin referenced in package.json)
23. **Mixed language** — UI is Turkish; some code comments/types in English
24. **`lang="en"` on HTML** — Should be `tr` for Turkish UI
25. **Legacy mock files** — `mock-data.ts` and `mock-data-v2.ts` still imported in production paths
26. **Listing limit 500** — Hard cap in `fetchListings` may truncate large datasets
27. **No pagination** on listing grids
28. **No multi-city support in UI** — Locked to Istanbul despite schema supporting `city`

---

## Architecture Evaluation

### Strengths

1. **Clear domain modeling** — `types/index.ts` defines comprehensive DTO/Response/Filter/Card shapes for every entity
2. **Provider plugin architecture** — `ProviderServiceInterface` + registry allows adding sources without touching sync core
3. **Separation of sync read/write** — `SyncService` vs `SyncStatusService` is a good boundary
4. **Rich UI with consistent design system** — shadcn/Radix + Tailwind + motion polish
5. **React Query for server state** — Proper caching, refetch intervals, parallel fetches on dashboard
6. **Supabase schema is production-shaped** — Indexes, soft deletes, unique constraints, triggers, sync audit trail
7. **Listing detail page is feature-complete** — Negotiation scripts, risk flags, market comparison, timeline

### Weaknesses

1. **Incomplete migration from mock/static to live data** — Three data sources coexist: Supabase, `config/site.ts` static arrays, `mock-data-v2.ts`
2. **Client-side heavy computation** — AI + market stats on every fetch won't scale beyond hundreds of listings
3. **Security model is placeholder** — Token-in-URL + open RLS is not production-safe
4. **No single source of truth for favorites/alarms/settings** — Split between localStorage, local React state, and DB tables
5. **Service layer orphaned** — Good abstractions exist but UI bypasses them
6. **Simulated providers everywhere** — Both client `services/providers/*` and edge `sync-runner` fake data
7. **No observability** — No structured logging, error tracking, or sync failure alerting beyond DB rows

### Recommended direction (analysis only)

| Priority | Action |
|----------|--------|
| 1 | Add middleware to validate `OWNER_TOKEN`; tighten RLS or use service role server-side |
| 2 | Wire favorites/alarms UI to Supabase via existing services |
| 3 | Persist AI analysis + market_statistics during sync pipeline |
| 4 | Replace simulated providers with real scrapers/APIs behind edge function |
| 5 | Consolidate legacy types/stores; remove mock imports from production pages |
| 6 | Move aggregation to edge functions or Postgres views for scale |
| 7 | Wire Sources page to `useTriggerSync` + external cron for `sync-runner` |

### Architecture diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App (Client)                     │
│  Pages → Hooks → queries.ts → Supabase (anon)               │
│           ↓                                                  │
│     AIEngine / PriceEngine (client compute)                  │
│           ↓                                                  │
│     Zustand (localStorage favorites, filters, settings)      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Supabase (PostgreSQL)                     │
│  categories · products · providers · sellers · listings      │
│  favorites · alarms · price_history · market_statistics      │
│  ai_analysis · sync_runs · sync_logs · provider_status       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Edge Functions (service role)                   │
│  sync-runner ──→ simulated providers ──→ upsert listings     │
│  dashboard-api ──→ sync metrics REST                         │
└─────────────────────────────────────────────────────────────┘

Gap: UI ──✗──► FavoriteService / AlarmService / AIService persist
Gap: Cron ──✗──► sync-runner (no scheduled trigger)
Gap: Providers ── simulated, not real marketplace APIs
```

---

## Configuration & Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser client key |
| `NEXT_PUBLIC_OWNER_TOKEN` | URL prefix for private routes (default: `demo-token`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge functions only (not in frontend) |

Static config in `config/site.ts`: 3 providers, 2 categories, 21 product models with MSRP/reference prices.

---

## Deployment Notes

- `@netlify/plugin-nextjs` in dependencies suggests Netlify deployment target
- `robots: { index: false }` — intentionally private
- No `middleware.ts` present
- Supabase migrations ready but require manual apply + seed providers/products
