/*
  Add source URL reliability tracking for marketplace listings.
*/

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS source_url_status text NOT NULL DEFAULT 'unchecked',
  ADD COLUMN IF NOT EXISTS source_url_issue text;

CREATE INDEX IF NOT EXISTS idx_listings_source_url_status
  ON listings (source_url_status);

COMMENT ON COLUMN listings.source_url_status IS
  'Marketplace link reliability: valid, invalid, or unchecked';
COMMENT ON COLUMN listings.source_url_issue IS
  'Reason when source_url_status is invalid';
