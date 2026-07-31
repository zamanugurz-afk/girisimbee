-- P0: RLS helper functions for ecosystem tables

-- Resolve marketplace profile id for current auth user
CREATE OR REPLACE FUNCTION public.marketplace_profile_id_for_user(uid UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.marketplace_profiles
  WHERE user_id = uid AND deleted_at IS NULL
  LIMIT 1;
$$;

-- Check company membership (owner or member)
CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id UUID, uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.marketplace_companies c
    WHERE c.id = p_company_id
      AND c.deleted_at IS NULL
      AND c.owner_id = uid
  )
  OR EXISTS (
    SELECT 1 FROM public.marketplace_company_members m
    WHERE m.company_id = p_company_id AND m.user_id = uid
  );
$$;

-- Listing owner check
CREATE OR REPLACE FUNCTION public.is_listing_owner(p_listing_id UUID, uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.marketplace_listings l
    WHERE l.id = p_listing_id
      AND l.deleted_at IS NULL
      AND l.owner_id = uid
  );
$$;

-- Listing owner or company member
CREATE OR REPLACE FUNCTION public.can_manage_listing(p_listing_id UUID, uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.marketplace_listings l
    WHERE l.id = p_listing_id
      AND l.deleted_at IS NULL
      AND (
        l.owner_id = uid
        OR (l.company_id IS NOT NULL AND public.is_company_member(l.company_id, uid))
      )
  );
$$;

-- Match participant check
CREATE OR REPLACE FUNCTION public.is_match_participant(p_match_id UUID, uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.marketplace_matches m
    JOIN public.marketplace_profiles p ON p.id IN (m.initiator_profile_id, m.target_profile_id)
    WHERE m.id = p_match_id
      AND p.user_id = uid
      AND p.deleted_at IS NULL
  );
$$;

-- Application: applicant owns the application
CREATE OR REPLACE FUNCTION public.is_application_applicant(p_application_id UUID, uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.marketplace_applications a
    JOIN public.marketplace_profiles p ON p.id = a.applicant_profile_id
    WHERE a.id = p_application_id
      AND p.user_id = uid
      AND a.deleted_at IS NULL
      AND p.deleted_at IS NULL
  );
$$;

-- Application: listing owner or company member can manage
CREATE OR REPLACE FUNCTION public.can_manage_application(p_application_id UUID, uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.marketplace_applications a
    JOIN public.marketplace_listings l ON l.id = a.listing_id
    WHERE a.id = p_application_id
      AND a.deleted_at IS NULL
      AND l.deleted_at IS NULL
      AND public.can_manage_listing(l.id, uid)
  );
$$;

-- PII unlock: employer purchased unlock for anonymous job application
CREATE OR REPLACE FUNCTION public.can_view_application_pii(p_application_id UUID, uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_application_applicant(p_application_id, uid)
    OR (
      public.can_manage_application(p_application_id, uid)
      AND EXISTS (
        SELECT 1 FROM public.marketplace_applications a
        WHERE a.id = p_application_id
          AND (
            a.unlocked_at IS NOT NULL
            OR a.module_key <> 'employers'
          )
      )
    )
    OR public.is_admin(uid);
$$;

-- Profile owner check
CREATE OR REPLACE FUNCTION public.is_profile_owner(p_profile_id UUID, uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.marketplace_profiles p
    WHERE p.id = p_profile_id AND p.user_id = uid AND p.deleted_at IS NULL
  );
$$;

-- Document access
CREATE OR REPLACE FUNCTION public.can_access_document(p_document_id UUID, uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.marketplace_documents d
    JOIN public.marketplace_profiles p ON p.id = d.owner_profile_id
    WHERE d.id = p_document_id
      AND d.deleted_at IS NULL
      AND (
        d.visibility = 'public'
        OR p.user_id = uid
        OR public.is_admin(uid)
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.marketplace_profile_id_for_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_listing_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_listing(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_match_participant(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_application_applicant(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_application(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_application_pii(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_profile_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_document(UUID, UUID) TO authenticated;
