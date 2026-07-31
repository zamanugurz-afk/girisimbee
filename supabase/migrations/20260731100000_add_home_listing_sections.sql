-- Home module listing flags: featured expiry, urgent listings, browse indexes

ALTER TABLE public.marketplace_listings
  ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS urgent_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

COMMENT ON COLUMN public.marketplace_listings.is_urgent IS 'Marks listing as urgent for home UrgentListings section';
COMMENT ON COLUMN public.marketplace_listings.urgent_until IS 'Optional expiry for urgent badge; NULL = no expiry';
COMMENT ON COLUMN public.marketplace_listings.featured_until IS 'Optional expiry for featured placement; NULL = no expiry';

CREATE INDEX IF NOT EXISTS marketplace_listings_urgent_published_idx
  ON public.marketplace_listings (is_urgent, published_at DESC)
  WHERE is_urgent = true AND status = 'published' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_listings_published_today_idx
  ON public.marketplace_listings (published_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_listings_most_viewed_idx
  ON public.marketplace_listings (view_count DESC, published_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_listings_featured_active_idx
  ON public.marketplace_listings (is_featured, featured_until, published_at DESC)
  WHERE is_featured = true AND status = 'published' AND deleted_at IS NULL;
