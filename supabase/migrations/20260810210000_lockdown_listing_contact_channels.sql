-- Lock down marketplace_listings contact_whatsapp + contact_email from anon/authenticated PostgREST.
-- Extends phone lockdown (20260810200000). Does not rewrite that migration.
-- Idempotent. Does not delete existing contact channel data.

-- 1) Column-level SELECT revoke for public PostgREST roles
REVOKE SELECT (contact_whatsapp) ON TABLE public.marketplace_listings FROM anon;
REVOKE SELECT (contact_whatsapp) ON TABLE public.marketplace_listings FROM authenticated;
REVOKE SELECT (contact_email) ON TABLE public.marketplace_listings FROM anon;
REVOKE SELECT (contact_email) ON TABLE public.marketplace_listings FROM authenticated;

GRANT SELECT (contact_whatsapp) ON TABLE public.marketplace_listings TO service_role;
GRANT SELECT (contact_email) ON TABLE public.marketplace_listings TO service_role;

-- Owners must still write channels on create/update (RLS owner_all remains)
GRANT INSERT (contact_whatsapp) ON TABLE public.marketplace_listings TO authenticated;
GRANT UPDATE (contact_whatsapp) ON TABLE public.marketplace_listings TO authenticated;
GRANT INSERT (contact_email) ON TABLE public.marketplace_listings TO authenticated;
GRANT UPDATE (contact_email) ON TABLE public.marketplace_listings TO authenticated;

-- 2) Unified owner/admin private read for all direct contact channels
CREATE OR REPLACE FUNCTION public.marketplace_listing_owner_contact_channels(p_listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  channels JSONB;
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

  SELECT jsonb_build_object(
    'contact_phone', l.contact_phone,
    'contact_whatsapp', l.contact_whatsapp,
    'contact_email', l.contact_email
  )
  INTO channels
  FROM public.marketplace_listings l
  WHERE l.id = p_listing_id
    AND l.deleted_at IS NULL;

  RETURN channels;
END;
$$;

REVOKE ALL ON FUNCTION public.marketplace_listing_owner_contact_channels(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.marketplace_listing_owner_contact_channels(UUID) TO authenticated;
-- anon intentionally has no EXECUTE
