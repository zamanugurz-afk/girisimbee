-- Destek / genel iletişim talepleri (footer → /destek form → admin inbox).
-- Public submit via service role API; admin via is_admin().

CREATE TABLE IF NOT EXISTS public.marketplace_support_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL DEFAULT 'support'
    CHECK (channel IN ('support', 'info')),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewing', 'resolved', 'closed')),
  subject TEXT NOT NULL DEFAULT 'genel'
    CHECK (subject IN ('genel', 'teknik', 'hesap', 'odeme', 'diger')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  admin_note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketplace_support_inquiries_status_idx
  ON public.marketplace_support_inquiries (status, created_at DESC);

CREATE INDEX IF NOT EXISTS marketplace_support_inquiries_channel_idx
  ON public.marketplace_support_inquiries (channel, created_at DESC);

COMMENT ON TABLE public.marketplace_support_inquiries IS
  'Public Destek / Bilgi contact form submissions for admin inbox.';

ALTER TABLE public.marketplace_support_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_support_inquiries_admin_select ON public.marketplace_support_inquiries;
CREATE POLICY marketplace_support_inquiries_admin_select
  ON public.marketplace_support_inquiries FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS marketplace_support_inquiries_admin_update ON public.marketplace_support_inquiries;
CREATE POLICY marketplace_support_inquiries_admin_update
  ON public.marketplace_support_inquiries FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS marketplace_support_inquiries_admin_all ON public.marketplace_support_inquiries;
CREATE POLICY marketplace_support_inquiries_admin_all
  ON public.marketplace_support_inquiries FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
