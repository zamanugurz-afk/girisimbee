# Girişimco Ecosystem Architecture

**Status:** P3 complete (API routes + validation + tests)  
**UI:** Frozen — no homepage/hero/card/nav changes  
**Date:** 2026-07-31

---

## Finalized decisions

| Decision | Resolution |
|----------|------------|
| Franchise | Single category `franchise`; subcategories `franchise-buy` (Bayilik Al), `franchise-give` (Bayilik Ver) |
| Storage | Hybrid — shared spine + module-specific profile tables (not JSON-only) |
| Payments | iyzico v1; abstraction at `lib/payments/`; Stripe/PayTR stubs only |
| Messaging | No internal messaging v1; external contact via phone, WhatsApp, email, website |
| Workflows | Jobs: application→unlock→contact; Investments/co-founders: match→contact; Franchise: application→contact |

---

## Module registry

| # | Module | Category slug | Module key | Workflow |
|---|--------|---------------|------------|----------|
| 1 | Entrepreneurs | `yatirim-bul` | `entrepreneurs` | match → contact |
| 2 | Investors | `yatirim-yap` | `investors` | match → contact |
| 3 | Job Seekers | `is-bul` | `candidates` | application → unlock → contact |
| 4 | Employers | `ise-al` | `employers` | application → unlock → contact |
| 5 | Co-founders | `ortak-bul` | `founders` | match → contact |
| 6 | Franchise | `franchise` | `franchise` | application → contact |

Franchise subcategories share the same core architecture; differentiated by `subcategory_id` on listings and `subcategory_slug` on `franchise_profiles`.

---

## Shared tables

| Table | Role |
|-------|------|
| `marketplace_profiles` | User identity |
| `marketplace_categories` | Six primary modules (+ `module_key`) |
| `marketplace_subcategories` | Franchise buy/give + future drill-down |
| `marketplace_listings` | All opportunities (extended with ecosystem columns) |
| `marketplace_packages` | Listing credits / unlock packages |
| `marketplace_payments` | Payment records (iyzico) |
| `marketplace_matches` | Investment + co-founder matching |
| `marketplace_applications` | Job + franchise applications |
| `marketplace_documents` | Pitch decks, CVs, brochures |

---

## Module-specific profile tables

| Table | Module |
|-------|--------|
| `entrepreneur_profiles` | Girişimciler |
| `investor_profiles` | Yatırımcılar |
| `candidate_profiles` | İş Arayanlar |
| `employer_profiles` | İş Verenler |
| `founder_profiles` | Kurucular |
| `franchise_profiles` | Franchise |

Onboarding tracked in `marketplace_profile_modules`.

---

## P0 migration order

| # | File | Contents |
|---|------|----------|
| 1 | `20260801120000_ecosystem_enums.sql` | PostgreSQL enums |
| 2 | `20260801120100_ecosystem_subcategories.sql` | Subcategories + franchise seeds |
| 3 | `20260801120200_ecosystem_extend_listings.sql` | Listing ecosystem columns + contact fields |
| 4 | `20260801120300_ecosystem_module_profiles.sql` | Six module profile tables |
| 5 | `20260801120400_ecosystem_matches_applications.sql` | Matches + applications |
| 6 | `20260801120500_ecosystem_documents.sql` | Documents + storage bucket |
| 7 | `20260801120600_ecosystem_payments.sql` | Payments table |
| 8 | `20260801120700_ecosystem_rls_helpers.sql` | Security definer functions |
| 9 | `20260801120800_ecosystem_rls_policies.sql` | RLS for all new tables |

Apply with: `supabase db push` or `supabase migration up`

---

## PostgreSQL enums

- `marketplace_module_key` — entrepreneurs, investors, candidates, employers, founders, franchise
- `marketplace_match_status` — requested, accepted, declined, contacted, closed_won, closed_lost
- `marketplace_application_status` — submitted, reviewing, unlocked, contacted, accepted, rejected, withdrawn, hired
- `marketplace_payment_status` — pending, processing, succeeded, failed, refunded, cancelled
- `marketplace_payment_provider` — iyzico, stripe, paytr
- `marketplace_payment_purpose` — publish, unlock_candidate, featured, urgent, package_purchase
- `marketplace_document_type` — pitch_deck, cv, contract, franchise_brochure, other
- `marketplace_document_visibility` — private, match_only, application_only, public
- `marketplace_workflow_status` — draft → published → matching/reviewing → completed
- `marketplace_profile_module_status` — inactive, onboarding, active, suspended
- `marketplace_subcategory_status` — active, archived

---

## TypeScript types (P0)

