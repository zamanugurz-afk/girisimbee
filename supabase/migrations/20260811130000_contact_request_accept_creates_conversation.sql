-- Accept contact request and create the listing DM in one SECURITY DEFINER RPC.
-- Client-side INSERT into marketplace_conversations fails under SELECT RLS
-- (and may fail further if service-role env is misconfigured on the host).
-- Idempotent.

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
  listing_company UUID;
  conv_id UUID := p_conversation_id;
  existing_id UUID;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'contact_request_unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_owner_terms_version IS NULL OR length(trim(p_owner_terms_version)) = 0 THEN
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

  SELECT l.owner_id, l.company_id
  INTO listing_owner, listing_company
  FROM public.marketplace_listings l
  WHERE l.id = row.listing_id
    AND l.deleted_at IS NULL
    AND l.status = 'published';

  IF listing_owner IS NULL OR listing_owner <> uid THEN
    IF NOT public.is_admin(uid) THEN
      RAISE EXCEPTION 'contact_request_listing_unavailable' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- Prefer an existing open DM between these two on this listing
  IF conv_id IS NULL THEN
    SELECT c.id
    INTO existing_id
    FROM public.marketplace_conversations c
    WHERE c.listing_id = row.listing_id
      AND c.deleted_at IS NULL
      AND c.status <> 'deleted'
      AND EXISTS (
        SELECT 1 FROM public.marketplace_conversation_participants p
        WHERE p.conversation_id = c.id AND p.user_id = row.owner_user_id
      )
      AND EXISTS (
        SELECT 1 FROM public.marketplace_conversation_participants p
        WHERE p.conversation_id = c.id AND p.user_id = row.requester_user_id
      )
    ORDER BY c.created_at DESC
    LIMIT 1;

    conv_id := existing_id;
  END IF;

  IF conv_id IS NULL THEN
    INSERT INTO public.marketplace_conversations (
      listing_id,
      company_id,
      status,
      contact_request_id
    )
    VALUES (
      row.listing_id,
      listing_company,
      'open',
      p_request_id
    )
    RETURNING id INTO conv_id;

    INSERT INTO public.marketplace_conversation_participants (conversation_id, user_id)
    VALUES (conv_id, row.owner_user_id)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;

    INSERT INTO public.marketplace_conversation_participants (conversation_id, user_id)
    VALUES (conv_id, row.requester_user_id)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  ELSE
    -- Ensure both participants exist on a pre-supplied conversation
    INSERT INTO public.marketplace_conversation_participants (conversation_id, user_id)
    VALUES (conv_id, row.owner_user_id)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;

    INSERT INTO public.marketplace_conversation_participants (conversation_id, user_id)
    VALUES (conv_id, row.requester_user_id)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;

    UPDATE public.marketplace_conversations
    SET contact_request_id = COALESCE(contact_request_id, p_request_id)
    WHERE id = conv_id;
  END IF;

  PERFORM set_config('app.contact_request_transition', '1', true);

  UPDATE public.marketplace_listing_contact_requests
  SET
    status = 'accepted',
    accepted_at = now(),
    responded_at = now(),
    conversation_id = conv_id,
    owner_terms_version = p_owner_terms_version,
    owner_terms_accepted_at = now()
  WHERE id = p_request_id
  RETURNING * INTO row;

  RETURN row;
END;
$$;

REVOKE ALL ON FUNCTION public.contact_request_accept(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.contact_request_accept(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.contact_request_accept(UUID, UUID, TEXT) TO service_role;
