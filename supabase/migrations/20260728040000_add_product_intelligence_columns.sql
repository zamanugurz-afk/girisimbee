/*
  Product Intelligence layer — normalized product fields on listings.
  Existing `condition` (scraper grade) is unchanged; item_condition stores NEW/LIKE_NEW/USED/UNKNOWN.
*/

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS product_family text,
  ADD COLUMN IF NOT EXISTS edition text,
  ADD COLUMN IF NOT EXISTS storage text,
  ADD COLUMN IF NOT EXISTS item_condition text,
  ADD COLUMN IF NOT EXISTS bundle_type text;

CREATE INDEX IF NOT EXISTS idx_listings_product_family ON listings (product_family);
CREATE INDEX IF NOT EXISTS idx_listings_edition ON listings (edition);

COMMENT ON COLUMN listings.product_family IS 'Canonical product family: PS5, PS5_SLIM, DUALSENSE, etc.';
COMMENT ON COLUMN listings.edition IS 'Console edition: DISC, DIGITAL, or UNKNOWN';
COMMENT ON COLUMN listings.storage IS 'Storage capacity: 825GB, 1TB, 2TB, or UNKNOWN';
COMMENT ON COLUMN listings.item_condition IS 'Normalized item condition: NEW, LIKE_NEW, USED, or UNKNOWN';
COMMENT ON COLUMN listings.bundle_type IS 'Bundle shape: CONSOLE_ONLY, CONSOLE_AND_CONTROLLER, or UNKNOWN';
