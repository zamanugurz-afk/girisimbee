-- Faz 1: Ana sayfa yerleşim paketleri altyapısı (Vitrin / Hızlı Erişim)
-- Additive only — does not delete listings, users, or listing content.
-- Backfills legacy is_featured / is_urgent into placements, then re-syncs listing flags.

-- ── Enum extensions ─────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TYPE public.marketplace_payment_provider ADD VALUE IF NOT EXISTS 'simulated';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE public.marketplace_payment_purpose ADD VALUE IF NOT EXISTS 'listing_placement';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Catalog: placement metadata columns ─────────────────────────────────────

ALTER TABLE public.marketplace_listing_package_catalog
  ADD COLUMN IF NOT EXISTS package_kind TEXT;

ALTER TABLE public.marketplace_listing_package_catalog
  ADD COLUMN IF NOT EXISTS featured_listing BOOLEAN;

ALTER TABLE public.marketplace_listing_package_catalog
  ADD COLUMN IF NOT EXISTS urgent_listing BOOLEAN;

UPDATE public.marketplace_listing_package_catalog
SET package_kind = COALESCE(package_kind, 'publish_quota')
WHERE package_kind IS NULL;

UPDATE public.marketplace_listing_package_catalog
SET featured_listing = COALESCE(featured_listing, false)
WHERE featured_listing IS NULL;

UPDATE public.marketplace_listing_package_catalog
SET urgent_listing = COALESCE(urgent_listing, false)
WHERE urgent_listing IS NULL;

