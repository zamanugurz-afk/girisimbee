/*
  Structured product intelligence columns for listings.
  Complements legacy product_family / edition / storage fields.
*/

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS platform text,
  ADD COLUMN IF NOT EXISTS generation text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS color text;

CREATE INDEX IF NOT EXISTS idx_listings_generation ON listings (generation);
CREATE INDEX IF NOT EXISTS idx_listings_platform ON listings (platform);
CREATE INDEX IF NOT EXISTS idx_listings_brand ON listings (brand);

COMMENT ON COLUMN listings.brand IS 'Canonical brand: SONY, MICROSOFT, UNKNOWN';
COMMENT ON COLUMN listings.platform IS 'Platform: PLAYSTATION, XBOX, UNKNOWN';
COMMENT ON COLUMN listings.generation IS 'Generation: PS5, PS5_SLIM, SERIES_X, DUALSENSE, etc.';
COMMENT ON COLUMN listings.model IS 'Model variant: BASE, SLIM, PRO, STANDARD, ELITE, UNKNOWN';
COMMENT ON COLUMN listings.color IS 'Normalized color: BLACK, WHITE, RED, etc.';
