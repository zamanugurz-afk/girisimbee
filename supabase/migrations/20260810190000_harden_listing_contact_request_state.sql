-- Harden listing contact request state transitions + owner_user_id integrity.
-- Applies AFTER 20260810180000. Idempotent. No DROP TABLE / DROP COLUMN / data wipe.
-- Direct authenticated UPDATE of status is blocked; transitions go through SECURITY DEFINER RPCs.

-- ---------------------------------------------------------------------------
-- 1) Remove broad authenticated UPDATE policy (defense-in-depth with REVOKE)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS marketplace_listing_contact_requests_update_parties
  ON public.marketplace_listing_contact_requests;

REVOKE UPDATE ON TABLE public.marketplace_listing_contact_requests FROM authenticated;
REVOKE DELETE ON TABLE public.marketplace_listing_contact_requests FROM authenticated;

-- Keep SELECT + INSERT for authenticated (policies from base migration remain)

-- ---------------------------------------------------------------------------
-- 2) Tighten INSERT: owner_user_id must match listing.owner_id
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS marketplace_listing_contact_requests_insert_requester
  ON public.marketplace_listing_contact_requests;
CREATE POLICY marketplace_listing_contact_requests_insert_requester
  ON public.marketplace_listing_contact_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    requester_user_id = auth.uid()
    AND requester_user_id <> owner_user_id
    AND owner_user_id = (
      SELECT l.owner_id
      FROM public.marketplace_listings l
      WHERE l.id = listing_id
        AND l.deleted_at IS NULL
    )
  );

-- ---------------------------------------------------------------------------
-- 3) INSERT trigger — force owner_user_id from listing (cannot spoof)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_marketplace_listing_contact_requests_bi()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  listing_owner UUID;
BEGIN
  SELECT l.owner_id
  INTO listing_owner
  FROM public.marketplace_listings l
  WHERE l.id = NEW.listing_id
    AND l.deleted_at IS NULL;

  IF listing_owner IS NULL THEN
    RAISE EXCEPTION 'contact_request_listing_not_found'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Always bind owner to listing (ignore client-supplied spoof)
  NEW.owner_user_id := listing_owner;

  IF NEW.requester_user_id = listing_owner THEN
    RAISE EXCEPTION 'contact_request_self_not_allowed'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'contact_request_insert_must_be_pending'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS marketplace_listing_contact_requests_bi
  ON public.marketplace_listing_contact_requests;
CREATE TRIGGER marketplace_listing_contact_requests_bi
  BEFORE INSERT ON public.marketplace_listing_contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_marketplace_listing_contact_requests_bi();

-- ---------------------------------------------------------------------------
-- 4) UPDATE trigger — block direct status / identity mutation without RPC flag
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_marketplace_listing_contact_requests_bu()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Identity fields are immutable
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.listing_id IS DISTINCT FROM OLD.listing_id
     OR NEW.requester_user_id IS DISTINCT FROM OLD.requester_user_id
     OR NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id
     OR NEW.terms_version IS DISTINCT FROM OLD.terms_version
     OR NEW.terms_accepted_at IS DISTINCT FROM OLD.terms_accepted_at
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
  THEN
    RAISE EXCEPTION 'contact_request_identity_immutable'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Controlled transition path (SECURITY DEFINER RPCs set this GUC locally)
  IF current_setting('app.contact_request_transition', true) = '1' THEN
    RETURN NEW;
  END IF;

  -- Block any status or response-field mutation outside RPCs
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
     OR NEW.responded_at IS DISTINCT FROM OLD.responded_at
     OR NEW.accepted_at IS DISTINCT FROM OLD.accepted_at
     OR NEW.rejected_at IS DISTINCT FROM OLD.rejected_at
     OR NEW.cancelled_at IS DISTINCT FROM OLD.cancelled_at
     OR NEW.owner_terms_version IS DISTINCT FROM OLD.owner_terms_version
     OR NEW.owner_terms_accepted_at IS DISTINCT FROM OLD.owner_terms_accepted_at
     OR NEW.message IS DISTINCT FROM OLD.message
  THEN
    RAISE EXCEPTION 'contact_request_direct_update_forbidden'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS marketplace_listing_contact_requests_bu
  ON public.marketplace_listing_contact_requests;
CREATE TRIGGER marketplace_listing_contact_requests_bu
  BEFORE UPDATE ON public.marketplace_listing_contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_marketplace_listing_contact_requests_bu();

-- ---------------------------------------------------------------------------
-- 5) Transition RPCs (only allowed state changes)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.contact_request_cancel(p_request_id UUID)
RETURNS public.marketplace_listing_contact_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  row public.marketplace_listing_contact_requests;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'contact_request_unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT * INTO row
  FROM public.marketplace_listing_contact_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'contact_request_not_found' USING ERRCODE = 'no_data_found';
  END IF;

  IF row.requester_user_id <> uid THEN
    RAISE EXCEPTION 'contact_request_cancel_forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF row.status <> 'pending' THEN
    RAISE EXCEPTION 'contact_request_invalid_transition' USING ERRCODE = 'check_violation';
  END IF;

  PERFORM set_config('app.contact_request_transition', '1', true);

  UPDATE public.marketplace_listing_contact_requests
  SET
    status = 'cancelled',
    cancelled_at = now(),
    responded_at = now()
  WHERE id = p_request_id
  RETURNING * INTO row;

  RETURN row;
