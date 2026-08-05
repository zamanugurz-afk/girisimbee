-- MARKET reklam ödemesi: purpose enum + inquiry payment/publish link columns.

DO $$ BEGIN
  ALTER TYPE public.marketplace_payment_purpose ADD VALUE IF NOT EXISTS 'market_ad';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.marketplace_ad_inquiries
  ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.marketplace_payments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_session_id TEXT,
  ADD COLUMN IF NOT EXISTS market_item_id UUID REFERENCES public.marketplace_market_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS marketplace_ad_inquiries_payment_idx
  ON public.marketplace_ad_inquiries (payment_id)
  WHERE payment_id IS NOT NULL;
