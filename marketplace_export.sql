-- Consolidated schema repair: profiles, marketplace_profiles, marketplace_companies,
-- marketplace_listing_images, marketplace_favorites, marketplace_conversations,
-- marketplace_conversation_participants, marketplace_messages
-- Prerequisites: auth.users, public.marketplace_listings

-- ── shared functions ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_marketplace_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role                TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member', 'verified', 'company', 'moderator', 'admin')),
  display_name        TEXT,
  avatar_url          TEXT,
  email               TEXT,
  account_status      TEXT NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('pending', 'active', 'suspended', 'deactivated', 'deleted')),
  suspended_at        TIMESTAMPTZ,
  suspension_reason   TEXT,
  last_active_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_account_status_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_account_status_check
      CHECK (account_status IN ('pending', 'active', 'suspended', 'deactivated', 'deleted'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS profiles_role_idx
  ON public.profiles (role);

CREATE INDEX IF NOT EXISTS profiles_account_status_idx
  ON public.profiles (account_status);

CREATE INDEX IF NOT EXISTS profiles_last_active_at_idx
  ON public.profiles (last_active_at DESC NULLS LAST);

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
      AND role = 'admin'
  );
$$;

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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_manage" ON public.profiles;
CREATE POLICY "profiles_admin_manage"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profiles_updated_at();

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();

-- ── marketplace_companies ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_companies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL,
  logo_url          TEXT,
  cover_url         TEXT,
  description       TEXT,
  website           TEXT,
  linkedin_url      TEXT,
  twitter_url       TEXT,
  city              TEXT,
  location          TEXT,
  country           TEXT NOT NULL DEFAULT 'TR',
  industry          TEXT,
  employee_count    TEXT,
  founded_year      INT,
  contact_email     TEXT,
  is_verified       BOOLEAN NOT NULL DEFAULT false,
  website_verified  BOOLEAN NOT NULL DEFAULT false,
  email_verified    BOOLEAN NOT NULL DEFAULT false,
  status            TEXT NOT NULL DEFAULT 'draft',
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

ALTER TABLE public.marketplace_companies
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS website_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_companies_slug_unique
  ON public.marketplace_companies (slug)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_companies_slug_lower_unique
  ON public.marketplace_companies (lower(slug))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_companies_owner_id_idx
  ON public.marketplace_companies (owner_id);

CREATE INDEX IF NOT EXISTS marketplace_companies_status_idx
  ON public.marketplace_companies (status);

CREATE INDEX IF NOT EXISTS marketplace_companies_city_idx
  ON public.marketplace_companies (city)
  WHERE city IS NOT NULL;

ALTER TABLE public.marketplace_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_companies_public_read" ON public.marketplace_companies;
CREATE POLICY "marketplace_companies_public_read"
  ON public.marketplace_companies
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "marketplace_companies_owner_all" ON public.marketplace_companies;
CREATE POLICY "marketplace_companies_owner_all"
  ON public.marketplace_companies
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "marketplace_companies_admin_all" ON public.marketplace_companies;
CREATE POLICY "marketplace_companies_admin_all"
  ON public.marketplace_companies
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS marketplace_companies_updated_at ON public.marketplace_companies;
CREATE TRIGGER marketplace_companies_updated_at
  BEFORE UPDATE ON public.marketplace_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.set_marketplace_updated_at();

-- ── marketplace_profiles ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id          UUID REFERENCES public.marketplace_companies(id) ON DELETE SET NULL,
  username            TEXT,
  display_name        TEXT NOT NULL,
  headline            TEXT,
  bio                 TEXT,
  avatar_url          TEXT,
  cover_url           TEXT,
  location            TEXT,
  city                TEXT,
  country             TEXT NOT NULL DEFAULT 'TR',
  company_name        TEXT,
  position            TEXT,
  website             TEXT,
  linkedin_url        TEXT,
  twitter_url         TEXT,
  phone               TEXT,
  email               TEXT,
  email_visible       BOOLEAN NOT NULL DEFAULT false,
  phone_visible       BOOLEAN NOT NULL DEFAULT false,
  website_visible     BOOLEAN NOT NULL DEFAULT true,
  skills              TEXT[] NOT NULL DEFAULT '{}',
  intents             TEXT[] NOT NULL DEFAULT '{open}',
  visibility          TEXT NOT NULL DEFAULT 'public',
  status              TEXT NOT NULL DEFAULT 'draft',
  is_verified         BOOLEAN NOT NULL DEFAULT false,
  investor_verified   BOOLEAN NOT NULL DEFAULT false,
  completeness_score  INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ
);

