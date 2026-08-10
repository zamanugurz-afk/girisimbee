-- Contact-request disclosure audit + accepted-requester owner identity reveal.
-- Additive. Does not touch 10210000 channel lockdown.
-- Idempotent.

-- 1) Optional name parts on marketplace_profiles (reveal uses these + display_name)
ALTER TABLE public.marketplace_profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2) Disclosure grants — what was revealed after accept (auditable)
CREATE TABLE IF NOT EXISTS public.marketplace_contact_disclosure_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_request_id UUID NOT NULL
    REFERENCES public.marketplace_listing_contact_requests(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  disclosed_fields TEXT[] NOT NULL DEFAULT '{}',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_contact_disclosure_grants_fields_chk
    CHECK (cardinality(disclosed_fields) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_contact_disclosure_grants_request_uidx
  ON public.marketplace_contact_disclosure_grants (contact_request_id)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_contact_disclosure_grants_requester_idx
  ON public.marketplace_contact_disclosure_grants (requester_user_id, granted_at DESC);

CREATE INDEX IF NOT EXISTS marketplace_contact_disclosure_grants_listing_idx
  ON public.marketplace_contact_disclosure_grants (listing_id, granted_at DESC);

ALTER TABLE public.marketplace_contact_disclosure_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_contact_disclosure_grants_select_parties
  ON public.marketplace_contact_disclosure_grants;
CREATE POLICY marketplace_contact_disclosure_grants_select_parties
  ON public.marketplace_contact_disclosure_grants
  FOR SELECT TO authenticated
  USING (
    auth.uid() = owner_user_id
    OR auth.uid() = requester_user_id
    OR public.is_admin(auth.uid())
  );

-- 3) Auto-record disclosures when a request is accepted
CREATE OR REPLACE FUNCTION public.trg_contact_request_record_disclosures()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted'
     AND (OLD.status IS DISTINCT FROM 'accepted')
     AND NOT EXISTS (
       SELECT 1
       FROM public.marketplace_contact_disclosure_grants g
       WHERE g.contact_request_id = NEW.id
         AND g.revoked_at IS NULL
     ) THEN
    INSERT INTO public.marketplace_contact_disclosure_grants (
      contact_request_id,
      listing_id,
      owner_user_id,
      requester_user_id,
      disclosed_fields,
      granted_at
    )
    VALUES (
      NEW.id,
      NEW.listing_id,
      NEW.owner_user_id,
      NEW.requester_user_id,
      ARRAY['contact_phone', 'display_name', 'first_name', 'last_name']::text[],
      COALESCE(NEW.accepted_at, now())
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contact_request_record_disclosures
  ON public.marketplace_listing_contact_requests;
CREATE TRIGGER contact_request_record_disclosures
  AFTER UPDATE OF status ON public.marketplace_listing_contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_contact_request_record_disclosures();

-- Backfill grants for already-accepted rows
INSERT INTO public.marketplace_contact_disclosure_grants (
  contact_request_id,
  listing_id,
  owner_user_id,
  requester_user_id,
  disclosed_fields,
  granted_at
)
SELECT
  r.id,
  r.listing_id,
  r.owner_user_id,
  r.requester_user_id,
  ARRAY['contact_phone', 'display_name', 'first_name', 'last_name']::text[],
  COALESCE(r.accepted_at, r.responded_at, r.created_at)
FROM public.marketplace_listing_contact_requests r
WHERE r.status = 'accepted'
  AND NOT EXISTS (
    SELECT 1
    FROM public.marketplace_contact_disclosure_grants g
    WHERE g.contact_request_id = r.id
      AND g.revoked_at IS NULL
  );

-- 4) Accepted-requester owner identity (name) — not via public SELECT *
CREATE OR REPLACE FUNCTION public.marketplace_listing_accepted_requester_owner_identity(
  p_listing_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  allowed BOOLEAN;
  result JSONB;
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

  SELECT jsonb_build_object(
    'displayName', NULLIF(trim(p.display_name), ''),
    'firstName', NULLIF(trim(p.first_name), ''),
    'lastName', NULLIF(trim(p.last_name), ''),
    'fullName', NULLIF(
      trim(
        concat_ws(
          ' ',
          NULLIF(trim(p.first_name), ''),
          NULLIF(trim(p.last_name), '')
        )
      ),
      ''
    )
  )
  INTO result
  FROM public.marketplace_listings l
  JOIN public.marketplace_profiles p
    ON p.user_id = l.owner_id
   AND p.deleted_at IS NULL
  WHERE l.id = p_listing_id
    AND l.deleted_at IS NULL
  LIMIT 1;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.marketplace_listing_accepted_requester_owner_identity(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.marketplace_listing_accepted_requester_owner_identity(UUID) TO authenticated;
