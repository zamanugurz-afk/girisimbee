-- P4: Entrepreneur package catalog, entitlements, coupons + payment purpose

DO $$ BEGIN
  ALTER TYPE public.marketplace_payment_purpose ADD VALUE IF NOT EXISTS 'entrepreneur_package';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.entrepreneur_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  package_name TEXT NOT NULL,
  package_type TEXT NOT NULL,
  package_price INT NOT NULL CHECK (package_price >= 0),
  package_duration INT NOT NULL CHECK (package_duration > 0),
  listing_limit INT NOT NULL CHECK (listing_limit > 0),
  featured_listing BOOLEAN NOT NULL DEFAULT false,
  urgent_listing BOOLEAN NOT NULL DEFAULT false,
  homepage_visibility BOOLEAN NOT NULL DEFAULT false,
  badge_visibility BOOLEAN NOT NULL DEFAULT false,
  active_status BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS entrepreneur_packages_slug_unique
  ON public.entrepreneur_packages (slug);

INSERT INTO public.entrepreneur_packages (
  slug, package_name, package_type, package_price, package_duration, listing_limit,
  featured_listing, urgent_listing, homepage_visibility, badge_visibility, active_status, sort_order
)
SELECT v.slug, v.package_name, v.package_type, v.package_price, v.package_duration, v.listing_limit,
  v.featured_listing, v.urgent_listing, v.homepage_visibility, v.badge_visibility, v.active_status, v.sort_order
FROM (VALUES
  ('standard', 'Standart Paket', 'standard', 19900, 30, 3, false, false, false, false, true, 1),
  ('professional', 'Profesyonel Paket', 'professional', 39900, 60, 10, false, false, false, true, true, 2),
  ('featured', 'Öne Çıkan Paket', 'featured', 69900, 30, 5, true, false, true, true, true, 3),
  ('urgent', 'Acil Paket', 'urgent', 54900, 14, 5, false, true, false, true, true, 4)
) AS v(slug, package_name, package_type, package_price, package_duration, listing_limit,
  featured_listing, urgent_listing, homepage_visibility, badge_visibility, active_status, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.entrepreneur_packages ep WHERE ep.slug = v.slug);

CREATE TABLE IF NOT EXISTS public.entrepreneur_user_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_slug TEXT NOT NULL REFERENCES public.entrepreneur_packages(slug),
  listings_used INT NOT NULL DEFAULT 0 CHECK (listings_used >= 0),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'suspended', 'cancelled', 'revoked')),
  granted_by TEXT NOT NULL DEFAULT 'admin'
    CHECK (granted_by IN ('admin', 'payment')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entrepreneur_user_packages_user_id_idx
  ON public.entrepreneur_user_packages (user_id);
CREATE INDEX IF NOT EXISTS entrepreneur_user_packages_status_idx
  ON public.entrepreneur_user_packages (status);

CREATE TABLE IF NOT EXISTS public.entrepreneur_coupons (
  code TEXT PRIMARY KEY,
  discount_percent INT CHECK (discount_percent IS NULL OR (discount_percent > 0 AND discount_percent <= 100)),
  discount_cents INT CHECK (discount_cents IS NULL OR discount_cents >= 0),
  valid_package_slugs TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.entrepreneur_coupons (code, discount_percent, valid_package_slugs, active)
SELECT v.code, v.discount_percent, v.valid_package_slugs, v.active
FROM (VALUES
  ('ENTREPRENEUR10', 10, NULL::TEXT[], true),
  ('PRO15', 15, ARRAY['professional']::TEXT[], true)
) AS v(code, discount_percent, valid_package_slugs, active)
WHERE NOT EXISTS (SELECT 1 FROM public.entrepreneur_coupons c WHERE c.code = v.code);

ALTER TABLE public.entrepreneur_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrepreneur_user_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrepreneur_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY entrepreneur_packages_public_read ON public.entrepreneur_packages
  FOR SELECT TO anon, authenticated USING (active_status = true);

CREATE POLICY entrepreneur_packages_admin_write ON public.entrepreneur_packages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY entrepreneur_user_packages_owner_read ON public.entrepreneur_user_packages
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY entrepreneur_user_packages_admin_all ON public.entrepreneur_user_packages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY entrepreneur_coupons_public_read ON public.entrepreneur_coupons
  FOR SELECT TO anon, authenticated USING (active = true);

DROP TRIGGER IF EXISTS entrepreneur_packages_updated_at ON public.entrepreneur_packages;
CREATE TRIGGER entrepreneur_packages_updated_at
  BEFORE UPDATE ON public.entrepreneur_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();

DROP TRIGGER IF EXISTS entrepreneur_user_packages_updated_at ON public.entrepreneur_user_packages;
CREATE TRIGGER entrepreneur_user_packages_updated_at
  BEFORE UPDATE ON public.entrepreneur_user_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();
