-- P4: Franchise package catalog, entitlements, coupons + payment purpose

DO $$ BEGIN
  ALTER TYPE public.marketplace_payment_purpose ADD VALUE IF NOT EXISTS 'franchise_package';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.franchise_packages (
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

CREATE UNIQUE INDEX IF NOT EXISTS franchise_packages_slug_unique
  ON public.franchise_packages (slug);

INSERT INTO public.franchise_packages (
  slug, package_name, package_type, package_price, package_duration, listing_limit,
  featured_listing, urgent_listing, homepage_visibility, badge_visibility, active_status, sort_order
)
SELECT v.slug, v.package_name, v.package_type, v.package_price, v.package_duration, v.listing_limit,
  v.featured_listing, v.urgent_listing, v.homepage_visibility, v.badge_visibility, v.active_status, v.sort_order
FROM (VALUES
  ('standard', 'Standart Paket', 'standard', 29900, 30, 3, false, false, false, false, true, 1),
  ('professional', 'Profesyonel Paket', 'professional', 59900, 60, 10, false, false, false, true, true, 2),
  ('featured', 'Öne Çıkan Paket', 'featured', 99900, 30, 5, true, false, true, true, true, 3),
  ('urgent', 'Acil Paket', 'urgent', 79900, 14, 5, false, true, false, true, true, 4)
) AS v(slug, package_name, package_type, package_price, package_duration, listing_limit,
  featured_listing, urgent_listing, homepage_visibility, badge_visibility, active_status, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.franchise_packages fp WHERE fp.slug = v.slug);

CREATE TABLE IF NOT EXISTS public.franchise_user_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_slug TEXT NOT NULL REFERENCES public.franchise_packages(slug),
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

CREATE INDEX IF NOT EXISTS franchise_user_packages_user_id_idx
  ON public.franchise_user_packages (user_id);
CREATE INDEX IF NOT EXISTS franchise_user_packages_status_idx
  ON public.franchise_user_packages (status);

CREATE TABLE IF NOT EXISTS public.franchise_coupons (
  code TEXT PRIMARY KEY,
  discount_percent INT CHECK (discount_percent IS NULL OR (discount_percent > 0 AND discount_percent <= 100)),
  discount_cents INT CHECK (discount_cents IS NULL OR discount_cents >= 0),
  valid_package_slugs TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.franchise_coupons (code, discount_percent, valid_package_slugs, active)
SELECT v.code, v.discount_percent, v.valid_package_slugs, v.active
FROM (VALUES
  ('FRANCHISE10', 10, NULL::TEXT[], true),
  ('PRO20', 20, ARRAY['professional']::TEXT[], true)
) AS v(code, discount_percent, valid_package_slugs, active)
WHERE NOT EXISTS (SELECT 1 FROM public.franchise_coupons c WHERE c.code = v.code);

ALTER TABLE public.franchise_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchise_user_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchise_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY franchise_packages_public_read ON public.franchise_packages
  FOR SELECT TO anon, authenticated USING (active_status = true);

CREATE POLICY franchise_packages_admin_write ON public.franchise_packages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY franchise_user_packages_owner_read ON public.franchise_user_packages
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY franchise_user_packages_admin_all ON public.franchise_user_packages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY franchise_coupons_public_read ON public.franchise_coupons
  FOR SELECT TO anon, authenticated USING (active = true);

DROP TRIGGER IF EXISTS franchise_packages_updated_at ON public.franchise_packages;
CREATE TRIGGER franchise_packages_updated_at
  BEFORE UPDATE ON public.franchise_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();

DROP TRIGGER IF EXISTS franchise_user_packages_updated_at ON public.franchise_user_packages;
CREATE TRIGGER franchise_user_packages_updated_at
  BEFORE UPDATE ON public.franchise_user_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();
