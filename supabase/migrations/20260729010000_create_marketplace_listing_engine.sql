-- Girisimco marketplace listing engine tables
-- Separate from İkinciBazar scraper listings table

CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  accent_color TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  listing_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_categories_slug_unique
  ON public.marketplace_categories (slug) WHERE deleted_at IS NULL;

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

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_listing_types_category_slug_unique
  ON public.marketplace_listing_types (category_id, slug) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID,
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
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_listings_slug_unique
  ON public.marketplace_listings (slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS marketplace_listings_owner_id_idx ON public.marketplace_listings (owner_id);
CREATE INDEX IF NOT EXISTS marketplace_listings_category_status_idx ON public.marketplace_listings (category_id, status);
CREATE INDEX IF NOT EXISTS marketplace_listings_custom_fields_gin ON public.marketplace_listings USING gin (custom_fields);

CREATE TABLE IF NOT EXISTS public.marketplace_listing_tags (
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (listing_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.marketplace_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  usage_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_tags_slug_unique
  ON public.marketplace_tags (slug) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.marketplace_listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketplace_listing_images_listing_id_idx
  ON public.marketplace_listing_images (listing_id);

CREATE TABLE IF NOT EXISTS public.marketplace_listing_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  uploaded_by_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  url TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready',
  sort_order INT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listing_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketplace_categories_public_read"
  ON public.marketplace_categories FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "marketplace_listing_types_public_read"
  ON public.marketplace_listing_types FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "marketplace_listings_public_read"
  ON public.marketplace_listings FOR SELECT TO anon, authenticated
  USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "marketplace_listings_owner_all"
  ON public.marketplace_listings FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "marketplace_tags_public_read"
  ON public.marketplace_tags FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "marketplace_listing_images_public_read"
  ON public.marketplace_listing_images FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "marketplace_listing_images_owner_write"
  ON public.marketplace_listing_images FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.marketplace_listings l
    WHERE l.id = listing_id AND l.owner_id = auth.uid()
  ));

CREATE POLICY "marketplace_listing_attachments_owner"
  ON public.marketplace_listing_attachments FOR ALL TO authenticated
  USING (uploaded_by_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.marketplace_listings l
    WHERE l.id = listing_id AND l.owner_id = auth.uid()
  ));