END;
$$;

CREATE OR REPLACE FUNCTION public.contact_request_reject(p_request_id UUID)
RETURNS public.marketplace_listing_contact_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  row public.marketplace_listing_contact_requests;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'contact_request_unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT * INTO row
  FROM public.marketplace_listing_contact_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'contact_request_not_found' USING ERRCODE = 'no_data_found';
  END IF;

  IF row.owner_user_id <> uid AND NOT public.is_admin(uid) THEN
    RAISE EXCEPTION 'contact_request_reject_forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF row.status <> 'pending' THEN
    RAISE EXCEPTION 'contact_request_invalid_transition' USING ERRCODE = 'check_violation';
  END IF;

  PERFORM set_config('app.contact_request_transition', '1', true);

  UPDATE public.marketplace_listing_contact_requests
  SET
    status = 'rejected',
    rejected_at = now(),
    responded_at = now()
  WHERE id = p_request_id
  RETURNING * INTO row;

  RETURN row;
END;
$$;

-- Accept opens messaging (conversation required) AND gates phone reveal for THIS
-- requester only (listing+requester scoped). Phone itself is not returned here.
DROP FUNCTION IF EXISTS public.contact_request_accept(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.contact_request_accept(
  p_request_id UUID,
  p_conversation_id UUID,
  p_owner_terms_version TEXT
)
RETURNS public.marketplace_listing_contact_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  row public.marketplace_listing_contact_requests;
  listing_owner UUID;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'contact_request_unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_conversation_id IS NULL OR p_owner_terms_version IS NULL OR length(trim(p_owner_terms_version)) = 0 THEN
    RAISE EXCEPTION 'contact_request_accept_params_required' USING ERRCODE = 'check_violation';
  END IF;

  SELECT * INTO row
  FROM public.marketplace_listing_contact_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'contact_request_not_found' USING ERRCODE = 'no_data_found';
  END IF;

  IF row.owner_user_id <> uid AND NOT public.is_admin(uid) THEN
    RAISE EXCEPTION 'contact_request_accept_forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF row.status <> 'pending' THEN
    RAISE EXCEPTION 'contact_request_invalid_transition' USING ERRCODE = 'check_violation';
  END IF;

  SELECT l.owner_id INTO listing_owner
  FROM public.marketplace_listings l
  WHERE l.id = row.listing_id
    AND l.deleted_at IS NULL
    AND l.status = 'published';

  IF listing_owner IS NULL OR listing_owner <> uid THEN
    IF NOT public.is_admin(uid) THEN
      RAISE EXCEPTION 'contact_request_listing_unavailable' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  PERFORM set_config('app.contact_request_transition', '1', true);

  UPDATE public.marketplace_listing_contact_requests
  SET
    status = 'accepted',
    accepted_at = now(),
    responded_at = now(),
    conversation_id = p_conversation_id,
    owner_terms_version = p_owner_terms_version,
    owner_terms_accepted_at = now()
  WHERE id = p_request_id
  RETURNING * INTO row;

  -- Link conversation back when column exists
  UPDATE public.marketplace_conversations
  SET contact_request_id = p_request_id
  WHERE id = p_conversation_id
    AND contact_request_id IS NULL;

  RETURN row;
END;
$$;

CREATE OR REPLACE FUNCTION public.contact_request_expire(p_request_id UUID)
RETURNS public.marketplace_listing_contact_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  row public.marketplace_listing_contact_requests;
  is_service BOOLEAN := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
BEGIN
  -- Only admin or service_role may expire (app currently uses read-time expiry;
  -- this RPC enables controlled DB expiry without opening client status writes).
  IF NOT is_service AND (uid IS NULL OR NOT public.is_admin(uid)) THEN
    RAISE EXCEPTION 'contact_request_expire_forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT * INTO row
  FROM public.marketplace_listing_contact_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'contact_request_not_found' USING ERRCODE = 'no_data_found';
  END IF;

  IF row.status <> 'pending' THEN
    RAISE EXCEPTION 'contact_request_invalid_transition' USING ERRCODE = 'check_violation';
  END IF;

  PERFORM set_config('app.contact_request_transition', '1', true);

  UPDATE public.marketplace_listing_contact_requests
  SET
    status = 'expired',
    responded_at = coalesce(row.responded_at, now())
  WHERE id = p_request_id
  RETURNING * INTO row;

  RETURN row;
END;
$$;

REVOKE ALL ON FUNCTION public.contact_request_cancel(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.contact_request_reject(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.contact_request_accept(UUID, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.contact_request_expire(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.contact_request_cancel(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.contact_request_reject(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.contact_request_accept(UUID, UUID, TEXT) TO authenticated;
-- expire: authenticated admins via is_admin check; also service_role
GRANT EXECUTE ON FUNCTION public.contact_request_expire(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.contact_request_expire(UUID) TO service_role;

REVOKE ALL ON FUNCTION public.trg_marketplace_listing_contact_requests_bi() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.trg_marketplace_listing_contact_requests_bu() FROM PUBLIC;
