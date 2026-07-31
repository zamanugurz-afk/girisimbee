-- Minimal bootstrap for P0 ecosystem migration verification (pg-mem / local smoke tests)
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (id UUID PRIMARY KEY);

CREATE SCHEMA IF NOT EXISTS storage;
CREATE TABLE IF NOT EXISTS storage.buckets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  public BOOLEAN NOT NULL DEFAULT false,
  file_size_limit BIGINT,
  allowed_mime_types TEXT[]
);

CREATE OR REPLACE FUNCTION public.is_admin(uid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT false;
$$;

CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  accent_color TEXT NOT NULL DEFAULT '#000000',
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  listing_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.marketplace_listing_types (
  id UUID PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.marketplace_categories(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  field_schema JSONB NOT NULL DEFAULT '{"fields":[]}',
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.marketplace_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.marketplace_company_members (
  company_id UUID NOT NULL REFERENCES public.marketplace_companies(id),
  user_id UUID NOT NULL,
  PRIMARY KEY (company_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.marketplace_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  username TEXT,
  display_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  visibility TEXT NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID REFERENCES public.marketplace_companies(id),
  category_id UUID NOT NULL REFERENCES public.marketplace_categories(id),
  listing_type_id UUID NOT NULL REFERENCES public.marketplace_listing_types(id),
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  location TEXT,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'TR',
  remote_policy TEXT,
  custom_fields JSONB NOT NULL DEFAULT '{}',
  view_count INT NOT NULL DEFAULT 0,
  interested_count INT NOT NULL DEFAULT 0,
  application_count INT NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  featured_until TIMESTAMPTZ,
  urgent_until TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.marketplace_listing_package_catalog (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL DEFAULT 0,
  credits INT NOT NULL DEFAULT 0,
  duration_days INT,
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO auth.users (id) VALUES ('00000000-0000-4000-8000-000000000001') ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_categories (id, slug, name, accent_color, sort_order)
VALUES
  ('c1000001-0001-4000-8000-000000000001', 'yatirim-bul', 'Yatirim Bul', '#3B82F6', 1),
  ('c1000001-0001-4000-8000-000000000002', 'yatirim-yap', 'Yatirim Yap', '#8B5CF6', 2),
  ('c1000001-0001-4000-8000-000000000003', 'is-bul', 'Is Bul', '#10B981', 3),
  ('c1000001-0001-4000-8000-000000000004', 'ise-al', 'Ise Al', '#F59E0B', 4),
  ('c1000001-0001-4000-8000-000000000005', 'ortak-bul', 'Ortak Bul', '#6366F1', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.marketplace_listing_types (id, category_id, slug, name)
VALUES ('a1000001-0001-4000-8000-000000000001', 'c1000001-0001-4000-8000-000000000001', 'default', 'Default')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.marketplace_listing_package_catalog (slug, name, price_cents, credits)
VALUES ('unlock-candidate', 'Aday Kilidi Ac', 9900, 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.marketplace_profiles (id, user_id, display_name, status, visibility)
VALUES ('b0000001-0001-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Test User', 'published', 'public')
ON CONFLICT (id) DO NOTHING;
