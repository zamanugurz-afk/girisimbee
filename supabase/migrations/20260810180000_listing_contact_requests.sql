-- Secure listing contact requests + messaging gate (+ phone reveal after accept)
-- Additive / idempotent. Does not delete existing contact_phone data.
-- After accept: messaging opens for the pair; phone is revealed only to that requester.

CREATE TABLE IF NOT EXISTS public.marketplace_listing_contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  requester_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
  conversation_id UUID REFERENCES public.marketplace_conversations(id) ON DELETE SET NULL,
  terms_version TEXT NOT NULL,
  terms_accepted_at TIMESTAMPTZ NOT NULL,
  owner_terms_version TEXT,
  owner_terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT marketplace_listing_contact_requests_no_self
    CHECK (requester_user_id <> owner_user_id)
);

CREATE INDEX IF NOT EXISTS marketplace_listing_contact_requests_listing_idx
  ON public.marketplace_listing_contact_requests (listing_id, created_at DESC);

CREATE INDEX IF NOT EXISTS marketplace_listing_contact_requests_owner_idx
  ON public.marketplace_listing_contact_requests (owner_user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS marketplace_listing_contact_requests_requester_idx
  ON public.marketplace_listing_contact_requests (requester_user_id, status, created_at DESC);

-- One active pending/accepted request per requester+listing
CREATE UNIQUE INDEX IF NOT EXISTS marketplace_listing_contact_requests_active_uniq
  ON public.marketplace_listing_contact_requests (listing_id, requester_user_id)
  WHERE status IN ('pending', 'accepted');

ALTER TABLE public.marketplace_listing_contact_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_listing_contact_requests_select_own
  ON public.marketplace_listing_contact_requests;
CREATE POLICY marketplace_listing_contact_requests_select_own
  ON public.marketplace_listing_contact_requests
  FOR SELECT TO authenticated
  USING (
    requester_user_id = auth.uid()
    OR owner_user_id = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS marketplace_listing_contact_requests_insert_requester
  ON public.marketplace_listing_contact_requests;
CREATE POLICY marketplace_listing_contact_requests_insert_requester
  ON public.marketplace_listing_contact_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    requester_user_id = auth.uid()
    AND requester_user_id <> owner_user_id
  );

DROP POLICY IF EXISTS marketplace_listing_contact_requests_update_parties
  ON public.marketplace_listing_contact_requests;
CREATE POLICY marketplace_listing_contact_requests_update_parties
  ON public.marketplace_listing_contact_requests
  FOR UPDATE TO authenticated
  USING (
    requester_user_id = auth.uid()
    OR owner_user_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    requester_user_id = auth.uid()
    OR owner_user_id = auth.uid()
    OR public.is_admin()
  );

-- Optional link from conversation back to contact request (nullable, additive)
ALTER TABLE public.marketplace_conversations
  ADD COLUMN IF NOT EXISTS contact_request_id UUID
    REFERENCES public.marketplace_listing_contact_requests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS marketplace_conversations_contact_request_idx
  ON public.marketplace_conversations (contact_request_id)
  WHERE contact_request_id IS NOT NULL;
