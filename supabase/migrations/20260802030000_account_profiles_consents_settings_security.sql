-- =============================================================================
-- AUTH PHASE 1 – STEP 3 + STEP 4 (HARDENING V2)
-- Account structures + RLS
-- Canonical roles (only): user | admin | super_admin
--
-- Security invariants:
-- 1) New users ALWAYS get role = 'user' (ignore client/OAuth metadata roles).
-- 2) Non-admin cannot change profiles.role (BEFORE UPDATE trigger).
-- 3) Legacy moderator → admin (aligns with LEGACY_ROLE_MAP); member/verified/company → user.
-- 4) user_security_logs append-only for authenticated users (no UPDATE/DELETE).
-- 5) user_consents append-only for authenticated users (no UPDATE/DELETE).
-- 6) profiles SELECT is own+admin only (marketplace public data stays on marketplace_profiles).
--
-- Not applied to production yet — edit-in-place is intentional (no repair needed).
-- DO NOT push to remote Supabase until approved.
-- =============================================================================

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Existing table: public.profiles (id PK = auth.users.id, …)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE public.profiles
SET user_id = id
WHERE user_id IS NULL;

UPDATE public.profiles
SET status = COALESCE(status, account_status, 'active')
WHERE status IS NULL;

UPDATE public.profiles
SET last_seen_at = COALESCE(last_seen_at, last_active_at)
WHERE last_seen_at IS NULL
  AND last_active_at IS NOT NULL;

-- Map legacy roles → canonical three-role model
-- Align with app LEGACY_ROLE_MAP: moderator → admin (not user).
UPDATE public.profiles
SET role = CASE
  WHEN lower(trim(role)) IN ('admin') THEN 'admin'
  WHEN lower(trim(role)) IN ('super_admin', 'superadmin', 'super-admin') THEN 'super_admin'
  WHEN lower(trim(role)) IN ('moderator') THEN 'admin'
  WHEN lower(trim(role)) IN ('user', 'member', 'verified', 'company') THEN 'user'
  WHEN role IS NULL OR btrim(role) = '' THEN 'user'
  ELSE 'user'
END
WHERE role IS NULL
   OR lower(trim(role)) NOT IN ('user', 'admin', 'super_admin');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_status_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_status_check
      CHECK (status IS NULL OR status IN ('pending', 'active', 'suspended', 'deactivated', 'deleted'));
  END IF;
END $$;

-- Replace any legacy role check with user|admin|super_admin
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    WHERE c.conrelid = 'public.profiles'::regclass
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IS NULL OR role IN ('user', 'admin', 'super_admin'));
  END IF;
