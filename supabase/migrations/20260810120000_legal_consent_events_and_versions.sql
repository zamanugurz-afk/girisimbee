-- Legal consent events + document version columns on user_consents
-- Minimal additive migration — does not rewrite existing consent tables.

ALTER TABLE public.user_consents
  ADD COLUMN IF NOT EXISTS terms_version TEXT,
  ADD COLUMN IF NOT EXISTS privacy_version TEXT,
  ADD COLUMN IF NOT EXISTS kvkk_ack_version TEXT,
  ADD COLUMN IF NOT EXISTS cookies_version TEXT,
  ADD COLUMN IF NOT EXISTS marketing_withdrawn_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sms_withdrawn_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_withdrawn_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.marketplace_legal_consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('accepted', 'withdrawn', 'acknowledged')),
  document_key TEXT,
  version TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'web',
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketplace_legal_consent_events_user_id_idx
  ON public.marketplace_legal_consent_events (user_id);

CREATE INDEX IF NOT EXISTS marketplace_legal_consent_events_type_idx
  ON public.marketplace_legal_consent_events (consent_type, created_at DESC);

ALTER TABLE public.marketplace_legal_consent_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_legal_consent_events_owner_select
  ON public.marketplace_legal_consent_events;
CREATE POLICY marketplace_legal_consent_events_owner_select
  ON public.marketplace_legal_consent_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS marketplace_legal_consent_events_owner_insert
  ON public.marketplace_legal_consent_events;
CREATE POLICY marketplace_legal_consent_events_owner_insert
  ON public.marketplace_legal_consent_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Defense-in-depth table privileges (match user_consents append-only standard)
REVOKE ALL ON TABLE public.marketplace_legal_consent_events FROM PUBLIC;
REVOKE ALL ON TABLE public.marketplace_legal_consent_events FROM anon;
GRANT SELECT, INSERT ON TABLE public.marketplace_legal_consent_events TO authenticated;
GRANT ALL ON TABLE public.marketplace_legal_consent_events TO service_role;
