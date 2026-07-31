-- P0: Extend marketplace_listings for ecosystem workflows + external contact

ALTER TABLE public.marketplace_listings
  ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES public.marketplace_subcategories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS module_key public.marketplace_module_key,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS anonymous_mode BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS workflow_status public.marketplace_workflow_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_website TEXT;

-- Backfill module_key from category
UPDATE public.marketplace_listings l
SET module_key = c.module_key
FROM public.marketplace_categories c
WHERE l.category_id = c.id AND l.module_key IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_listings_subcategory_id_idx
  ON public.marketplace_listings (subcategory_id)
  WHERE subcategory_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS marketplace_listings_module_key_status_idx
  ON public.marketplace_listings (module_key, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_listings_industry_idx
  ON public.marketplace_listings (industry)
  WHERE industry IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_listings_workflow_status_idx
  ON public.marketplace_listings (workflow_status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_listings_anonymous_mode_idx
  ON public.marketplace_listings (anonymous_mode)
  WHERE anonymous_mode = true AND deleted_at IS NULL;
