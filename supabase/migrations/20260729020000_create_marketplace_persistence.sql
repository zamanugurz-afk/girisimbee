-- Sprint 4: marketplace profiles, companies, favorites, notifications, activities
-- Seed categories/listing types; fix FK constraints

-- ── Companies (must exist before profile/listing FK) ────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'TR',
  industry TEXT,
  employee_count TEXT,
  founded_year INT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_companies_slug_unique
  ON public.marketplace_companies (slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS marketplace_companies_owner_id_idx
  ON public.marketplace_companies (owner_id);
CREATE INDEX IF NOT EXISTS marketplace_companies_status_idx
  ON public.marketplace_companies (status);
CREATE INDEX IF NOT EXISTS marketplace_companies_city_idx
  ON public.marketplace_companies (city) WHERE city IS NOT NULL;

-- ── Domain profiles (separate from auth profiles table) ───────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.marketplace_companies(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  location TEXT,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'TR',
  website TEXT,
  linkedin_url TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  intents TEXT[] NOT NULL DEFAULT '{open}',
  visibility TEXT NOT NULL DEFAULT 'public',
  status TEXT NOT NULL DEFAULT 'draft',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  completeness_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_profiles_user_id_unique
  ON public.marketplace_profiles (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS marketplace_profiles_company_id_idx
  ON public.marketplace_profiles (company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS marketplace_profiles_status_idx
  ON public.marketplace_profiles (status);
CREATE INDEX IF NOT EXISTS marketplace_profiles_city_idx
  ON public.marketplace_profiles (city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS marketplace_profiles_intents_gin
  ON public.marketplace_profiles USING gin (intents);

-- ── Favorites ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_favorites_user_listing_unique
  ON public.marketplace_favorites (user_id, listing_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS marketplace_favorites_user_id_idx
  ON public.marketplace_favorites (user_id);
CREATE INDEX IF NOT EXISTS marketplace_favorites_listing_id_idx
  ON public.marketplace_favorites (listing_id);
CREATE INDEX IF NOT EXISTS marketplace_favorites_created_at_idx
  ON public.marketplace_favorites (created_at);

-- ── Notifications ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  entity_type TEXT,
  entity_id TEXT,
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS marketplace_notifications_user_created_idx
  ON public.marketplace_notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_notifications_user_status_idx
  ON public.marketplace_notifications (user_id, status);
CREATE INDEX IF NOT EXISTS marketplace_notifications_entity_idx
  ON public.marketplace_notifications (entity_type, entity_id)
  WHERE entity_id IS NOT NULL;

-- ── Activities (listing engine audit trail) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verb TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS marketplace_activities_created_at_idx
  ON public.marketplace_activities (created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_activities_entity_idx
  ON public.marketplace_activities (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS marketplace_activities_public_idx
  ON public.marketplace_activities (is_public, created_at DESC)
  WHERE is_public = true;
CREATE INDEX IF NOT EXISTS marketplace_activities_actor_id_idx
  ON public.marketplace_activities (actor_id) WHERE actor_id IS NOT NULL;

-- ── Fix FK constraints on existing tables ───────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_listings_company_id_fkey'
  ) THEN
    ALTER TABLE public.marketplace_listings
      ADD CONSTRAINT marketplace_listings_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES public.marketplace_companies(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_listing_tags_tag_id_fkey'
  ) THEN
    ALTER TABLE public.marketplace_listing_tags
      ADD CONSTRAINT marketplace_listing_tags_tag_id_fkey
      FOREIGN KEY (tag_id) REFERENCES public.marketplace_tags(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- ── Seed categories & listing types (deterministic IDs) ─────────────────────

INSERT INTO public.marketplace_categories (id, slug, name, accent_color, icon, sort_order, status)
VALUES
  ('c1000001-0001-4000-8000-000000000001', 'yatirim-bul', 'Yatırım Bul', '#6366F1', 'TrendingUp', 1, 'active'),
  ('c1000001-0001-4000-8000-000000000002', 'yatirim-yap', 'Yatırım Yap', '#8B5CF6', 'Wallet', 2, 'active'),
  ('c1000001-0001-4000-8000-000000000003', 'is-bul', 'İş Bul', '#0EA5E9', 'Briefcase', 3, 'active'),
  ('c1000001-0001-4000-8000-000000000004', 'ise-al', 'İşe Al', '#10B981', 'Users', 4, 'active'),
  ('c1000001-0001-4000-8000-000000000005', 'ortak-bul', 'Ortak Bul', '#F59E0B', 'Handshake', 5, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.marketplace_listing_types (id, category_id, slug, name, description, field_schema, sort_order, status)
VALUES
  ('lt000001-0001-4000-8000-000000000001', 'c1000001-0001-4000-8000-000000000001', 'yatirim-ariyorum', 'Yatırım Arıyorum', 'Girişiminiz için yatırımcı arayın',
   '{"fields":[{"key":"investmentAmount","label":"Yatırım Tutarı","type":"currency","required":true,"min":0},{"key":"equityOffered","label":"Sunulan Hisse (%)","type":"percentage","required":true,"min":0,"max":100},{"key":"stage","label":"Yatırım Aşaması","type":"enum","required":true,"options":["Pre-seed","Seed","Series A","Series B","Series C+"]},{"key":"minInvestment","label":"Minimum Yatırım","type":"currency","min":0},{"key":"maxInvestment","label":"Maksimum Yatırım","type":"currency","min":0},{"key":"currency","label":"Para Birimi","type":"enum","required":true,"options":["TRY","USD","EUR"]}]}', 1, 'active'),
  ('lt000001-0001-4000-8000-000000000002', 'c1000001-0001-4000-8000-000000000002', 'yatirim-yapiyorum', 'Yatırım Yapıyorum', 'Yatırım yapmak isteyen profil',
   '{"fields":[{"key":"investmentAmount","label":"Yatırım Tutarı","type":"currency","required":true,"min":0},{"key":"equityOffered","label":"Sunulan Hisse (%)","type":"percentage","required":true,"min":0,"max":100},{"key":"stage","label":"Yatırım Aşaması","type":"enum","required":true,"options":["Pre-seed","Seed","Series A","Series B","Series C+"]},{"key":"minInvestment","label":"Minimum Yatırım","type":"currency","min":0},{"key":"maxInvestment","label":"Maksimum Yatırım","type":"currency","min":0},{"key":"currency","label":"Para Birimi","type":"enum","required":true,"options":["TRY","USD","EUR"]}]}', 1, 'active'),
  ('lt000001-0001-4000-8000-000000000003', 'c1000001-0001-4000-8000-000000000003', 'is-ariyorum', 'İş Arıyorum', 'Kariyer fırsatı arayan profil',
   '{"fields":[{"key":"desiredRole","label":"Aranan Pozisyon","type":"string","required":true},{"key":"experienceYears","label":"Deneyim (Yıl)","type":"number","required":true,"min":0,"max":50},{"key":"salaryExpectation","label":"Maaş Beklentisi","type":"currency","min":0},{"key":"workType","label":"Çalışma Tipi","type":"enum","required":true,"options":["Tam zamanlı","Yarı zamanlı","Proje bazlı","Staj"]},{"key":"remotePreference","label":"Uzaktan Çalışma","type":"enum","options":["Ofis","Hibrit","Uzaktan"]}]}', 1, 'active'),
  ('lt000001-0001-4000-8000-000000000004', 'c1000001-0001-4000-8000-000000000004', 'ise-aliyorum', 'İşe Alıyorum', 'Ekibinize yetenek arayın',
   '{"fields":[{"key":"salaryMin","label":"Minimum Maaş","type":"currency","min":0},{"key":"salaryMax","label":"Maksimum Maaş","type":"currency","min":0},{"key":"workType","label":"Çalışma Tipi","type":"enum","required":true,"options":["Tam zamanlı","Yarı zamanlı","Sözleşmeli","Staj"]},{"key":"experienceLevel","label":"Deneyim Seviyesi","type":"enum","options":["Junior","Mid","Senior","Lead","Director"]},{"key":"currency","label":"Para Birimi","type":"enum","required":true,"options":["TRY","USD","EUR"]}]}', 1, 'active'),
  ('lt000001-0001-4000-8000-000000000005', 'c1000001-0001-4000-8000-000000000005', 'ortak-ariyorum', 'Ortak Arıyorum', 'Kurucu veya iş ortağı arayın',
   '{"fields":[{"key":"partnershipType","label":"Ortaklık Tipi","type":"enum","required":true,"options":["Teknik Ortak","İş Ortağı","Kurucu Ortak","Danışman"]},{"key":"equityOffered","label":"Sunulan Hisse (%)","type":"percentage","min":0,"max":100},{"key":"commitment","label":"Taahhüt","type":"enum","options":["Tam zamanlı","Yarı zamanlı","Danışmanlık"]},{"key":"requiredSkills","label":"Aranan Yetenekler","type":"string"}]}', 1, 'active')
ON CONFLICT (id) DO NOTHING;

-- ── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE public.marketplace_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listing_tags ENABLE ROW LEVEL SECURITY;

-- Companies
CREATE POLICY "marketplace_companies_public_read"
  ON public.marketplace_companies FOR SELECT TO anon, authenticated
  USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "marketplace_companies_owner_all"
  ON public.marketplace_companies FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Profiles
CREATE POLICY "marketplace_profiles_public_read"
  ON public.marketplace_profiles FOR SELECT TO anon, authenticated
  USING (status = 'published' AND deleted_at IS NULL AND visibility = 'public');

CREATE POLICY "marketplace_profiles_owner_all"
  ON public.marketplace_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Favorites
CREATE POLICY "marketplace_favorites_owner_all"
  ON public.marketplace_favorites FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE POLICY "marketplace_notifications_owner_all"
  ON public.marketplace_notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Activities
CREATE POLICY "marketplace_activities_public_read"
  ON public.marketplace_activities FOR SELECT TO anon, authenticated
  USING (is_public = true AND deleted_at IS NULL);

CREATE POLICY "marketplace_activities_authenticated_read"
  ON public.marketplace_activities FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "marketplace_activities_authenticated_insert"
  ON public.marketplace_activities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id OR actor_id IS NULL);

-- Listing tags junction
CREATE POLICY "marketplace_listing_tags_public_read"
  ON public.marketplace_listing_tags FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "marketplace_listing_tags_owner_write"
  ON public.marketplace_listing_tags FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.marketplace_listings l
    WHERE l.id = listing_id AND l.owner_id = auth.uid()
  ));

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.set_marketplace_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'marketplace_companies',
    'marketplace_profiles',
    'marketplace_favorites',
    'marketplace_notifications',
    'marketplace_activities'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE TRIGGER %I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at()',
      tbl, tbl
    );
  END LOOP;
END $$;