END $$;

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'user';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_uidx
  ON public.profiles (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_uidx
  ON public.profiles (username)
  WHERE username IS NOT NULL AND COALESCE(is_deleted, false) = false;

CREATE INDEX IF NOT EXISTS profiles_status_idx
  ON public.profiles (status);

CREATE INDEX IF NOT EXISTS profiles_role_idx
  ON public.profiles (role);

CREATE INDEX IF NOT EXISTS profiles_last_login_at_idx
  ON public.profiles (last_login_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS profiles_last_seen_at_idx
  ON public.profiles (last_seen_at DESC NULLS LAST);

-- ── user_settings (before handle_new_user so signup can seed a row) ──────────

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  favorite_notifications BOOLEAN NOT NULL DEFAULT true,
  system_notifications BOOLEAN NOT NULL DEFAULT true,
  profile_visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (profile_visibility IN ('public', 'connections', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_settings_user_id_idx
  ON public.user_settings (user_id);

CREATE OR REPLACE FUNCTION public.set_user_settings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_settings_updated_at ON public.user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_user_settings_updated_at();

-- =============================================================================
-- Helpers (is_admin first — used by role immutability trigger)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = uid
      AND role IN ('admin', 'super_admin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.is_account_profile_owner(p_profile_id UUID, uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND p_profile_id = auth.uid()
    AND uid = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.is_account_profile_owner(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_account_profile_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_account_profile_owner(UUID, UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(auth.role(), '') = 'service_role';
$$;

REVOKE ALL ON FUNCTION public.is_service_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_service_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_service_role() TO service_role;

-- Signup hook: ALWAYS role = user. Never trust raw_user_meta_data.role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id,
    role,
    display_name,
    first_name,
    last_name,
    username,
    email,
    phone,
    status,
    account_status,
    is_email_verified,
    is_phone_verified,
    is_deleted,
    last_seen_at,
    last_active_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.id,
    'user',
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NULLIF(
        trim(
          concat_ws(
            ' ',
            NEW.raw_user_meta_data->>'first_name',
            NEW.raw_user_meta_data->>'last_name'
          )
        ),
        ''
      ),
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NULLIF(lower(NEW.raw_user_meta_data->>'username'), ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'active',
    'active',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    false,
    false,
    now(),
    now(),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    user_id = COALESCE(public.profiles.user_id, EXCLUDED.user_id),
    first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
    last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name),
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    is_email_verified = public.profiles.is_email_verified OR EXCLUDED.is_email_verified,
    last_active_at = COALESCE(public.profiles.last_active_at, EXCLUDED.last_active_at),
    last_seen_at = COALESCE(public.profiles.last_seen_at, EXCLUDED.last_seen_at),
    updated_at = now();
    -- role intentionally NOT updated on conflict (preserve admin/super_admin)

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
DO $$
BEGIN
  GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Role write guards: non-admin cannot escalate/downgrade roles via client.
CREATE OR REPLACE FUNCTION public.enforce_profiles_role_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS NULL OR btrim(NEW.role) = '' THEN
      NEW.role := 'user';
    END IF;

    IF public.is_service_role() THEN
      IF NEW.role NOT IN ('user', 'admin', 'super_admin') THEN
        NEW.role := 'user';
      END IF;
      RETURN NEW;
    END IF;

    -- Authenticated (and trigger-from-auth) inserts: force non-privileged role
    -- unless the caller is already an admin (rare admin-managed insert).
    IF NOT public.is_admin(auth.uid()) THEN
      NEW.role := 'user';
    ELSIF NEW.role NOT IN ('user', 'admin', 'super_admin') THEN
      NEW.role := 'user';
    END IF;

    RETURN NEW;
  END IF;

  -- UPDATE
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  IF public.is_service_role() THEN
    IF NEW.role IS NULL OR NEW.role NOT IN ('user', 'admin', 'super_admin') THEN
      RAISE EXCEPTION 'invalid profiles.role value'
        USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;

  IF public.is_admin(auth.uid()) THEN
    IF NEW.role IS NULL OR NEW.role NOT IN ('user', 'admin', 'super_admin') THEN
      RAISE EXCEPTION 'invalid profiles.role value'
        USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'profiles.role cannot be changed by non-admin users'
    USING ERRCODE = '42501';
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_profiles_role_guard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enforce_profiles_role_guard() TO service_role;

DROP TRIGGER IF EXISTS profiles_role_guard ON public.profiles;
CREATE TRIGGER profiles_role_guard
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profiles_role_guard();

-- ── user_consents ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  kvkk_accepted BOOLEAN NOT NULL DEFAULT false,
  cookies_accepted BOOLEAN NOT NULL DEFAULT false,
  marketing_accepted BOOLEAN NOT NULL DEFAULT false,
  sms_accepted BOOLEAN NOT NULL DEFAULT false,
  email_accepted BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_consents_user_id_created_at_idx
  ON public.user_consents (user_id, created_at DESC);

-- ── user_security_logs ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip_address TEXT,
  city TEXT,
  country TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_security_logs_user_id_created_at_idx
  ON public.user_security_logs (user_id, created_at DESC);

-- =============================================================================
-- RLS — profiles
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_manage" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_account_profile_owner(id, user_id) OR public.is_admin());

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_account_profile_owner(id, user_id)
    AND (role IS NULL OR role = 'user' OR public.is_admin())
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_account_profile_owner(id, user_id))
  WITH CHECK (public.is_account_profile_owner(id, user_id));
  -- role immutability enforced by profiles_role_guard trigger

CREATE POLICY "profiles_admin_all"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- RLS — user_consents (append-only for owners)
-- =============================================================================

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_consents_select_own" ON public.user_consents;
DROP POLICY IF EXISTS "user_consents_insert_own" ON public.user_consents;
DROP POLICY IF EXISTS "user_consents_update_own" ON public.user_consents;
DROP POLICY IF EXISTS "user_consents_delete_own" ON public.user_consents;
DROP POLICY IF EXISTS "user_consents_admin_all" ON public.user_consents;

CREATE POLICY "user_consents_select_own"
  ON public.user_consents
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_consents_insert_own"
  ON public.user_consents
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No owner UPDATE/DELETE — consent changes are new rows (audit trail).

-- =============================================================================
-- RLS — user_settings
-- =============================================================================

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_settings_select_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_insert_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_update_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_delete_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_admin_all" ON public.user_settings;

CREATE POLICY "user_settings_select_own"
  ON public.user_settings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_settings_insert_own"
  ON public.user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_settings_update_own"
  ON public.user_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_settings_admin_all"
  ON public.user_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- RLS — user_security_logs (append-only)
-- =============================================================================

ALTER TABLE public.user_security_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_security_logs_select_own" ON public.user_security_logs;
DROP POLICY IF EXISTS "user_security_logs_insert_own" ON public.user_security_logs;
DROP POLICY IF EXISTS "user_security_logs_update_own" ON public.user_security_logs;
DROP POLICY IF EXISTS "user_security_logs_delete_own" ON public.user_security_logs;
DROP POLICY IF EXISTS "user_security_logs_admin_all" ON public.user_security_logs;

CREATE POLICY "user_security_logs_select_own"
  ON public.user_security_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_security_logs_insert_own"
  ON public.user_security_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No owner UPDATE/DELETE policies — append-only audit log.

-- Defense-in-depth table privileges (PostgREST still needs grants for allowed ops)
REVOKE ALL ON TABLE public.user_security_logs FROM PUBLIC;
REVOKE ALL ON TABLE public.user_security_logs FROM anon;
GRANT SELECT, INSERT ON TABLE public.user_security_logs TO authenticated;
GRANT ALL ON TABLE public.user_security_logs TO service_role;

REVOKE ALL ON TABLE public.user_consents FROM PUBLIC;
REVOKE ALL ON TABLE public.user_consents FROM anon;
GRANT SELECT, INSERT ON TABLE public.user_consents TO authenticated;
GRANT ALL ON TABLE public.user_consents TO service_role;

REVOKE ALL ON TABLE public.user_settings FROM PUBLIC;
REVOKE ALL ON TABLE public.user_settings FROM anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_settings TO authenticated;
GRANT ALL ON TABLE public.user_settings TO service_role;

-- NOTE: This migration has not been applied / pushed.
