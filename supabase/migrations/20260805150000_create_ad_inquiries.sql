-- Reklam & işbirliği talepleri (MARKET 5.000 TL + özel ortaklık).
-- Public submit via service role API; admin read/update via is_admin().

CREATE TABLE IF NOT EXISTS public.marketplace_ad_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL
    CHECK (kind IN ('market_ad', 'partnership')),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewing', 'accepted', 'rejected', 'closed')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  -- MARKET self-serve ad fields (kind = market_ad)
  title TEXT,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  cta_label TEXT DEFAULT 'İncele',
  price_tl INTEGER,
  -- Custom partnership fields (kind = partnership)
  partnership_type TEXT,
  message TEXT,
  admin_note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketplace_ad_inquiries_status_idx
  ON public.marketplace_ad_inquiries (status, created_at DESC);

CREATE INDEX IF NOT EXISTS marketplace_ad_inquiries_kind_idx
  ON public.marketplace_ad_inquiries (kind, created_at DESC);

COMMENT ON TABLE public.marketplace_ad_inquiries IS
  'Public MARKET ad (fixed 5000 TL) and partnership inquiries for admin inbox.';

ALTER TABLE public.marketplace_ad_inquiries ENABLE ROW LEVEL SECURITY;

-- No direct anon/authenticated client writes — API uses service role.
-- Admins can read/update via is_admin().

DROP POLICY IF EXISTS marketplace_ad_inquiries_admin_select ON public.marketplace_ad_inquiries;
CREATE POLICY marketplace_ad_inquiries_admin_select
  ON public.marketplace_ad_inquiries FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS marketplace_ad_inquiries_admin_update ON public.marketplace_ad_inquiries;
CREATE POLICY marketplace_ad_inquiries_admin_update
  ON public.marketplace_ad_inquiries FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS marketplace_ad_inquiries_admin_all ON public.marketplace_ad_inquiries;
CREATE POLICY marketplace_ad_inquiries_admin_all
  ON public.marketplace_ad_inquiries FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
