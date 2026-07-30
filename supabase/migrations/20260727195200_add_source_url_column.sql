/*
# Add source_url to listings

Stores the canonical external provider URL (Sahibinden, Letgo, Dolap).
Backfills from the existing url column for rows synced before this migration.
*/

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS source_url text;

UPDATE listings
SET source_url = url
WHERE source_url IS NULL OR source_url = '';

CREATE INDEX IF NOT EXISTS idx_listings_source_url ON listings (source_url)
  WHERE source_url IS NOT NULL AND source_url <> '';
