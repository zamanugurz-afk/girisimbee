-- P0: Subcategories + franchise category seeds

-- Extend categories with module_key
ALTER TABLE public.marketplace_categories
  ADD COLUMN IF NOT EXISTS module_key public.marketplace_module_key;

UPDATE public.marketplace_categories SET module_key = 'entrepreneurs'
  WHERE slug = 'yatirim-bul' AND module_key IS NULL;
UPDATE public.marketplace_categories SET module_key = 'investors'
  WHERE slug = 'yatirim-yap' AND module_key IS NULL;
UPDATE public.marketplace_categories SET module_key = 'candidates'
  WHERE slug = 'is-bul' AND module_key IS NULL;
UPDATE public.marketplace_categories SET module_key = 'employers'
  WHERE slug = 'ise-al' AND module_key IS NULL;
UPDATE public.marketplace_categories SET module_key = 'founders'
  WHERE slug = 'ortak-bul' AND module_key IS NULL;

-- ── Subcategories ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.marketplace_categories(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  status public.marketplace_subcategory_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_subcategories_category_slug_unique
  ON public.marketplace_subcategories (category_id, slug)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_subcategories_category_id_idx
  ON public.marketplace_subcategories (category_id);

-- ── Franchise category (6th module) ─────────────────────────────────────────

INSERT INTO public.marketplace_categories (
  id, slug, name, description, accent_color, icon, sort_order, status, module_key
)
VALUES (
  'c1000001-0001-4000-8000-000000000006',
  'franchise',
  'Franchise',
  'Bayilik al veya bayilik ver',
  '#EC4899',
  'Store',
  6,
  'active',
  'franchise'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  module_key = EXCLUDED.module_key,
  sort_order = EXCLUDED.sort_order;

-- Franchise subcategories
INSERT INTO public.marketplace_subcategories (
  id, category_id, slug, name, description, sort_order, status
)
VALUES
  (
    'a0000001-0001-4000-8000-000000000001',
    'c1000001-0001-4000-8000-000000000006',
    'franchise-buy',
    'Bayilik Al',
    'Franchise satın almak isteyenler',
    1,
    'active'
  ),
  (
    'a0000002-0001-4000-8000-000000000002',
    'c1000001-0001-4000-8000-000000000006',
    'franchise-give',
    'Bayilik Ver',
    'Franchise vermek isteyen markalar',
    2,
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- Franchise listing types (one per subcategory, shared field schema)
INSERT INTO public.marketplace_listing_types (
  id, category_id, slug, name, description, field_schema, sort_order, status
)
VALUES
  (
    'a0000006-0001-4000-8000-000000000006',
    'c1000001-0001-4000-8000-000000000006',
    'bayilik-al',
    'Bayilik Al',
    'Franchise fırsatı arayan ilan',
    '{"fields":[{"key":"franchiseFee","label":"Franchise Bedeli","type":"currency","required":true,"min":0},{"key":"investmentAmount","label":"Yatırım Tutarı","type":"currency","required":true,"min":0},{"key":"returnPeriodMonths","label":"Geri Dönüş Süresi (Ay)","type":"number","min":0},{"key":"sector","label":"Sektör","type":"string","required":true}]}',
    1,
    'active'
  ),
  (
    'a0000007-0001-4000-8000-000000000007',
    'c1000001-0001-4000-8000-000000000006',
    'bayilik-ver',
    'Bayilik Ver',
    'Franchise veren marka ilanı',
    '{"fields":[{"key":"franchiseFee","label":"Franchise Bedeli","type":"currency","required":true,"min":0},{"key":"investmentAmount","label":"Yatırım Tutarı","type":"currency","required":true,"min":0},{"key":"returnPeriodMonths","label":"Geri Dönüş Süresi (Ay)","type":"number","min":0},{"key":"sector","label":"Sektör","type":"string","required":true}]}',
    2,
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- updated_at trigger
DROP TRIGGER IF EXISTS marketplace_subcategories_updated_at ON public.marketplace_subcategories;
CREATE TRIGGER marketplace_subcategories_updated_at
  BEFORE UPDATE ON public.marketplace_subcategories
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();
