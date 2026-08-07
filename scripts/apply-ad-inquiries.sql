-- ============================================================
-- Girişimco: Reklam & İşbirliği tabloları (tek seferde çalıştır)
-- Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1) Ana talep tablosu
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
  title TEXT,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  cta_label TEXT DEFAULT 'İncele',
  price_tl INTEGER,
  partnership_type TEXT,
  message TEXT,
  admin_note TEXT,
  payment_id UUID,
  payment_session_id TEXT,
  market_item_id UUID,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Eksik kolonlar (eski kısmi kurulum varsa)
ALTER TABLE public.marketplace_ad_inquiries
  ADD COLUMN IF NOT EXISTS payment_id UUID,
  ADD COLUMN IF NOT EXISTS payment_session_id TEXT,
  ADD COLUMN IF NOT EXISTS market_item_id UUID;

-- FK'ler (bağlı tablolar varsa)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_payments') THEN
    BEGIN
      ALTER TABLE public.marketplace_ad_inquiries
        ADD CONSTRAINT marketplace_ad_inquiries_payment_id_fkey
        FOREIGN KEY (payment_id) REFERENCES public.marketplace_payments(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_market_items') THEN
    BEGIN
      ALTER TABLE public.marketplace_ad_inquiries
        ADD CONSTRAINT marketplace_ad_inquiries_market_item_id_fkey
        FOREIGN KEY (market_item_id) REFERENCES public.marketplace_market_items(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS marketplace_ad_inquiries_status_idx
  ON public.marketplace_ad_inquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_ad_inquiries_kind_idx
  ON public.marketplace_ad_inquiries (kind, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_ad_inquiries_payment_idx
  ON public.marketplace_ad_inquiries (payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS marketplace_ad_inquiries_partnership_new_idx
  ON public.marketplace_ad_inquiries (created_at DESC)
  WHERE kind = 'partnership' AND status = 'new';

COMMENT ON TABLE public.marketplace_ad_inquiries IS
  'MARKET reklamı (5.000 TL) + özel işbirliği talepleri — admin /admin/reklam';

ALTER TABLE public.marketplace_ad_inquiries ENABLE ROW LEVEL SECURITY;

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

-- updated_at trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_marketplace_updated_at') THEN
    DROP TRIGGER IF EXISTS trg_marketplace_ad_inquiries_updated_at
      ON public.marketplace_ad_inquiries;
    CREATE TRIGGER trg_marketplace_ad_inquiries_updated_at
      BEFORE UPDATE ON public.marketplace_ad_inquiries
      FOR EACH ROW
      EXECUTE FUNCTION public.set_marketplace_updated_at();
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Ödeme purpose enum (MARKET 5.000 TL)
DO $$ BEGIN
  ALTER TYPE public.marketplace_payment_purpose ADD VALUE IF NOT EXISTS 'market_ad';
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Doğrulama
SELECT 'marketplace_ad_inquiries OK' AS status, COUNT(*) AS rows
FROM public.marketplace_ad_inquiries;