| Location | Contents |
|----------|----------|
| `lib/domain/modules.ts` | `ModuleKey`, category slug map, workflow module sets |
| `lib/domain/marketplace-enums.ts` | Enum mirrors + status transitions + `ExternalContactInfo` |
| `lib/domain/ids.ts` | Branded IDs: SubcategoryId, MatchId, DocumentId, PaymentId, ProfileModuleId |
| `features/profiles/types/` | Six module profile types + `ModuleProfileMap` |
| `features/matching/types/` | Match, MarketplaceApplication |
| `features/documents/types/` | MarketplaceDocument |
| `features/monetization/types/payment.types.ts` | MarketplacePayment |
| `features/categories/types/subcategory.types.ts` | Subcategory |
| `features/listings/types/listing.entity.types.ts` | Extended Listing with ecosystem fields |
| `lib/payments/` | IPaymentProvider, IyzicoPaymentProvider, PaymentService |

---

## Payment abstraction

```
lib/payments/
├── interfaces/payment-provider.ts   # IPaymentProvider contract
├── providers/
│   ├── iyzico.ts                      # Implemented (Checkout Form API)
│   ├── stripe.ts                      # Stub
│   └── paytr.ts                       # Stub
└── services/payment-service.ts        # Provider resolution, default: iyzico
```

Environment variables for iyzico:
- `IYZICO_API_KEY`
- `IYZICO_SECRET_KEY`
- `IYZICO_BASE_URL` (optional, defaults to sandbox)

---

## External contact (v1)

Listings expose contact fields instead of internal messaging:

- `contact_phone`
- `contact_whatsapp`
- `contact_email`
- `contact_website`

`marketplace_conversations` / `marketplace_messages` remain in schema for future v2 but are not wired into v1 workflows.

---

## Anonymous job applications

Pre-unlock visible: city, district, industry, experience, education, skills, profile_score  
Hidden until unlock: name, surname, phone, email, CV, LinkedIn

Enforced via:
- `anonymous_snapshot` JSONB on `marketplace_applications`
- `can_view_application_pii()` RLS helper
- `candidate_profiles_unlocked_application_read` policy

---

## RLS summary

| Table | Read | Write |
|-------|------|-------|
| subcategories | Public (active) | Admin |
| profile_modules | Owner | Owner |
| module profiles | Owner + public published profiles | Owner |
| matches | Participants | Initiator insert; participants update |
| applications | Applicant + listing manager | Scoped update |
| documents | Owner + visibility rules | Owner |
| payments | Owner | Owner insert; admin/service webhook |

---

## Next phases

| Phase | Scope | Status |
|-------|-------|--------|
| **P0** | Migrations, enums, types, payment abstraction | ✅ Done |
| **P1** | Repository interfaces + mock + Supabase + tests | ✅ Done |
| **P2** | Module services (EntrepreneurListingService, EmployerJobService, …) | ✅ Done |
| **P3** | API routes / server actions | ✅ Done |
| **P4** | UI integration (when explicitly unfreezed) | Pending |

### P1 repositories

| Repository | Interface | Mock | Supabase | Tests |
|------------|-----------|------|----------|-------|
| ModuleProfileRepository | `features/profiles/repositories/module-profile.repository.ts` | ✅ | ✅ | ✅ |
| ListingRepository | existing + ecosystem filters | ✅ | ✅ | ✅ |
| MatchRepository | `features/matching/repositories/match.repository.ts` | ✅ | ✅ | ✅ |
| ApplicationRepository | `features/matching/repositories/application.repository.ts` | ✅ | ✅ | ✅ |
| DocumentRepository | `features/documents/repositories/document.repository.ts` | ✅ | ✅ | ✅ |
| PaymentRepository | `features/monetization/repositories/payment.repository.ts` | ✅ | ✅ | ✅ |

Run tests: `npm run test`  
Apply migrations to Supabase: `supabase db push`

### P2 services

| Service | Path | Workflow |
|---------|------|----------|
| DocumentService | `features/documents/services/document.service.ts` | register / link / visibility |
| MatchService | `features/matching/services/match.service.ts` | match → external contact |
| ApplicationService | `features/matching/services/application.service.ts` | apply → unlock → contact |
| MarketplacePaymentService | `features/monetization/services/payment.service.ts` | iyzico checkout + unlock |
| EntrepreneurListingService | `features/entrepreneurs/services/entrepreneur-listing.service.ts` | publish startup → match |
| InvestorListingService | `features/investors/services/investor-listing.service.ts` | browse → match |
| CandidateService | `features/candidates/services/candidate.service.ts` | profile + apply |
| EmployerJobService | `features/employers/services/employer-job.service.ts` | publish job → unlock |
| FounderService | `features/founders/services/founder.service.ts` | publish search → match |
| FranchiseService | `features/franchise/services/franchise.service.ts` | Bayilik Al / Bayilik Ver |

