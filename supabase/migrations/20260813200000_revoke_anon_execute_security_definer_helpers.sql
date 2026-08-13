-- PROPOSAL — reviewed v2. Do not apply until approved.
-- Scope: close residual PUBLIC/anon EXECUTE on SECURITY DEFINER RLS helpers.
-- Does NOT change function bodies/signatures, RLS policies, or auth flows.
-- Does NOT add new service_role grants (not present in original helper/RPC migrations).
-- Does NOT ALTER search_path (already SET search_path = public at CREATE).
-- Does NOT include 20260810210000 channel lockdown DDL.
--
-- authenticated EXECUTE is retained: required for RLS policy evaluation and
-- (for contact RPCs) existing supabase.rpc call paths.

-- ---------------------------------------------------------------------------
-- Ecosystem RLS helpers (20260801120700): GRANT authenticated only; NO REVOKE PUBLIC
-- Default Postgres CREATE FUNCTION → EXECUTE for PUBLIC (includes anon).
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.is_company_member(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_listing_owner(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_listing(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_application(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_view_application_pii(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_profile_owner(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_access_document(UUID, UUID) FROM PUBLIC;

-- Defensive: clear any explicit anon grant (none in repo history; safe if absent)
REVOKE ALL ON FUNCTION public.is_company_member(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.is_listing_owner(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.can_manage_listing(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.can_manage_application(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.can_view_application_pii(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.is_profile_owner(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.can_access_document(UUID, UUID) FROM anon;

-- Reaffirm existing grants from 20260801120700 (REVOKE PUBLIC does not remove these)
GRANT EXECUTE ON FUNCTION public.is_company_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_listing_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_listing(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_application(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_application_pii(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_profile_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_document(UUID, UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- is_admin: already REVOKE PUBLIC + GRANT authenticated/service_role (20260802030000).
-- Only clear explicit anon if present. Do not re-grant service_role beyond history.
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM anon;

-- ---------------------------------------------------------------------------
-- Contact/PII RPCs: already REVOKE PUBLIC + GRANT authenticated
-- (20260810200000 / 20260811100000). Only clear explicit anon if present.
-- No new service_role grants (original migrations did not grant service_role).
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.marketplace_listing_owner_contact_phone(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.marketplace_listing_accepted_requester_contact_phone(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.marketplace_listing_accepted_requester_owner_identity(UUID) FROM anon;

-- Optional function from untracked 20260810210000 — no error if missing
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'marketplace_listing_owner_contact_channels'
      AND pg_get_function_identity_arguments(p.oid) = 'uuid'
  ) THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.marketplace_listing_owner_contact_channels(UUID) FROM anon';
  END IF;
END $$;
