-- Append-only KVKK consent audit trail (documentary evidence)

CREATE TABLE IF NOT EXISTS public.marketplace_kvkk_consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'candidate_listing_publish',
  consent_version TEXT NOT NULL,
  consent_items JSONB NOT NULL,
  consents JSONB NOT NULL,
  all_accepted BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_kvkk_consent_records_all_accepted_true
    CHECK (all_accepted = true)
);

CREATE INDEX IF NOT EXISTS marketplace_kvkk_consent_records_user_id_idx
  ON public.marketplace_kvkk_consent_records (user_id);
CREATE INDEX IF NOT EXISTS marketplace_kvkk_consent_records_profile_id_idx
  ON public.marketplace_kvkk_consent_records (profile_id);
CREATE INDEX IF NOT EXISTS marketplace_kvkk_consent_records_listing_id_idx
  ON public.marketplace_kvkk_consent_records (listing_id)
  WHERE listing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS marketplace_kvkk_consent_records_consented_at_idx
  ON public.marketplace_kvkk_consent_records (consented_at DESC);

-- Immutable: block UPDATE and DELETE (even for privileged roles that bypass RLS)
CREATE OR REPLACE FUNCTION public.prevent_kvkk_consent_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'marketplace_kvkk_consent_records is append-only and cannot be modified or deleted';
END;
$$;

DROP TRIGGER IF EXISTS marketplace_kvkk_consent_records_no_update
  ON public.marketplace_kvkk_consent_records;
CREATE TRIGGER marketplace_kvkk_consent_records_no_update
  BEFORE UPDATE ON public.marketplace_kvkk_consent_records
  FOR EACH ROW EXECUTE FUNCTION public.prevent_kvkk_consent_mutation();

DROP TRIGGER IF EXISTS marketplace_kvkk_consent_records_no_delete
  ON public.marketplace_kvkk_consent_records;
CREATE TRIGGER marketplace_kvkk_consent_records_no_delete
  BEFORE DELETE ON public.marketplace_kvkk_consent_records
  FOR EACH ROW EXECUTE FUNCTION public.prevent_kvkk_consent_mutation();

ALTER TABLE public.marketplace_kvkk_consent_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_kvkk_consent_records_owner_insert
  ON public.marketplace_kvkk_consent_records;
CREATE POLICY marketplace_kvkk_consent_records_owner_insert
  ON public.marketplace_kvkk_consent_records
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_profile_owner(profile_id)
  );

DROP POLICY IF EXISTS marketplace_kvkk_consent_records_owner_select
  ON public.marketplace_kvkk_consent_records;
CREATE POLICY marketplace_kvkk_consent_records_owner_select
  ON public.marketplace_kvkk_consent_records
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_profile_owner(profile_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS marketplace_kvkk_consent_records_admin_select
  ON public.marketplace_kvkk_consent_records;
CREATE POLICY marketplace_kvkk_consent_records_admin_select
  ON public.marketplace_kvkk_consent_records
  FOR SELECT TO authenticated
  USING (public.is_admin());