DI wiring: `lib/persistence/ecosystem-services.ts` → `lib/persistence/container.ts`  
Container getters: `getFranchiseService()`, `getMatchService()`, `getApplicationService()`, …

### P3 API routes

Shared infrastructure: `lib/api/` — `error-handler.ts`, `response.ts`, `with-auth.ts`, `validation/`

Auth: Supabase session via `createClient()` → resolve `profileId` from `profileRepository.findByUserId`. Mutating endpoints require auth (401). Domain errors mapped: NotFound→404, Forbidden→403, Validation→400, Conflict→409, InvalidTransition→422.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profiles/[module]` | ✅ | Get module profile |
| PUT | `/api/profiles/[module]` | ✅ | Upsert module profile |
| POST | `/api/profiles/[module]/activate` | ✅ | Activate module (franchise: `{ flow: "buy"\|"give" }`) |
| GET | `/api/listings/[module]` | optional | Browse published listings (entrepreneurs/investors/franchise) |
| POST | `/api/listings/[module]` | ✅ | Publish listing (entrepreneurs/founders/franchise) |
| GET | `/api/matches` | ✅ | List matches for profile or `?listingId=` |
| POST | `/api/matches` | ✅ | Create match `{ moduleKey, targetProfileId, listingId? }` |
| GET | `/api/matches/[id]` | ✅ | Get match by id |
| PATCH | `/api/matches/[id]` | ✅ | Transition: accept/decline/contact/close_won/close_lost |
| GET | `/api/applications` | ✅ | List applications for profile or `?listingId=` |
| POST | `/api/applications` | ✅ | Submit application `{ listingId, coverMessage? }` |
| GET | `/api/applications/[id]` | ✅ | Get application (anonymous or unlocked view) |
| PATCH | `/api/applications/[id]` | ✅ | review/contact/withdraw or unlock via `{ paymentId }` |
| GET | `/api/documents` | ✅ | List owner documents |
| POST | `/api/documents` | ✅ | Register uploaded document |
| PATCH | `/api/documents/[id]` | ✅ | Update visibility or link to listing |
| DELETE | `/api/documents/[id]` | ✅ | Soft-delete document |
| POST | `/api/payments/checkout` | ✅ | iyzico package checkout |
| POST | `/api/payments/unlock` | ✅ | iyzico candidate unlock checkout |
| POST | `/api/payments/webhook/iyzico` | public | iyzico webhook verification |
| GET | `/api/franchise/buy` | optional | Browse Bayilik Al opportunities |
| POST | `/api/franchise/buy` | ✅ | Apply to franchise-give listing |
| GET | `/api/franchise/give` | optional | Browse Bayilik Ver seekers or `?listingId=` applications |
| POST | `/api/franchise/give` | ✅ | Publish Bayilik Ver listing |
| POST | `/api/employers/jobs` | ✅ | Publish job listing |
| GET | `/api/employers/applications?listingId=` | ✅ | List anonymous applications |
| POST | `/api/employers/applications/[id]/unlock` | ✅ | Start unlock checkout (iyzico) |
| PATCH | `/api/employers/applications/[id]/unlock` | ✅ | Complete unlock or contact candidate |

### P3 server actions

Thin wrappers mirroring API routes — call P2 services via DI container. Not wired to UI components.

Import from `@/lib/api/actions`:

| Domain | Actions |
|--------|---------|
| Profiles | `getModuleProfileAction`, `upsertModuleProfileAction`, `activateModuleProfileAction` |
| Listings | `browseListingsAction`, `publishListingAction` |
| Matches | `listMatchesAction`, `createMatchAction`, `getMatchAction`, `transitionMatchAction` |
| Applications | `listApplicationsAction`, `submitApplicationAction`, `getApplicationAction`, `transitionApplicationAction` |
| Documents | `listDocumentsAction`, `registerDocumentAction`, `updateDocumentAction`, `deleteDocumentAction` |
| Payments | `createPackageCheckoutAction`, `createUnlockCheckoutAction`, `getPaymentStatusAction`, `getPaymentAction` |
| Franchise | `browseFranchiseBuyAction`, `applyFranchiseBuyAction`, `browseFranchiseGiveAction`, `publishFranchiseGiveAction`, `listFranchiseApplicationsAction`, `contactFranchiseApplicationAction` |
| Employers | `publishEmployerJobAction`, `listEmployerApplicationsAction`, `purchaseEmployerUnlockAction`, `unlockEmployerApplicationAction`, `contactEmployerCandidateAction` |

Shared: `lib/api/action-handler.ts`, `lib/api/action-result.ts` — same error mapping as HTTP layer.

Tests: `lib/api/error-handler.test.ts`, `lib/api/validation/schemas.test.ts`, `lib/api/action-handler.test.ts`

---

## UI freeze

Do not modify: homepage, hero, category cards, listing cards, navigation, footer.
