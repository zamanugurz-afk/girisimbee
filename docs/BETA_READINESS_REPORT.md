# GirisimBee Beta Readiness Report

**Date:** 29 July 2026  
**Scope:** First-time user journey (register → verify → profile → create/publish listing → browse/search/favorite → edit profile → sign out/in)  
**Constraint:** No new features; FTUE polish only.

---

## Executive Summary

| Verdict | **Conditional Beta Ready** |
|---------|---------------------------|
| Core journey | Completable end-to-end with Supabase configured |
| Memory-only dev | Browse works (24 seeded listings); created listings lost on refresh |
| Critical blockers fixed | 7 (see § FTUE Fixes) |
| Remaining gaps | 12 non-blocking UX / infra items |

A brand-new user can register, optionally verify email, complete a marketplace profile, create and publish a listing, browse/search/favorite listings, edit profile, sign out, and sign back in. Several polish gaps remain (demo listing favorites, `/profil` 404, data persistence in memory mode).

---

## Journey Matrix

Legend: ✅ Present · ⚠️ Partial · ❌ Missing · 🔧 Fixed this review

### 1. Register (`/kayit`)

| Aspect | Status | Notes |
|--------|--------|-------|
| **Journey** | ✅ | Form → toast → `/eposta-dogrula?email=` (if verification required) or `/dashboard` |
| **Blockers** | — | None |
| **Loading** | ✅ | Submit button: "Kaydediliyor…" |
| **Error** | ✅ | Toast on Supabase/signUp failure; field validation via Zod |
| **Empty** | N/A | Form always has fields |
| **Missing** | ⚠️ | No inline password-strength hint; no terms/privacy checkbox |

**Auth profile:** Supabase trigger creates `public.profiles` on signup. `marketplace_profiles` is **not** auto-created (created on first `/ayarlar` visit).

---

### 2. Verify Email (`/eposta-dogrula`)

| Aspect | Status | Notes |
|--------|--------|-------|
| **Journey** | ✅ | Register redirects here; user clicks link → `/auth/callback` → session |
| **Blockers** | — | Verification is **advisory** — unverified users retain full access |
| **Loading** | ✅ | Resend button: "Gönderiliyor…" |
| **Error** | ✅ | Toast if resend fails; missing email param shows generic copy |
| **Empty** | ⚠️ | No email in URL → generic message, resend disabled |
| **Missing** | ⚠️ | No success state after callback (lands on dashboard/login); no "check spam" hint |

**Middleware:** Does not gate protected routes on `emailVerified`.

---

### 3. Complete Profile (`/ayarlar`)

| Aspect | Status | Notes |
|--------|--------|-------|
| **Journey** | 🔧 ✅ | Auth menu → `/ayarlar` → auto-create profile → edit → save → publish |
| **Blockers** | 🔧 Fixed | Was 404; page + `ProfileSettingsForm` added |
| **Loading** | ✅ | Spinner while profile loads |
| **Error** | ✅ | Toast on load/save failure |
| **Empty** | ✅ | Form pre-filled from auth displayName |
| **Missing** | ⚠️ | No guided onboarding wizard; no avatar upload; `/profil` (public profile view) still 404 |

**Completeness:** Progress bar shows `%profile.completenessScore`.

---

### 4. Create First Listing (`/ilan/olustur`)

| Aspect | Status | Notes |
|--------|--------|-------|
| **Journey** | ✅ | Protected route → category/type select → dynamic form → submit |
| **Blockers** | — | Middleware redirects unauthenticated users to login with `?next=` |
| **Loading** | ✅ | Suspense skeleton on page; form submit state |
| **Error** | 🔧 ✅ | Toast if unauthenticated on submit |
| **Empty** | ✅ | Category selector shown before form |
| **Missing** | ⚠️ | No draft save; no "preview before publish" step |

---

### 5. Publish Listing

| Aspect | Status | Notes |
|--------|--------|-------|
| **Journey** | ✅ | Auto-publish on create (`publishListing`); redirect to `/ilan/{slug}` |
| **Blockers** | 🔧 Fixed | Was redirect to `/dashboard` with no listing link |
| **Loading** | ✅ | Covered by create form submit |
| **Error** | ⚠️ | Publish failure not separately surfaced (bundled in create) |
| **Empty** | N/A | — |
| **Missing** | ⚠️ | Moderation queue skipped (immediate publish by design for beta) |

---

### 6. Browse Listings (`/kesfet`, `/kategori/[slug]`)

