-- P0: Matches (investments, co-founders) + Applications (jobs, franchise)

-- ── Matches: startup↔investor, profile↔profile (co-founders) ───────────────

CREATE TABLE IF NOT EXISTS public.marketplace_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key public.marketplace_module_key NOT NULL
    CHECK (module_key IN ('entrepreneurs', 'investors', 'founders')),
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  initiator_profile_id UUID NOT NULL REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  target_profile_id UUID NOT NULL REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  target_listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  status public.marketplace_match_status NOT NULL DEFAULT 'requested',
  score NUMERIC(5, 2),
  contacted_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_matches_no_self_match CHECK (initiator_profile_id <> target_profile_id)
);

CREATE INDEX IF NOT EXISTS marketplace_matches_listing_id_idx
  ON public.marketplace_matches (listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS marketplace_matches_initiator_idx
  ON public.marketplace_matches (initiator_profile_id);
CREATE INDEX IF NOT EXISTS marketplace_matches_target_idx
  ON public.marketplace_matches (target_profile_id);
CREATE INDEX IF NOT EXISTS marketplace_matches_status_idx
  ON public.marketplace_matches (status);
CREATE INDEX IF NOT EXISTS marketplace_matches_module_key_idx
  ON public.marketplace_matches (module_key);

-- Prevent duplicate active match requests
CREATE UNIQUE INDEX IF NOT EXISTS marketplace_matches_active_unique
  ON public.marketplace_matches (module_key, initiator_profile_id, target_profile_id, COALESCE(listing_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE status IN ('requested', 'accepted', 'contacted');

-- ── Applications: jobs + franchise ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key public.marketplace_module_key NOT NULL
    CHECK (module_key IN ('candidates', 'employers', 'franchise')),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  applicant_profile_id UUID NOT NULL REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  status public.marketplace_application_status NOT NULL DEFAULT 'submitted',
  cover_message TEXT,
  anonymous_snapshot JSONB NOT NULL DEFAULT '{}',
  unlocked_at TIMESTAMPTZ,
  payment_id UUID,
  contacted_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_applications_listing_applicant_unique
  ON public.marketplace_applications (listing_id, applicant_profile_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_applications_listing_id_idx
  ON public.marketplace_applications (listing_id);
CREATE INDEX IF NOT EXISTS marketplace_applications_applicant_idx
  ON public.marketplace_applications (applicant_profile_id);
CREATE INDEX IF NOT EXISTS marketplace_applications_status_idx
  ON public.marketplace_applications (status);
CREATE INDEX IF NOT EXISTS marketplace_applications_module_key_idx
  ON public.marketplace_applications (module_key);
CREATE INDEX IF NOT EXISTS marketplace_applications_payment_id_idx
  ON public.marketplace_applications (payment_id) WHERE payment_id IS NOT NULL;

-- ── updated_at triggers ─────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS marketplace_matches_updated_at ON public.marketplace_matches;
CREATE TRIGGER marketplace_matches_updated_at
  BEFORE UPDATE ON public.marketplace_matches
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();

DROP TRIGGER IF EXISTS marketplace_applications_updated_at ON public.marketplace_applications;
CREATE TRIGGER marketplace_applications_updated_at
  BEFORE UPDATE ON public.marketplace_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();
