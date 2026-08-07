-- Admin moderation: account status, reports, verifications, admin RLS

-- Extend auth profiles for account lifecycle
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('pending', 'active', 'suspended', 'deactivated', 'deleted')),
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS profiles_account_status_idx ON public.profiles (account_status);
CREATE INDEX IF NOT EXISTS profiles_last_active_at_idx ON public.profiles (last_active_at DESC NULLS LAST);

-- Sync email from auth.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name, email, last_active_at)
  VALUES (
    NEW.id,
    'member',
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Reports
CREATE TABLE IF NOT EXISTS public.marketplace_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('listing', 'user', 'company', 'message', 'profile')),
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'in_review', 'resolved', 'dismissed', 'deleted')),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS marketplace_reports_entity_idx
  ON public.marketplace_reports (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS marketplace_reports_status_idx
  ON public.marketplace_reports (status);
CREATE INDEX IF NOT EXISTS marketplace_reports_created_at_idx
  ON public.marketplace_reports (created_at DESC);

-- Verifications
CREATE TABLE IF NOT EXISTS public.marketplace_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.marketplace_companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'phone', 'identity', 'company', 'investor_accreditation')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'expired')),
  document_urls JSONB NOT NULL DEFAULT '[]',
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS marketplace_verifications_user_id_idx
  ON public.marketplace_verifications (user_id);
CREATE INDEX IF NOT EXISTS marketplace_verifications_status_idx
  ON public.marketplace_verifications (status);
CREATE INDEX IF NOT EXISTS marketplace_verifications_type_status_idx
  ON public.marketplace_verifications (type, status);

-- Admin helper
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND role = 'admin'
  );
$$;

-- RLS
ALTER TABLE public.marketplace_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_reports_reporter_insert" ON public.marketplace_reports;
CREATE POLICY "marketplace_reports_reporter_insert"
  ON public.marketplace_reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "marketplace_reports_reporter_select" ON public.marketplace_reports;
CREATE POLICY "marketplace_reports_reporter_select"
  ON public.marketplace_reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "marketplace_reports_admin_manage" ON public.marketplace_reports;
CREATE POLICY "marketplace_reports_admin_manage"
  ON public.marketplace_reports FOR UPDATE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "marketplace_verifications_owner_insert" ON public.marketplace_verifications;
CREATE POLICY "marketplace_verifications_owner_insert"
  ON public.marketplace_verifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "marketplace_verifications_owner_select" ON public.marketplace_verifications;
CREATE POLICY "marketplace_verifications_owner_select"
  ON public.marketplace_verifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "marketplace_verifications_admin_manage" ON public.marketplace_verifications;
CREATE POLICY "marketplace_verifications_admin_manage"
  ON public.marketplace_verifications FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin access to profiles (auth)
DROP POLICY IF EXISTS "profiles_admin_manage" ON public.profiles;
CREATE POLICY "profiles_admin_manage"
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin access to marketplace entities
DROP POLICY IF EXISTS "marketplace_profiles_admin_all" ON public.marketplace_profiles;
CREATE POLICY "marketplace_profiles_admin_all"
  ON public.marketplace_profiles FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "marketplace_companies_admin_all" ON public.marketplace_companies;
CREATE POLICY "marketplace_companies_admin_all"
  ON public.marketplace_companies FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "marketplace_listings_admin_all" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings_admin_all"
  ON public.marketplace_listings FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "marketplace_messages_admin_select" ON public.marketplace_messages;
CREATE POLICY "marketplace_messages_admin_select"
  ON public.marketplace_messages FOR SELECT TO authenticated
  USING (public.is_admin());

-- updated_at triggers
DO $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS marketplace_reports_updated_at ON public.marketplace_reports';
  EXECUTE 'CREATE TRIGGER marketplace_reports_updated_at BEFORE UPDATE ON public.marketplace_reports FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at()';
  EXECUTE 'DROP TRIGGER IF EXISTS marketplace_verifications_updated_at ON public.marketplace_verifications';
  EXECUTE 'CREATE TRIGGER marketplace_verifications_updated_at BEFORE UPDATE ON public.marketplace_verifications FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at()';
END $$;
