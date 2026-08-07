-- Listing complaints (şikayet) — public submit + admin moderation.
-- Apply in Supabase SQL Editor when approved.

CREATE TABLE IF NOT EXISTS public.marketplace_listing_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketplace_listing_complaints_listing_idx
  ON public.marketplace_listing_complaints (listing_id);

CREATE INDEX IF NOT EXISTS marketplace_listing_complaints_status_idx
  ON public.marketplace_listing_complaints (status, created_at DESC);

ALTER TABLE public.marketplace_listing_complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_listing_complaints_insert_auth ON public.marketplace_listing_complaints;
CREATE POLICY marketplace_listing_complaints_insert_auth
  ON public.marketplace_listing_complaints FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id OR reporter_id IS NULL);

DROP POLICY IF EXISTS marketplace_listing_complaints_select_own ON public.marketplace_listing_complaints;
CREATE POLICY marketplace_listing_complaints_select_own
  ON public.marketplace_listing_complaints FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR public.is_admin());

DROP POLICY IF EXISTS marketplace_listing_complaints_admin_all ON public.marketplace_listing_complaints;
CREATE POLICY marketplace_listing_complaints_admin_all
  ON public.marketplace_listing_complaints FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
