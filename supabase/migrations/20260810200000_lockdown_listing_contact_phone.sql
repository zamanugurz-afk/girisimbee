-- Lock down marketplace_listings.contact_phone from anon/authenticated PostgREST.
-- RLS cannot hide columns: any role with SELECT on a readable row can otherwise read phone.
-- Column is retained; private owner/admin access is via SECURITY DEFINER RPC + service_role.
-- Idempotent. Does not delete or null existing phone data.

-- 1) Column-level SELECT revoke for public PostgREST roles
REVOKE SELECT (contact_phone) ON TABLE public.marketplace_listings FROM anon;
REVOKE SELECT (contact_phone) ON TABLE public.marketplace_listings FROM authenticated;

-- Trusted server / admin path (bypasses RLS; needs explicit column grant after revoke patterns)
GRANT SELECT (contact_phone) ON TABLE public.marketplace_listings TO service_role;

-- Owners must still be able to write phone on create/update (RLS owner_all remains)
GRANT INSERT (contact_phone) ON TABLE public.marketplace_listings TO authenticated;
GRANT UPDATE (contact_phone) ON TABLE public.marketplace_listings TO authenticated;

-- 2) Owner / admin / listing manager private read (authorization inside function)
CREATE OR REPLACE FUNCTION public.marketplace_listing_owner_contact_phone(p_listing_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  phone TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT (
    public.is_listing_owner(p_listing_id, auth.uid())
    OR public.can_manage_listing(p_listing_id, auth.uid())
    OR public.is_admin(auth.uid())
  ) THEN
    RETURN NULL;
  END IF;

  SELECT l.contact_phone
  INTO phone
  FROM public.marketplace_listings l
  WHERE l.id = p_listing_id
    AND l.deleted_at IS NULL;

  RETURN phone;
END;
$$;

REVOKE ALL ON FUNCTION public.marketplace_listing_owner_contact_phone(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.marketplace_listing_owner_contact_phone(UUID) TO authenticated;
-- anon intentionally has no EXECUTE

-- 3) Accepted requester phone reveal (listing + requester scoped — NOT global)
-- Only returns phone when marketplace_listing_contact_requests has status='accepted'
-- for (listing_id, auth.uid() as requester). Pending / rejected / other users → NULL.
CREATE OR REPLACE FUNCTION public.marketplace_listing_accepted_requester_contact_phone(
  p_listing_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  phone TEXT;
  allowed BOOLEAN;
BEGIN
  IF uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.marketplace_listing_contact_requests r
    WHERE r.listing_id = p_listing_id
      AND r.requester_user_id = uid
      AND r.status = 'accepted'
  )
  INTO allowed;

  IF NOT coalesce(allowed, false) THEN
    RETURN NULL;
  END IF;

  SELECT l.contact_phone
  INTO phone
  FROM public.marketplace_listings l
  WHERE l.id = p_listing_id
    AND l.deleted_at IS NULL;

  RETURN phone;
END;
$$;

REVOKE ALL ON FUNCTION public.marketplace_listing_accepted_requester_contact_phone(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.marketplace_listing_accepted_requester_contact_phone(UUID) TO authenticated;
-- anon intentionally has no EXECUTE