| Aspect | Status | Notes |
|--------|--------|-------|
| **Journey** | ✅ | 24 seeded listings in memory mode; infinite scroll |
| **Blockers** | 🔧 Fixed | Missing SiteHeader/Footer; no error UI |
| **Loading** | ✅ | Center spinner (initial); bottom spinner (load more); "Tüm ilanlar yüklendi" |
| **Error** | 🔧 ✅ | Error banner + "Tekrar Dene" |
| **Empty** | ✅ | Dashed border: "Bu filtrelere uygun ilan bulunamadı." |
| **Missing** | ⚠️ | No skeleton cards (spinner only); filter chips have no "clear all" label |

---

### 7. Search Listings (`/ara?q=`)

| Aspect | Status | Notes |
|--------|--------|-------|
| **Journey** | ✅ | Header search → `/ara?q=`; reuses `MarketplaceBrowseView` |
| **Blockers** | — | Same fixes as browse |
| **Loading / Error / Empty** | ✅ | Inherited from browse view |
| **Missing** | ⚠️ | Empty query shows all listings (no "enter a term" prompt); no search suggestions |

---

### 8. Favorite a Listing

| Aspect | Status | Notes |
|--------|--------|-------|
| **Journey** | ⚠️ | Browse cards: ✅ · Detail page: 🔧 ✅ (engine listings) · Demo mocks: ❌ |
| **Blockers** | 🔧 Fixed | Detail used local state; login `next` hardcoded |
| **Loading** | ⚠️ | Toggle is optimistic; no per-button spinner |
| **Error** | ⚠️ | Favorite toggle errors not surfaced (silent fail in provider) |
| **Empty** | ✅ | `/favoriler`: "Henüz favori ilanınız yok…" |
| **Missing** | ⚠️ | Demo `/ilan/ai-crm-platform` has no `listingId` → no favorite button |

**Persistence:** Favorites persist in Supabase; lost on refresh in memory mode.

---

### 9. Edit Profile (`/ayarlar`)

| Aspect | Status | Notes |
|--------|--------|-------|
| **Journey** | 🔧 ✅ | Same as complete profile |
| **Blockers** | 🔧 Fixed | Was 404 |
| **Loading / Error** | ✅ | See §3 |
| **Missing** | ⚠️ | Auth `displayName` and marketplace `displayName` can diverge |

---

### 10. Sign Out

| Aspect | Status | Notes |
|--------|--------|-------|
| **Journey** | ✅ | Auth menu → `signOut()` → `/giris` |
| **Blockers** | — | None |
| **Loading** | ⚠️ | No explicit loading on sign-out |
| **Error** | ⚠️ | Sign-out failure not surfaced |
| **Missing** | — | — |

---

### 11. Sign Back In (`/giris`)

| Aspect | Status | Notes |
|--------|--------|-------|
| **Journey** | ✅ | Login → `?next=` redirect or `/dashboard` |
| **Blockers** | — | None |
| **Loading** | ✅ | Submit: "Giriş yapılıyor…" |
| **Error** | 🔧 ✅ | Toast + banner for `?error=auth_callback_failed` |
| **Empty** | N/A | — |
| **Missing** | ⚠️ | No "session expired" message variant |

---

## Blockers Summary

### Critical (fixed this review)

| # | Issue | Fix |
|---|-------|-----|
| 1 | `/ilan/[id]` only served static mocks → user-created listings 404 | Engine fallback via `aggregateToListingDetail` |
| 2 | `/ayarlar` protected but no page | Added settings page + `ProfileSettingsForm` |
| 3 | No profile completion flow | Auto-create `marketplace_profiles` on first visit |
| 4 | Post-create redirect to dashboard | Redirect to `/ilan/{slug}` + success toast |
| 5 | Browse pages missing header/footer | Wrapped in `SiteHeader` / `SiteFooter` |
| 6 | Browse hook errors not shown | Error banner + retry |
| 7 | Login ignored auth callback errors | Toast for `auth_callback_failed` |

### Remaining (non-blocking for beta)

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 1 | `/profil` in `PROTECTED_ROUTE_PREFIXES` but no page | Medium | Redirect to `/ayarlar` or add stub |
| 2 | Demo listing detail pages lack favorites | Low | Expected; document for testers |
| 3 | Memory persistence: data lost on refresh | High (dev) | Require Supabase for beta deploy |
| 4 | Email verification not enforced | Low | Keep advisory banner |
| 5 | Favorite toggle errors silent | Low | Add toast on failure |
| 6 | No onboarding after register | Low | Dashboard quick actions added |
| 7 | `metadataBase` unset (OG images) | Low | Set in `app/layout.tsx` |
| 8 | İlgileniyorum / Paylaş on detail are non-functional | Low | Hide or disable for beta |
| 9 | Company/owner info shows placeholders on engine listings | Low | Accept for beta |
| 10 | No "my listings" page | Medium | Dashboard could link to user's listings |
| 11 | Favorites not synced across tabs without refresh | Low | — |
| 12 | `/mesajlar`, `/bildirimler` protected but missing | Low | Out of beta scope |

