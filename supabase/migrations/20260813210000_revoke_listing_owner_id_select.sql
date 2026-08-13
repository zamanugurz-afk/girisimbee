-- Lock down marketplace_listings.owner_id from anon/authenticated PostgREST SELECT.
-- Mirrors contact_phone column revoke pattern.
--
-- WHY:
--   listingId → owner_id → /uye/[userId] enumeration bypassed app-layer redaction.
--
-- EFFECT:
--   anon/authenticated cannot project or filter by owner_id via PostgREST.
--   service_role retains SELECT for server-side hydration (listing repository enrichOwnerId,
--   publish-guard ownership checks, admin tools).
--
-- APP REQUIREMENTS (must ship before/with apply):
--   - LISTING_SAFE_SELECT omits owner_id
--   - getServerContainer enrichListingOwnerId + REQUIRED service_role reader
--     (SUPABASE_SERVICE_ROLE_KEY; no authenticated-client fallback)
--   - Owner-scoped client lists use GET /api/account/listings (not direct .eq('owner_id'))
--
-- DOES NOT:
--   - Change RLS policies (no loosening)
--   - Touch custom_fields
--   - Alter accepted-requester identity/phone RPCs (they join owner_id inside SECURITY DEFINER)
--
-- NOT APPLIED by the agent — apply manually in the target environment after code deploy.

REVOKE SELECT (owner_id) ON TABLE public.marketplace_listings FROM anon;
REVOKE SELECT (owner_id) ON TABLE public.marketplace_listings FROM authenticated;

GRANT SELECT (owner_id) ON TABLE public.marketplace_listings TO service_role;

-- Owners still create/update rows with owner_id in INSERT/UPDATE payloads.
GRANT INSERT (owner_id) ON TABLE public.marketplace_listings TO authenticated;
GRANT UPDATE (owner_id) ON TABLE public.marketplace_listings TO authenticated;
