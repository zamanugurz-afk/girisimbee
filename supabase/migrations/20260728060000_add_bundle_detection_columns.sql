/*
  Bundle detection flags — bundle listings indexed separately from console-only products.
*/

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS is_bundle boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_listings_is_bundle ON listings (is_bundle);

COMMENT ON COLUMN listings.is_bundle IS 'True when listing includes extra bundled items (game, controller, accessory)';
COMMENT ON COLUMN listings.bundle_type IS 'CONSOLE_ONLY, GAME, CONTROLLER, ACCESSORY, or MIXED';
