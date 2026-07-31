-- P0: Payment records (iyzico initial provider)

CREATE TABLE IF NOT EXISTS public.marketplace_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.marketplace_companies(id) ON DELETE SET NULL,
  package_slug TEXT REFERENCES public.marketplace_listing_package_catalog(slug) ON DELETE SET NULL,
  amount_cents INT NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'TRY',
  provider public.marketplace_payment_provider NOT NULL DEFAULT 'iyzico',
  provider_ref TEXT,
  provider_session_id TEXT,
  status public.marketplace_payment_status NOT NULL DEFAULT 'pending',
  purpose public.marketplace_payment_purpose NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketplace_payments_user_id_idx
  ON public.marketplace_payments (user_id);
CREATE INDEX IF NOT EXISTS marketplace_payments_company_id_idx
  ON public.marketplace_payments (company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS marketplace_payments_status_idx
  ON public.marketplace_payments (status);
CREATE INDEX IF NOT EXISTS marketplace_payments_provider_ref_idx
  ON public.marketplace_payments (provider, provider_ref) WHERE provider_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS marketplace_payments_entity_idx
  ON public.marketplace_payments (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS marketplace_payments_purpose_idx
  ON public.marketplace_payments (purpose);

-- Link applications to payments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_applications_payment_id_fkey'
  ) THEN
    ALTER TABLE public.marketplace_applications
      ADD CONSTRAINT marketplace_applications_payment_id_fkey
      FOREIGN KEY (payment_id) REFERENCES public.marketplace_payments(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DROP TRIGGER IF EXISTS marketplace_payments_updated_at ON public.marketplace_payments;
CREATE TRIGGER marketplace_payments_updated_at
  BEFORE UPDATE ON public.marketplace_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();