---

## State Inventory

### Loading states

| Surface | Implementation |
|---------|----------------|
| Auth menu | Avatar pulse skeleton |
| Login / Register / Reset | Button disabled + label change |
| Profile settings | Full-page spinner |
| Browse / Search / Category | Center `Loader2`; load-more spinner |
| Favorites | Same as browse |
| Listing create | Suspense skeleton |
| Listing feed infinite | Initial + pagination spinners |

### Empty states

| Surface | Copy |
|---------|------|
| Browse (no results) | "Bu filtrelere uygun ilan bulunamadı." |
| Favorites (logged out) | "Favori ilanlarınızı görmek için giriş yapın." + CTA |
| Favorites (no items) | "Henüz favori ilanınız yok. İlanları keşfedip favorilere ekleyin." |
| Verify email (no param) | Generic "E-posta adresinize doğrulama bağlantısı gönderdik." |

### Error states

| Surface | Implementation |
|---------|----------------|
| Auth forms | Toast (signIn/signUp/reset/resend) |
| Auth callback | Toast + optional URL param |
| Profile settings | Toast on load/save fail |
| Browse / Search | Inline banner + "Tekrar Dene" |
| Favorites | Inline banner + "Tekrar Dene" |
| Listing detail | Next.js `notFound()` for missing listing |

### Missing states (gaps)

| Surface | Gap |
|---------|-----|
| Favorite toggle | No error toast |
| Sign out | No error handling |
| Publish | No distinct failure UI |
| Search | No empty-query guidance |
| Dashboard | No "first listing" celebration beyond redirect |
| Profile | No load-failure retry UI (toast only) |

---

## FTUE Improvements Applied (This Review)

1. **`app/ilan/[id]/page.tsx`** — Resolves engine listings by slug/UUID after mock lookup.
2. **`features/listings/mappers/listing-detail.mapper.ts`** — Maps aggregates to detail view; includes `listingId` for favorites.
3. **`app/ayarlar/page.tsx`** + **`ProfileSettingsForm`** — Profile edit with completeness score.
4. **`app/ilan/olustur/page.tsx`** — Post-publish redirect to listing; auth guard toast.
5. **`app/dashboard/page.tsx`** — Quick actions: İlan Oluştur, Keşfet, Profili Tamamla.
6. **`marketplace-browse-view.tsx`** — Header/footer, error + retry.
7. **`favorites-view.tsx`** — Header/footer, error + retry.
8. **`favorite-button.tsx`** — Login redirect preserves current path.
9. **`listing-header.tsx`** — Wired to `FavoriteButton` / `FavoriteService`.
10. **`login-form.tsx`** — Auth callback error handling.

---

## Environment Requirements for Beta

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Auth + persistence |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Auth + persistence |
| `NEXT_PUBLIC_PERSISTENCE_DRIVER=supabase` | Recommended | Default falls back to memory |
| Supabase migrations applied | Yes | Auth + marketplace tables |
| Email provider configured | Recommended | Verification emails |

**Without Supabase:** Auth may fail; browse shows seeded data but user actions do not persist.

---

## Test Plan (Manual)

- [ ] Register new account → receive verification email (if enabled)
- [ ] Complete profile at `/ayarlar` → save → see completeness increase
- [ ] Create listing → land on `/ilan/{slug}` → listing visible
- [ ] Browse `/kesfet` → open listing → favorite → see in `/favoriler`
- [ ] Search from header → results match query
- [ ] Sign out → sign in with `?next=/favoriler` → return to favorites
- [ ] Unverified user: dashboard banner visible, full access works
- [ ] Invalid listing slug → 404 page

---

## Beta Go / No-Go

| Criteria | Status |
|----------|--------|
| Register → login loop | ✅ Go |
| Profile edit | ✅ Go |
| Create → view listing | ✅ Go (with Supabase) |
| Browse / search | ✅ Go |
| Favorites (engine listings) | ✅ Go |
| Production persistence | ⚠️ Requires Supabase deploy |
| Demo content favorites | ⚠️ Known limitation |

**Recommendation:** Proceed to closed beta with Supabase-backed deployment. Document memory-mode limitations for local dev. Address `/profil` 404 and favorite error toasts in a follow-up polish sprint.

---

*Generated as part of Beta Readiness Review. No new features were added beyond FTUE fixes required to complete the core journey.*