ALTER TABLE public.marketplace_profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_visible BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_visible BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS website_visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS investor_verified BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_profiles_user_id_unique
  ON public.marketplace_profiles (user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_profiles_company_id_idx
  ON public.marketplace_profiles (company_id)
  WHERE company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS marketplace_profiles_status_idx
  ON public.marketplace_profiles (status);

CREATE INDEX IF NOT EXISTS marketplace_profiles_city_idx
  ON public.marketplace_profiles (city)
  WHERE city IS NOT NULL;

CREATE INDEX IF NOT EXISTS marketplace_profiles_intents_gin
  ON public.marketplace_profiles USING gin (intents);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_profiles_username_unique
  ON public.marketplace_profiles (lower(username))
  WHERE deleted_at IS NULL AND username IS NOT NULL;

CREATE INDEX IF NOT EXISTS marketplace_profiles_username_idx
  ON public.marketplace_profiles (username)
  WHERE deleted_at IS NULL AND username IS NOT NULL;

ALTER TABLE public.marketplace_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_profiles_public_read" ON public.marketplace_profiles;
CREATE POLICY "marketplace_profiles_public_read"
  ON public.marketplace_profiles
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND deleted_at IS NULL
    AND visibility = 'public'
  );

DROP POLICY IF EXISTS "marketplace_profiles_owner_all" ON public.marketplace_profiles;
CREATE POLICY "marketplace_profiles_owner_all"
  ON public.marketplace_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "marketplace_profiles_admin_all" ON public.marketplace_profiles;
CREATE POLICY "marketplace_profiles_admin_all"
  ON public.marketplace_profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS marketplace_profiles_updated_at ON public.marketplace_profiles;
CREATE TRIGGER marketplace_profiles_updated_at
  BEFORE UPDATE ON public.marketplace_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_marketplace_updated_at();

-- ── marketplace_listing_images ───────────────────────────────────────────────

DO $$
BEGIN
  IF to_regclass('public.marketplace_listings') IS NULL THEN
    RAISE EXCEPTION 'Missing prerequisite table: public.marketplace_listings';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.marketplace_listing_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketplace_listing_images_listing_id_idx
  ON public.marketplace_listing_images (listing_id);

ALTER TABLE public.marketplace_listing_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_listing_images_public_read" ON public.marketplace_listing_images;
CREATE POLICY "marketplace_listing_images_public_read"
  ON public.marketplace_listing_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "marketplace_listing_images_owner_write" ON public.marketplace_listing_images;
CREATE POLICY "marketplace_listing_images_owner_write"
  ON public.marketplace_listing_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.marketplace_listings l
      WHERE l.id = listing_id
        AND l.owner_id = auth.uid()
    )
  );