ALTER TABLE public.marketplace_listing_package_catalog
  ALTER COLUMN package_kind SET DEFAULT 'publish_quota',
  ALTER COLUMN package_kind SET NOT NULL,
  ALTER COLUMN featured_listing SET DEFAULT false,
  ALTER COLUMN featured_listing SET NOT NULL,
  ALTER COLUMN urgent_listing SET DEFAULT false,
  ALTER COLUMN urgent_listing SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE public.marketplace_listing_package_catalog
    ADD CONSTRAINT marketplace_listing_package_catalog_kind_check
    CHECK (package_kind IN ('publish_quota', 'homepage_placement'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.marketplace_listing_package_catalog.package_kind IS
  'publish_quota = ilan yayın hakkı; homepage_placement = Öne Çıkan / Acil yerleşimi';
COMMENT ON COLUMN public.marketplace_listing_package_catalog.featured_listing IS
  'homepage_placement: Öne Çıkan İlanlar bölümüne yerleştirir';
COMMENT ON COLUMN public.marketplace_listing_package_catalog.urgent_listing IS
  'homepage_placement: Acil İlanlar bölümüne yerleştirir';

-- Seed homepage placement packages (prices in kuruş)
INSERT INTO public.marketplace_listing_package_catalog (
  slug, name, description, price_cents, credits, duration_days, sort_order, status,
  package_kind, featured_listing, urgent_listing
)
SELECT v.slug, v.name, v.description, v.price_cents, v.credits, v.duration_days, v.sort_order, v.status,
       v.package_kind, v.featured_listing, v.urgent_listing
FROM (VALUES
  (
    'vitrin',
    'Vitrin Paketi',
    'Ana sayfa Öne Çıkan İlanlar bölümünde 30 gün gösterim',
    2900,
    NULL::INT,
    30,
    10,
    'active',
    'homepage_placement',
    true,
    false
  ),
  (
    'hizli_erisim',
    'Acil Vitrin Paketi',
    'Ana sayfa Acil İlanlar bölümünde 30 gün gösterim',
    3900,
    NULL::INT,
    30,
    11,
    'active',
    'homepage_placement',
    false,
    true
  )
) AS v(
  slug, name, description, price_cents, credits, duration_days, sort_order, status,
  package_kind, featured_listing, urgent_listing
)
WHERE NOT EXISTS (
  SELECT 1 FROM public.marketplace_listing_package_catalog c WHERE c.slug = v.slug
);

-- Keep known publish packages as publish_quota (idempotent)
UPDATE public.marketplace_listing_package_catalog
SET package_kind = 'publish_quota'
WHERE slug IN ('free', 'single_listing', 'monthly_unlimited', 'company_package')
  AND package_kind IS DISTINCT FROM 'publish_quota';

-- ── Placements table (source of truth for paid homepage slots) ───────────────

CREATE TABLE IF NOT EXISTS public.marketplace_listing_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  package_slug TEXT NOT NULL REFERENCES public.marketplace_listing_package_catalog(slug),
  featured_listing BOOLEAN NOT NULL DEFAULT false,
  urgent_listing BOOLEAN NOT NULL DEFAULT false,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  payment_id UUID REFERENCES public.marketplace_payments(id) ON DELETE SET NULL,
  payment_status public.marketplace_payment_status NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_listing_placements_ends_after_starts
    CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS marketplace_listing_placements_listing_id_idx
  ON public.marketplace_listing_placements (listing_id);

CREATE INDEX IF NOT EXISTS marketplace_listing_placements_active_idx
  ON public.marketplace_listing_placements (status, ends_at)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS marketplace_listing_placements_package_slug_idx
  ON public.marketplace_listing_placements (package_slug);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_listing_placements_active_unique
  ON public.marketplace_listing_placements (listing_id, package_slug)
  WHERE status IN ('pending', 'active');

COMMENT ON TABLE public.marketplace_listing_placements IS
  'Paid homepage placement entitlements (Vitrin / Hızlı Erişim). Listing flags are denormalized for browse queries.';

DROP TRIGGER IF EXISTS marketplace_listing_placements_updated_at
  ON public.marketplace_listing_placements;
CREATE TRIGGER marketplace_listing_placements_updated_at
  BEFORE UPDATE ON public.marketplace_listing_placements
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.marketplace_listing_placements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_listing_placements_public_active_read
  ON public.marketplace_listing_placements;
CREATE POLICY marketplace_listing_placements_public_active_read
  ON public.marketplace_listing_placements FOR SELECT TO anon, authenticated
  USING (status = 'active' AND ends_at > now());

DROP POLICY IF EXISTS marketplace_listing_placements_owner_read
  ON public.marketplace_listing_placements;
CREATE POLICY marketplace_listing_placements_owner_read
  ON public.marketplace_listing_placements FOR SELECT TO authenticated
  USING (public.can_manage_listing(listing_id));

DROP POLICY IF EXISTS marketplace_listing_placements_owner_insert
  ON public.marketplace_listing_placements;
CREATE POLICY marketplace_listing_placements_owner_insert
  ON public.marketplace_listing_placements FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_listing(listing_id));

DROP POLICY IF EXISTS marketplace_listing_placements_owner_update
  ON public.marketplace_listing_placements;
CREATE POLICY marketplace_listing_placements_owner_update
  ON public.marketplace_listing_placements FOR UPDATE TO authenticated
  USING (public.can_manage_listing(listing_id))
  WITH CHECK (public.can_manage_listing(listing_id));

DROP POLICY IF EXISTS marketplace_listing_placements_admin_all
  ON public.marketplace_listing_placements;
CREATE POLICY marketplace_listing_placements_admin_all
  ON public.marketplace_listing_placements FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Backfill legacy flags → placements, then re-sync listing denormalized flags ─
-- Schema: package_slug vitrin|hizli_erisim, ends_at = expiration, unique (listing_id, package_slug) active/pending.

INSERT INTO public.marketplace_listing_placements (
  listing_id, package_slug, featured_listing, urgent_listing,
  starts_at, ends_at, payment_status, status
)
SELECT
  l.id, 'vitrin', true, false,
  now(),
  COALESCE(l.featured_until, now() + interval '30 days'),
  'succeeded',
  'active'
FROM public.marketplace_listings l
WHERE l.deleted_at IS NULL
  AND l.is_featured = true
  AND COALESCE(l.featured_until, now() + interval '30 days') > now()
  AND NOT EXISTS (
    SELECT 1 FROM public.marketplace_listing_placements p
    WHERE p.listing_id = l.id
      AND p.package_slug = 'vitrin'
      AND p.status IN ('pending', 'active')
  );

INSERT INTO public.marketplace_listing_placements (
  listing_id, package_slug, featured_listing, urgent_listing,
  starts_at, ends_at, payment_status, status
)
SELECT
  l.id, 'hizli_erisim', false, true,
  now(),
  COALESCE(l.urgent_until, now() + interval '30 days'),
  'succeeded',
  'active'
FROM public.marketplace_listings l
WHERE l.deleted_at IS NULL
  AND l.is_urgent = true
  AND COALESCE(l.urgent_until, now() + interval '30 days') > now()
  AND NOT EXISTS (
    SELECT 1 FROM public.marketplace_listing_placements p
    WHERE p.listing_id = l.id
      AND p.package_slug = 'hizli_erisim'
      AND p.status IN ('pending', 'active')
  );

UPDATE public.marketplace_listings
SET
  is_featured = false,
  is_urgent = false,
  featured_until = NULL,
  urgent_until = NULL,
  updated_at = now()
WHERE is_featured = true
   OR is_urgent = true
   OR featured_until IS NOT NULL
   OR urgent_until IS NOT NULL;

UPDATE public.marketplace_listings l
SET
  is_featured = EXISTS (
    SELECT 1 FROM public.marketplace_listing_placements p
    WHERE p.listing_id = l.id AND p.status = 'active'
      AND p.featured_listing AND p.ends_at > now()
  ),
  is_urgent = EXISTS (
    SELECT 1 FROM public.marketplace_listing_placements p
    WHERE p.listing_id = l.id AND p.status = 'active'
      AND p.urgent_listing AND p.ends_at > now()
  ),
  featured_until = (
    SELECT MAX(p.ends_at) FROM public.marketplace_listing_placements p
    WHERE p.listing_id = l.id AND p.status = 'active'
      AND p.featured_listing AND p.ends_at > now()
  ),
  urgent_until = (
    SELECT MAX(p.ends_at) FROM public.marketplace_listing_placements p
    WHERE p.listing_id = l.id AND p.status = 'active'
      AND p.urgent_listing AND p.ends_at > now()
  ),
  updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM public.marketplace_listing_placements p
  WHERE p.listing_id = l.id AND p.package_slug IN ('vitrin', 'hizli_erisim')
);
