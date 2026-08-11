-- Atomically create a listing DM + both participants under SECURITY DEFINER.
-- Fixes authenticated create path where INSERT…RETURNING fails SELECT RLS
-- (participant policies require membership that does not exist yet).
-- Idempotent.

CREATE OR REPLACE FUNCTION public.marketplace_create_listing_conversation(
  p_listing_id UUID,
  p_participant_ids UUID[],
  p_company_id UUID DEFAULT NULL,
  p_conversation_id UUID DEFAULT gen_random_uuid()
)
RETURNS public.marketplace_conversations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  is_service BOOLEAN := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
  listing_owner UUID;
  sorted_ids UUID[];
  conv public.marketplace_conversations;
  pid UUID;
BEGIN
  IF uid IS NULL AND NOT is_service THEN
    RAISE EXCEPTION 'conversation_unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_listing_id IS NULL OR p_participant_ids IS NULL OR cardinality(p_participant_ids) < 2 THEN
    RAISE EXCEPTION 'conversation_participants_required' USING ERRCODE = 'check_violation';
  END IF;

  SELECT ARRAY(SELECT DISTINCT unnest(p_participant_ids) ORDER BY 1) INTO sorted_ids;

  IF uid IS NOT NULL AND NOT (uid = ANY (sorted_ids)) THEN
    RAISE EXCEPTION 'conversation_caller_not_participant' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT l.owner_id
  INTO listing_owner
  FROM public.marketplace_listings l
  WHERE l.id = p_listing_id
    AND l.deleted_at IS NULL
    AND l.status = 'published';

  IF listing_owner IS NULL THEN
    RAISE EXCEPTION 'conversation_listing_unavailable' USING ERRCODE = 'check_violation';
  END IF;

  IF NOT is_service AND listing_owner <> uid AND NOT public.is_admin(uid) THEN
    -- Non-owner may create only when an accepted contact request already exists.
    IF NOT EXISTS (
      SELECT 1
      FROM public.marketplace_listing_contact_requests r
      WHERE r.listing_id = p_listing_id
        AND r.status = 'accepted'
        AND (
          (r.owner_user_id = listing_owner AND r.requester_user_id = uid)
          OR (r.owner_user_id = uid AND r.requester_user_id = listing_owner)
        )
    ) THEN
      RAISE EXCEPTION 'conversation_create_forbidden' USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  -- Prefer an existing open conversation with the exact participant set
  SELECT c.*
  INTO conv
  FROM public.marketplace_conversations c
  WHERE c.listing_id = p_listing_id
    AND c.deleted_at IS NULL
    AND c.status <> 'deleted'
    AND (
      SELECT COUNT(*)::int
      FROM public.marketplace_conversation_participants p
      WHERE p.conversation_id = c.id
        AND p.user_id = ANY (sorted_ids)
    ) = cardinality(sorted_ids)
    AND (
      SELECT COUNT(*)::int
      FROM public.marketplace_conversation_participants p
      WHERE p.conversation_id = c.id
    ) = cardinality(sorted_ids)
  ORDER BY c.created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN conv;
  END IF;

  INSERT INTO public.marketplace_conversations (
    id,
    listing_id,
    company_id,
    status
  )
  VALUES (
    COALESCE(p_conversation_id, gen_random_uuid()),
    p_listing_id,
    p_company_id,
    'open'
  )
  RETURNING * INTO conv;

  FOREACH pid IN ARRAY sorted_ids LOOP
    INSERT INTO public.marketplace_conversation_participants (conversation_id, user_id)
    VALUES (conv.id, pid)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  END LOOP;

  RETURN conv;
END;
$$;

REVOKE ALL ON FUNCTION public.marketplace_create_listing_conversation(UUID, UUID[], UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.marketplace_create_listing_conversation(UUID, UUID[], UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.marketplace_create_listing_conversation(UUID, UUID[], UUID, UUID) TO service_role;
