-- Marketplace settings + listing package entitlements

CREATE TABLE IF NOT EXISTS public.marketplace_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  free_listing_limit INT NOT NULL DEFAULT 100,
  current_published_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.marketplace_settings (id, free_listing_limit, current_published_count)
VALUES ('global', 100, 0)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.marketplace_listing_package_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL DEFAULT 0,
  credits INT,
  duration_days INT,
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_listing_package_catalog_slug_unique
  ON public.marketplace_listing_package_catalog (slug);

INSERT INTO public.marketplace_listing_package_catalog (slug, name, description, price_cents, credits, duration_days, sort_order)
SELECT v.slug, v.name, v.description, v.price_cents, v.credits, v.duration_days, v.sort_order
FROM (VALUES
  ('free', 'Ücretsiz', 'Platform genelindeki ücretsiz ilan kotası', 0, NULL::INT, NULL::INT, 0),
  ('single_listing', 'Tek İlan', 'Tek ilan yayınlama hakkı', 9900, 1, NULL::INT, 1),
  ('monthly_unlimited', 'Aylık Sınırsız', '30 gün boyunca sınırsız ilan', 49900, NULL::INT, 30, 2),
  ('company_package', 'Şirket Paketi', 'Şirket hesabı için 30 gün sınırsız ilan', 99900, NULL::INT, 30, 3)
) AS v(slug, name, description, price_cents, credits, duration_days, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.marketplace_listing_package_catalog c WHERE c.slug = v.slug
);

CREATE TABLE IF NOT EXISTS public.marketplace_user_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID,
  package_slug TEXT NOT NULL REFERENCES public.marketplace_listing_package_catalog(slug),
  credits_remaining INT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'consumed', 'revoked')),
  granted_by TEXT NOT NULL DEFAULT 'admin' CHECK (granted_by IN ('admin', 'payment')),
  consumed_listing_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketplace_user_packages_user_id_idx ON public.marketplace_user_packages (user_id);
CREATE INDEX IF NOT EXISTS marketplace_user_packages_company_id_idx ON public.marketplace_user_packages (company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS marketplace_user_packages_status_idx ON public.marketplace_user_packages (status);

ALTER TABLE public.marketplace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listing_package_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_user_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_settings_public_read ON public.marketplace_settings;
CREATE POLICY marketplace_settings_public_read ON public.marketplace_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS marketplace_settings_admin_write ON public.marketplace_settings;
CREATE POLICY marketplace_settings_admin_write ON public.marketplace_settings
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS marketplace_package_catalog_public_read ON public.marketplace_listing_package_catalog;
CREATE POLICY marketplace_package_catalog_public_read ON public.marketplace_listing_package_catalog
  FOR SELECT TO anon, authenticated USING (status = 'active');

DROP POLICY IF EXISTS marketplace_package_catalog_admin_write ON public.marketplace_listing_package_catalog;
CREATE POLICY marketplace_package_catalog_admin_write ON public.marketplace_listing_package_catalog
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS marketplace_user_packages_owner_read ON public.marketplace_user_packages;
CREATE POLICY marketplace_user_packages_owner_read ON public.marketplace_user_packages
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS marketplace_user_packages_admin_all ON public.marketplace_user_packages;
CREATE POLICY marketplace_user_packages_admin_all ON public.marketplace_user_packages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS marketplace_settings_updated_at ON public.marketplace_settings;
CREATE TRIGGER marketplace_settings_updated_at
  BEFORE UPDATE ON public.marketplace_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();

DROP TRIGGER IF EXISTS marketplace_user_packages_updated_at ON public.marketplace_user_packages;
CREATE TRIGGER marketplace_user_packages_updated_at
  BEFORE UPDATE ON public.marketplace_user_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();