-- ── marketplace_favorites ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id  UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'active',
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_favorites_user_listing_unique
  ON public.marketplace_favorites (user_id, listing_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_favorites_user_id_idx
  ON public.marketplace_favorites (user_id);

CREATE INDEX IF NOT EXISTS marketplace_favorites_listing_id_idx
  ON public.marketplace_favorites (listing_id);

CREATE INDEX IF NOT EXISTS marketplace_favorites_created_at_idx
  ON public.marketplace_favorites (created_at);

ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_favorites_owner_all" ON public.marketplace_favorites;
CREATE POLICY "marketplace_favorites_owner_all"
  ON public.marketplace_favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS marketplace_favorites_updated_at ON public.marketplace_favorites;
CREATE TRIGGER marketplace_favorites_updated_at
  BEFORE UPDATE ON public.marketplace_favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.set_marketplace_updated_at();

-- ── marketplace_conversations ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_conversations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id            UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  company_id            UUID REFERENCES public.marketplace_companies(id) ON DELETE SET NULL,
  status                TEXT NOT NULL DEFAULT 'open',
  last_message_at       TIMESTAMPTZ,
  last_message_preview  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS marketplace_conversations_listing_id_idx
  ON public.marketplace_conversations (listing_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_conversations_company_id_idx
  ON public.marketplace_conversations (company_id)
  WHERE company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS marketplace_conversations_last_message_at_idx
  ON public.marketplace_conversations (last_message_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS marketplace_conversations_status_idx
  ON public.marketplace_conversations (status);

-- ── marketplace_conversation_participants ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_conversation_participants (
  conversation_id       UUID NOT NULL REFERENCES public.marketplace_conversations(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_message_id  UUID,
  last_read_at          TIMESTAMPTZ,
  is_muted              BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS marketplace_conversation_participants_user_id_idx
  ON public.marketplace_conversation_participants (user_id);

CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID, uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.marketplace_conversation_participants
    WHERE conversation_id = conv_id
      AND user_id = uid
  );
$$;

-- ── marketplace_messages ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES public.marketplace_conversations(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body              TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'sent',
  attachment_urls   JSONB NOT NULL DEFAULT '[]',
  read_at           TIMESTAMPTZ,
  edited_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ,
  CONSTRAINT marketplace_messages_body_length
    CHECK (char_length(body) >= 1 AND char_length(body) <= 5000)
);

CREATE INDEX IF NOT EXISTS marketplace_messages_conversation_created_idx
  ON public.marketplace_messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS marketplace_messages_sender_id_idx
  ON public.marketplace_messages (sender_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'marketplace_conversation_participants_last_read_fkey'
  ) THEN
    ALTER TABLE public.marketplace_conversation_participants
      ADD CONSTRAINT marketplace_conversation_participants_last_read_fkey
      FOREIGN KEY (last_read_message_id)
      REFERENCES public.marketplace_messages(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ── messaging RLS ─────────────────────────────────────────────────────────────

ALTER TABLE public.marketplace_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_conversations_participant_select" ON public.marketplace_conversations;
CREATE POLICY "marketplace_conversations_participant_select"
  ON public.marketplace_conversations
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND public.is_conversation_participant(id, auth.uid())
  );

DROP POLICY IF EXISTS "marketplace_conversations_participant_insert" ON public.marketplace_conversations;
CREATE POLICY "marketplace_conversations_participant_insert"
  ON public.marketplace_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "marketplace_conversations_participant_update" ON public.marketplace_conversations;
CREATE POLICY "marketplace_conversations_participant_update"
  ON public.marketplace_conversations
  FOR UPDATE
  TO authenticated
  USING (public.is_conversation_participant(id, auth.uid()));

DROP POLICY IF EXISTS "marketplace_conversation_participants_select" ON public.marketplace_conversation_participants;
CREATE POLICY "marketplace_conversation_participants_select"
  ON public.marketplace_conversation_participants
  FOR SELECT
  TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "marketplace_conversation_participants_insert" ON public.marketplace_conversation_participants;
CREATE POLICY "marketplace_conversation_participants_insert"
  ON public.marketplace_conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_conversation_participant(conversation_id, auth.uid())
  );

DROP POLICY IF EXISTS "marketplace_conversation_participants_update" ON public.marketplace_conversation_participants;
CREATE POLICY "marketplace_conversation_participants_update"
  ON public.marketplace_conversation_participants
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "marketplace_messages_participant_select" ON public.marketplace_messages;
CREATE POLICY "marketplace_messages_participant_select"
  ON public.marketplace_messages
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND public.is_conversation_participant(conversation_id, auth.uid())
  );

DROP POLICY IF EXISTS "marketplace_messages_participant_insert" ON public.marketplace_messages;
CREATE POLICY "marketplace_messages_participant_insert"
  ON public.marketplace_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_conversation_participant(conversation_id, auth.uid())
  );

DROP POLICY IF EXISTS "marketplace_messages_participant_update" ON public.marketplace_messages;
CREATE POLICY "marketplace_messages_participant_update"
  ON public.marketplace_messages
  FOR UPDATE
  TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "marketplace_messages_admin_select" ON public.marketplace_messages;
CREATE POLICY "marketplace_messages_admin_select"
  ON public.marketplace_messages
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ── messaging triggers + realtime ──────────────────────────────────────────────

DROP TRIGGER IF EXISTS marketplace_conversations_updated_at ON public.marketplace_conversations;
CREATE TRIGGER marketplace_conversations_updated_at
  BEFORE UPDATE ON public.marketplace_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_marketplace_updated_at();

DROP TRIGGER IF EXISTS marketplace_messages_updated_at ON public.marketplace_messages;
CREATE TRIGGER marketplace_messages_updated_at
  BEFORE UPDATE ON public.marketplace_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_marketplace_updated_at();

ALTER TABLE public.marketplace_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_messages;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
